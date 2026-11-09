'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import {
  isDeviceTrusted,
  getTrustedDevices,
  removeTrustedDevice,
  startDeviceVerification,
  verifyDeviceCode,
  generateDeviceFingerprint,
  parseUserAgent,
} from '@/lib/trusted-device';
import { hashIP } from '@/lib/utils/security';
import { safeRateLimit, twoFactorRateLimit } from '@/lib/redis';

// ============================================
// Helper to extract real IP
// ============================================
function extractIP(headersList: Headers): string {
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || 'unknown';
}

/**
 * Extract all fingerprint-relevant headers from request
 * Includes standard headers + Client Hints for enhanced device identification
 */
function extractFingerprintHeaders(headersList: Headers, userAgent: string) {
  return {
    userAgent,
    acceptLanguage: headersList.get('accept-language') || '',
    acceptEncoding: headersList.get('accept-encoding') || '',
    // Client Hints (sent by modern browsers for better device identification)
    secChUa: headersList.get('sec-ch-ua') || '',
    secChUaPlatform: headersList.get('sec-ch-ua-platform') || '',
    secChUaMobile: headersList.get('sec-ch-ua-mobile') || '',
  };
}

// ============================================
// Check Device Trust Status
// ============================================
export async function checkDeviceTrust(): Promise<{
  trusted: boolean;
  verificationRequired?: boolean;
  fingerprint?: string;
}> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { trusted: false };
    }

    const userAgent = headersList.get('user-agent') || '';
    // Use consistent fingerprint with all headers including Client Hints
    const fingerprint = generateDeviceFingerprint(
      extractFingerprintHeaders(headersList, userAgent)
    );

    const trusted = await isDeviceTrusted(session.user.id, fingerprint);

    return {
      trusted,
      verificationRequired: !trusted,
      fingerprint,
    };
  } catch (error) {
    console.error('[DEVICE] Error checking device trust:', error);
    return { trusted: false };
  }
}

// ============================================
// Start Device Verification
// ============================================
export async function startDeviceVerificationAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { success: false, error: 'Non authentifie' };
    }

    const userAgent = headersList.get('user-agent') || '';
    const clientIP = extractIP(headersList);
    // Use consistent fingerprint with all headers including Client Hints
    const fingerprint = generateDeviceFingerprint(
      extractFingerprintHeaders(headersList, userAgent)
    );
    const deviceInfo = parseUserAgent(userAgent);

    const result = await startDeviceVerification(
      session.user.id,
      session.user.email,
      fingerprint,
      {
        ...deviceInfo,
        ip: clientIP,
      }
    );

    if (!result.success) {
      return { success: false, error: result.message };
    }

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      resource: 'Session',
      resourceId: fingerprint,
      ip: clientIP,
      details: { action: 'Device verification started' },
    });

    return { success: true };
  } catch (error) {
    console.error('[DEVICE] Error starting verification:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

// ============================================
// Verify Device Code
// ============================================
export async function verifyDeviceCodeAction(
  code: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const headersList = await headers();
    const clientIP = extractIP(headersList);
    const ipHash = hashIP(clientIP);

    // Rate limit verification attempts
    const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, `device:${ipHash}`);
    if (!limitSuccess) {
      return { success: false, error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
    }

    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { success: false, error: 'Non authentifie' };
    }

    const userAgent = headersList.get('user-agent') || '';
    // Use consistent fingerprint with all headers including Client Hints
    const fingerprint = generateDeviceFingerprint(
      extractFingerprintHeaders(headersList, userAgent)
    );

    const result = await verifyDeviceCode(
      session.user.id,
      session.user.email,
      fingerprint,
      code
    );

    if (!result.success) {
      return { success: false, error: result.message };
    }

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      resource: 'Session',
      resourceId: fingerprint,
      ip: clientIP,
      details: { action: 'Device verified and trusted' },
    });

    return { success: true };
  } catch (error) {
    console.error('[DEVICE] Error verifying code:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

// ============================================
// Get User's Trusted Devices
// ============================================
export async function getTrustedDevicesAction(): Promise<{
  devices: Array<{
    id: string;
    name: string | null;
    browser: string | null;
    os: string | null;
    lastIp: string | null;
    lastUsedAt: Date;
    createdAt: Date;
    isCurrent: boolean;
  }>;
  error?: string;
}> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { devices: [], error: 'Non authentifie' };
    }

    const userAgent = headersList.get('user-agent') || '';
    // Use consistent fingerprint with all headers (same as auth.actions.ts)
    const currentFingerprint = generateDeviceFingerprint(
      extractFingerprintHeaders(headersList, userAgent)
    );

    const devices = await getTrustedDevices(session.user.id);

    // Get fingerprints to mark current device
    const devicesWithCurrent = await Promise.all(
      devices.map(async (device) => ({
        id: device.id,
        name: device.name,
        browser: device.browser,
        os: device.os,
        lastIp: device.lastIp,
        lastUsedAt: device.lastUsedAt,
        createdAt: device.createdAt,
        isCurrent: device.fingerprint === currentFingerprint,
      }))
    );

    return { devices: devicesWithCurrent };
  } catch (error) {
    console.error('[DEVICE] Error fetching trusted devices:', error);
    return { devices: [], error: 'Erreur serveur' };
  }
}

// ============================================
// Remove Trusted Device
// ============================================
export async function removeTrustedDeviceAction(
  deviceId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { success: false, error: 'Non authentifie' };
    }

    const clientIP = extractIP(headersList);
    const success = await removeTrustedDevice(session.user.id, deviceId);

    if (!success) {
      return { success: false, error: 'Appareil non trouve' };
    }

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Session',
      resourceId: deviceId,
      ip: clientIP,
      details: { action: 'Trusted device removed' },
    });

    return { success: true };
  } catch (error) {
    console.error('[DEVICE] Error removing device:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}
