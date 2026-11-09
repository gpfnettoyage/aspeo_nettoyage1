import { prisma } from './prisma';
import { sendDeviceVerificationEmail, sendNewDeviceTrustedEmail } from './email';
import crypto from 'crypto';

// ============================================
// Device Fingerprint Generation
// ============================================

/**
 * Device fingerprint input data
 * Uses only technically necessary HTTP headers (GDPR Art.6.1.f - legitimate interest for security)
 * Does NOT require user consent as it's essential for account security
 *
 * Enhanced with Client Hints for better device identification:
 * - sec-ch-ua: Browser brand and version
 * - sec-ch-ua-platform: Operating system
 * - sec-ch-ua-mobile: Mobile device indicator
 */
export interface DeviceFingerprintData {
  userAgent: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
  // Client Hints (modern browsers)
  secChUa?: string;           // Browser brand/version: "Chromium";v="124", "Google Chrome";v="124"
  secChUaPlatform?: string;   // OS: "Windows", "macOS", "Linux", "Android", "iOS"
  secChUaMobile?: string;     // Mobile: "?0" (desktop) or "?1" (mobile)
}

/**
 * Generate a device fingerprint from HTTP headers
 * Uses multiple signals for stronger fingerprint while remaining GDPR-compliant
 *
 * Signals used (in order):
 * 1. User-Agent (browser, OS, version)
 * 2. Accept-Language (locale preferences)
 * 3. Accept-Encoding (compression support)
 * 4. sec-ch-ua (Client Hints: browser brand - more reliable than UA parsing)
 * 5. sec-ch-ua-platform (Client Hints: OS)
 * 6. sec-ch-ua-mobile (Client Hints: mobile indicator)
 *
 * @param data - Device fingerprint data or userAgent string (backward compatible)
 * @param _ip - Kept for backward compatibility, not used in fingerprint
 */
export function generateDeviceFingerprint(
  data: DeviceFingerprintData | string,
  _ip?: string
): string {
  // Backward compatibility: if string passed, treat as userAgent only
  const fingerprintData = typeof data === 'string'
    ? { userAgent: data }
    : data;

  // Combine multiple signals for stronger fingerprint
  // Note: We don't include IP since it changes frequently (mobile, VPN, etc.)
  // Client Hints provide more stable identification than User-Agent parsing
  const signals = [
    fingerprintData.userAgent || '',
    fingerprintData.acceptLanguage || '',
    fingerprintData.acceptEncoding || '',
    // Client Hints (added for enhanced fingerprinting)
    fingerprintData.secChUa || '',
    fingerprintData.secChUaPlatform || '',
    fingerprintData.secChUaMobile || '',
  ].join('|');

  const fingerprint = crypto
    .createHash('sha256')
    .update(signals)
    .digest('hex')
    .substring(0, 32);

  return fingerprint;
}

/**
 * Parse user agent string to extract device info
 */
export function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
} {
  let browser = 'Navigateur inconnu';
  let os = 'Systeme inconnu';

  // Detect browser
  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Microsoft Edge';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Detect OS
  if (userAgent.includes('Windows NT 10')) {
    os = 'Windows 10/11';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  return { browser, os };
}

// ============================================
// Trusted Device Operations
// ============================================

/**
 * Check if a device is trusted for a user
 */
export async function isDeviceTrusted(
  userId: string,
  fingerprint: string
): Promise<boolean> {
  try {
    const device = await prisma.trustedDevice.findUnique({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint,
        },
      },
    });

    if (device) {
      // Update last used time
      await prisma.trustedDevice.update({
        where: { id: device.id },
        data: { lastUsedAt: new Date() },
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('[TRUSTED_DEVICE] Error checking device trust:', error);
    return false;
  }
}

/**
 * Get all trusted devices for a user
 */
export async function getTrustedDevices(userId: string) {
  return prisma.trustedDevice.findMany({
    where: { userId },
    orderBy: { lastUsedAt: 'desc' },
  });
}

/**
 * Add a device to trusted list
 */
export async function addTrustedDevice(
  userId: string,
  fingerprint: string,
  deviceInfo: { browser?: string; os?: string; ip?: string }
): Promise<void> {
  const name = `${deviceInfo.browser || 'Navigateur'} sur ${deviceInfo.os || 'Appareil'}`;

  await prisma.trustedDevice.upsert({
    where: {
      userId_fingerprint: {
        userId,
        fingerprint,
      },
    },
    update: {
      lastUsedAt: new Date(),
      lastIp: deviceInfo.ip,
    },
    create: {
      userId,
      fingerprint,
      name,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      lastIp: deviceInfo.ip,
    },
  });
}

/**
 * Remove a trusted device
 */
export async function removeTrustedDevice(
  userId: string,
  deviceId: string
): Promise<boolean> {
  try {
    await prisma.trustedDevice.delete({
      where: {
        id: deviceId,
        userId, // Ensure user owns this device
      },
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Device Verification Flow
// ============================================

/**
 * Generate a cryptographically secure 6-digit verification code
 * Uses crypto.randomInt() instead of Math.random() for security
 */
function generateVerificationCode(): string {
  // crypto.randomInt(100000, 1000000) generates a number between 100000 (inclusive) and 999999 (inclusive)
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Start device verification process
 * Creates a pending verification and sends email
 */
export async function startDeviceVerification(
  userId: string,
  email: string,
  fingerprint: string,
  deviceInfo: { browser?: string; os?: string; ip?: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    // Delete any existing pending verifications for this user/device
    await prisma.deviceVerification.deleteMany({
      where: {
        userId,
        fingerprint,
      },
    });

    // Generate verification code
    const code = generateVerificationCode();

    // Create verification record (expires in 10 minutes)
    await prisma.deviceVerification.create({
      data: {
        userId,
        fingerprint,
        code,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip: deviceInfo.ip,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send verification email
    const sent = await sendDeviceVerificationEmail(email, code, deviceInfo);

    if (!sent) {
      return { success: false, message: 'Erreur lors de l\'envoi de l\'email' };
    }

    return { success: true };
  } catch (error) {
    console.error('[TRUSTED_DEVICE] Error starting verification:', error);
    return { success: false, message: 'Erreur lors de la verification' };
  }
}

/**
 * Verify a device code
 * If valid, adds device to trusted list
 */
export async function verifyDeviceCode(
  userId: string,
  email: string,
  fingerprint: string,
  code: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Find pending verification
    const verification = await prisma.deviceVerification.findFirst({
      where: {
        userId,
        fingerprint,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return { success: false, message: 'Code invalide ou expire' };
    }

    const deviceInfo = {
      browser: verification.browser || undefined,
      os: verification.os || undefined,
      ip: verification.ip || undefined,
    };

    // Add device to trusted list
    await addTrustedDevice(userId, fingerprint, deviceInfo);

    // Delete the verification record
    await prisma.deviceVerification.delete({
      where: { id: verification.id },
    });

    // Send notification email
    await sendNewDeviceTrustedEmail(email, deviceInfo);

    return { success: true };
  } catch (error) {
    console.error('[TRUSTED_DEVICE] Error verifying code:', error);
    return { success: false, message: 'Erreur lors de la verification' };
  }
}

/**
 * Verify a device code using only fingerprint and code
 * This is used when there's no active session (e.g., during device verification BEFORE 2FA)
 * Returns the userId and email from the verification record
 */
export async function verifyDeviceCodeByFingerprint(
  fingerprint: string,
  code: string
): Promise<{
  success: boolean;
  message?: string;
  userId?: string;
  userEmail?: string;
  twoFactorEnabled?: boolean;
}> {
  try {
    // Find pending verification by fingerprint and code only
    const verification = await prisma.deviceVerification.findFirst({
      where: {
        fingerprint,
        code,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            twoFactorEnabled: true,
          },
        },
      },
    });

    if (!verification) {
      return { success: false, message: 'Code invalide ou expire' };
    }

    const deviceInfo = {
      browser: verification.browser || undefined,
      os: verification.os || undefined,
      ip: verification.ip || undefined,
    };

    // Add device to trusted list
    await addTrustedDevice(verification.userId, fingerprint, deviceInfo);

    // Delete the verification record
    await prisma.deviceVerification.delete({
      where: { id: verification.id },
    });

    // Send notification email
    await sendNewDeviceTrustedEmail(verification.user.email, deviceInfo);

    return {
      success: true,
      userId: verification.userId,
      userEmail: verification.user.email,
      twoFactorEnabled: verification.user.twoFactorEnabled,
    };
  } catch (error) {
    console.error('[TRUSTED_DEVICE] Error verifying code by fingerprint:', error);
    return { success: false, message: 'Erreur lors de la verification' };
  }
}

/**
 * Clean up expired verifications
 */
export async function cleanupExpiredVerifications(): Promise<void> {
  await prisma.deviceVerification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
