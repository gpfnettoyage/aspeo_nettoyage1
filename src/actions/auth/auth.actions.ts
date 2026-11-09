'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { loginRateLimit, twoFactorRateLimit, emailLoginRateLimit, safeRateLimit } from '@/lib/redis';
import { hashIP } from '@/lib/utils/security';
import { extractClientIP } from '@/lib/utils/ip';
import { logAdminAction } from '@/lib/audit';
import {
  isIPBanned,
  recordFailedAttempt,
  clearFailedAttempts,
} from '@/lib/security';
import { canAccessAdmin, getRoleDisplayName } from '@/lib/permissions';
import {
  isDeviceTrusted,
  generateDeviceFingerprint,
  parseUserAgent,
  startDeviceVerification,
  verifyDeviceCodeByFingerprint,
  addTrustedDevice,
} from '@/lib/trusted-device';
import {
  sendBackupCodeUsedEmail,
  send2FADisableConfirmationEmail,
  send2FADisabledEmail
} from '@/lib/email';
import { redis } from '@/lib/redis';
import type { Role } from '@prisma/client';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// ============================================
// Session Cookie Signing (EXACT BetterAuth implementation)
// ============================================
// Copied directly from better-call/dist/crypto.mjs to ensure
// identical signature generation for session verification
const HMAC_ALGORITHM = { name: 'HMAC', hash: 'SHA-256' };
const COOKIE_PREFIX = 'aspeo';
const SECURE_COOKIE_PREFIX = '__Secure-';

/**
 * Get the session cookie name based on environment
 * In production with useSecureCookies: true, BetterAuth prefixes with "__Secure-"
 */
function getSessionCookieName(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseName = `${COOKIE_PREFIX}.session_token`;
  return isProduction ? `${SECURE_COOKIE_PREFIX}${baseName}` : baseName;
}

async function getCryptoKeyForSigning(secret: string): Promise<CryptoKey> {
  const secretBuf = new TextEncoder().encode(secret);
  return await globalThis.crypto.subtle.importKey(
    'raw',
    secretBuf,
    HMAC_ALGORITHM,
    false,
    ['sign', 'verify']
  );
}

async function makeSignature(value: string, secret: string): Promise<string> {
  const key = await getCryptoKeyForSigning(secret);
  const signature = await globalThis.crypto.subtle.sign(
    HMAC_ALGORITHM.name,
    key,
    new TextEncoder().encode(value)
  );
  // CRITICAL: Use btoa + String.fromCharCode exactly like BetterAuth
  // Do NOT use Buffer.toString('base64') - it may produce different results
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function signSessionCookie(value: string, secret: string): Promise<string> {
  const signature = await makeSignature(value, secret);
  // BetterAuth expects the cookie value to NOT be URL-encoded here
  // because Next.js cookies().set() will handle the encoding
  return `${value}.${signature}`;
}

// ============================================
// Fingerprint Cookie Management
// ============================================
// We store the fingerprint in a cookie during login to ensure it remains
// consistent across all verification steps (device verification, 2FA).
// This is needed because HTTP headers (especially Client Hints) can vary
// between requests, causing fingerprint mismatches.
const AUTH_FINGERPRINT_COOKIE = 'aspeo.auth.fp';
const AUTH_FINGERPRINT_TTL = 600; // 10 minutes (matches verification TTL)

/**
 * Store fingerprint in a short-lived cookie for the auth flow
 */
async function storeAuthFingerprint(fingerprint: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_FINGERPRINT_COOKIE, fingerprint, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_FINGERPRINT_TTL,
  });
}

/**
 * Get the stored fingerprint from cookie, or generate a new one
 * This ensures the same fingerprint is used across all verification steps
 */
async function getAuthFingerprint(headersList: Headers, userAgent: string): Promise<string> {
  const cookieStore = await cookies();
  const storedFingerprint = cookieStore.get(AUTH_FINGERPRINT_COOKIE)?.value;

  if (storedFingerprint) {
    return storedFingerprint;
  }

  // No stored fingerprint - generate a new one
  const fingerprintData = extractFingerprintHeaders(headersList, userAgent);
  return generateDeviceFingerprint(fingerprintData);
}

/**
 * Clear the auth fingerprint cookie (after successful login or on error)
 */
async function clearAuthFingerprint(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_FINGERPRINT_COOKIE);
}

// ============================================
// Security Configuration
// ============================================

// Roles that REQUIRE 2FA to be enabled (security critical roles)
const ROLES_REQUIRING_2FA: Role[] = ['SUPER_ADMIN', 'ADMIN'];

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

// Check if a role requires mandatory 2FA
function requires2FA(role: Role): boolean {
  return ROLES_REQUIRING_2FA.includes(role);
}

// ============================================
// Validation Schemas
// ============================================
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});


// ============================================
// Login Action (Enhanced Security)
// ============================================
export async function loginAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{
  error?: string;
  success?: boolean;
  twoFactorRequired?: boolean;
  twoFactorSetupRequired?: boolean;
  deviceVerificationRequired?: boolean;
  deviceVerificationSent?: boolean;
}> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || undefined;

  // Get real client IP (in clear for security tracking)
  const clientIP = extractClientIP(headersList);

  // Check if IP is banned (fail-closed in production)
  const banCheck = await isIPBanned(clientIP);
  if (banCheck.banned) {
    if (banCheck.redisDown) {
      console.error('[AUTH] Login blocked due to Redis outage - security measure');
    }
    console.warn(`[AUTH] IP banned: ${clientIP}`);
    return { error: 'Acces temporairement bloque. Reessayez plus tard.' };
  }

  // Hash IP for rate limiting (GDPR compliant for this purpose)
  const ipHash = hashIP(clientIP);

  // Rate limiting via Redis
  const { success: limitSuccess } = await safeRateLimit(loginRateLimit, ipHash);

  // Artificial delay to deter brute-force and timing attacks
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (!limitSuccess) {
    console.warn(`[AUTH] IP rate limit exceeded for: ${clientIP}`);
    return { error: 'Trop de tentatives. Reessayez dans une minute.' };
  }

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input
  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, password } = result.data;

  // ============================================
  // Email-based rate limiting (anti-brute-force on specific accounts)
  // This is IN ADDITION to IP-based rate limiting for defense in depth
  // Prevents attackers with multiple IPs from targeting a specific account
  // ============================================
  const emailHash = hashIP(email.toLowerCase()); // Hash email for privacy
  const { success: emailLimitSuccess } = await safeRateLimit(emailLoginRateLimit, emailHash);
  if (!emailLimitSuccess) {
    console.warn(`[AUTH] Email rate limit exceeded for: ${email}`);
    return { error: 'Trop de tentatives pour ce compte. Reessayez dans 15 minutes.' };
  }

  try {
    // Use BetterAuth API for sign in
    let response;
    let twoFactorRedirect = false;
    let userId: string | null = null;
    let userEmail: string = email.toLowerCase();

    try {
      response = await auth.api.signInEmail({
        body: {
          email: email.toLowerCase(),
          password,
        },
        headers: headersList,
      });

      userId = response?.user?.id || null;
      userEmail = response?.user?.email || email.toLowerCase();

      // Check if response indicates 2FA redirect (varies by BetterAuth version)
      const responseAny = response as Record<string, unknown>;
      if (responseAny?.twoFactorRedirect) {
        twoFactorRedirect = true;

        // When 2FA is required via response (not error), BetterAuth may not return user
        // We need to fetch the user by email to get their ID for device verification
        if (!userId) {
          const userByEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, email: true },
          });
          userId = userByEmail?.id || null;
          userEmail = userByEmail?.email || email.toLowerCase();
        }
      }
    } catch (signInError: unknown) {
      // BetterAuth throws an error when 2FA is required in some versions
      const errorObj = signInError as {
        message?: string;
        code?: string;
        body?: { twoFactorRedirect?: boolean };
        cause?: { code?: string };
      };

      // Check various ways BetterAuth might indicate 2FA is required
      if (
        errorObj?.body?.twoFactorRedirect ||
        errorObj?.code === 'TWO_FACTOR_REQUIRED' ||
        errorObj?.cause?.code === 'TWO_FACTOR_REQUIRED' ||
        (errorObj?.message && /two.?factor|2fa|totp/i.test(errorObj.message))
      ) {
        console.warn(`[AUTH] 2FA required for ${email} (caught from error)`);
        twoFactorRedirect = true;

        // When 2FA is required, BetterAuth doesn't return response.user
        // We need to fetch the user by email to get their ID for device verification
        const userByEmail = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, email: true },
        });
        userId = userByEmail?.id || null;
        userEmail = userByEmail?.email || email.toLowerCase();
      } else {
        // Not a 2FA error, rethrow to be caught by outer catch
        throw signInError;
      }
    }

    // If no user found (invalid credentials)
    if (!userId && !twoFactorRedirect) {
      if (!response || !response.user) {
        // Record failed attempt with IP in clear
        const { banned } = await recordFailedAttempt(clientIP, email, userAgent);
        if (banned) {
          return { error: 'Trop de tentatives echouees. IP bloquee temporairement.' };
        }
        return { error: 'Email ou mot de passe incorrect' };
      }
    }

    // At this point, if twoFactorRedirect is true but userId is null,
    // it means the user doesn't exist (shouldn't happen but handle gracefully)
    if (!userId) {
      const { banned } = await recordFailedAttempt(clientIP, email, userAgent);
      if (banned) {
        return { error: 'Trop de tentatives echouees. IP bloquee temporairement.' };
      }
      return { error: 'Email ou mot de passe incorrect' };
    }

    // Fetch user data from database (role, emailVerified, twoFactorEnabled)
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        emailVerified: true,
        twoFactorEnabled: true,
      },
    });

    // Check if user has any valid admin panel role
    if (!dbUser || !canAccessAdmin(dbUser.role)) {
      // Sign out immediately if no admin access
      await auth.api.signOut({
        headers: headersList,
      });
      // Record as failed attempt
      await recordFailedAttempt(clientIP, email, userAgent);
      return { error: 'Acces non autorise. Contactez un administrateur.' };
    }

    // ============================================
    // SECURITY CHECK 1: Email Verification
    // ============================================
    if (!dbUser.emailVerified) {
      // Sign out - email must be verified for admin access
      await auth.api.signOut({
        headers: headersList,
      });
      console.warn(`[AUTH] Login blocked - email not verified: ${email}`);
      return { error: 'Votre adresse email doit etre verifiee pour acceder a l\'administration.' };
    }

    // ============================================
    // SECURITY CHECK 2: Mandatory 2FA for high-privilege roles
    // ============================================
    if (requires2FA(dbUser.role) && !dbUser.twoFactorEnabled) {
      // User has high-privilege role but hasn't set up 2FA
      // Allow login but redirect to 2FA setup page
      console.warn(`[AUTH] User ${email} (${getRoleDisplayName(dbUser.role)}) needs to setup 2FA`);

      // Clear failed attempts since password was correct
      await clearFailedAttempts(clientIP);

      // Audit log
      await logAdminAction({
        userId: userId,
        userEmail: userEmail,
        action: 'LOGIN',
        resource: 'Session',
        resourceId: response?.token || userId,
        ip: clientIP,
        details: { reason: '2FA setup required' },
      });

      return { twoFactorSetupRequired: true };
    }

    // ============================================
    // SECURITY CHECK 3: Trusted Device Verification
    // NOW APPLIES TO ALL USERS (with or without 2FA)
    // Device verification BEFORE 2FA for maximum security
    // ============================================
    const fingerprintDataLogin = extractFingerprintHeaders(headersList, userAgent || '');
    const fingerprint = generateDeviceFingerprint(fingerprintDataLogin);

    // Store fingerprint in cookie for consistent use across verification steps
    // This is crucial because Client Hints headers can vary between requests
    await storeAuthFingerprint(fingerprint);

    const deviceTrusted = await isDeviceTrusted(userId, fingerprint);

    if (!deviceTrusted) {
      // Device not trusted - need email verification BEFORE 2FA
      const deviceInfo = parseUserAgent(userAgent || '');
      const verificationResult = await startDeviceVerification(
        userId,
        userEmail,
        fingerprint,
        {
          ...deviceInfo,
          ip: clientIP,
        }
      );

      if (verificationResult.success) {
        // If 2FA is also required, store pending 2FA info in Redis
        // This is needed because BetterAuth's pending 2FA session won't be accessible
        // after the device verification flow (which happens BEFORE 2FA)
        if (twoFactorRedirect) {
          const redisKey = `pending_2fa:${fingerprint}`;
          await redis.set(
            redisKey,
            JSON.stringify({ userId, email: userEmail }),
            { ex: 600 } // 10 minutes expiry
          );
        }

        // Audit log
        await logAdminAction({
          userId: userId,
          userEmail: userEmail,
          action: 'LOGIN',
          resource: 'Session',
          resourceId: fingerprint,
          ip: clientIP,
          details: { reason: 'Device verification required', twoFactorPending: twoFactorRedirect },
        });

        return { deviceVerificationRequired: true, deviceVerificationSent: true };
      } else {
        console.error(`[AUTH] Failed to send device verification email to ${email}`);
        // Still require verification but indicate email wasn't sent
        return { deviceVerificationRequired: true, deviceVerificationSent: false };
      }
    }

    // ============================================
    // SECURITY CHECK 4: 2FA Verification (if enabled)
    // Device is already verified at this point
    // ============================================
    if (twoFactorRedirect) {
      // Store pending 2FA info in Redis for the alternative verification flow
      // This is needed because BetterAuth's pending 2FA session isn't accessible via getSession
      const redisKey = `pending_2fa:${fingerprint}`;
      await redis.set(
        redisKey,
        JSON.stringify({ userId, email: userEmail }),
        { ex: 600 } // 10 minutes expiry
      );

      return { twoFactorRequired: true };
    }

    // Log successful login with role info
    console.warn(`[AUTH] User ${email} logged in with role: ${getRoleDisplayName(dbUser.role)}`);

    // Success! Clear failed attempts for this IP
    await clearFailedAttempts(clientIP);

    // Clear the auth fingerprint cookie (no verification needed)
    await clearAuthFingerprint();

    // Audit log (use token as session identifier)
    await logAdminAction({
      userId: userId,
      userEmail: userEmail,
      action: 'LOGIN',
      resource: 'Session',
      resourceId: response?.token || userId,
      ip: clientIP,
    });

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    // Record failed attempt
    await recordFailedAttempt(clientIP, email, userAgent);
    // Generic error message to prevent user enumeration
    return { error: 'Email ou mot de passe incorrect' };
  }
}

// ============================================
// Logout Action
// ============================================
/**
 * Securely log out the current user
 *
 * SECURITY NOTE: Even if signOut fails (Redis/DB down), we still redirect to login.
 * This is acceptable because:
 * 1. The user explicitly requested logout
 * 2. BetterAuth will clear the client cookie regardless
 * 3. The session will expire naturally based on TTL
 * 4. On next request, the invalid/missing cookie will be rejected
 */
export async function logoutAction() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (session) {
      // OPTIMIZATION: Run audit logging and signOut in parallel
      // Audit is fire-and-forget (non-blocking) - we don't wait for it
      // SignOut is awaited to ensure session invalidation
      const signOutPromise = auth.api.signOut({
        headers: headersList,
      });

      // Fire-and-forget audit log (don't block on it)
      logAdminAction({
        userId: session.user.id,
        userEmail: session.user.email,
        action: 'LOGOUT',
        resource: 'Session',
        resourceId: session.session.id,
      }).catch((err) => {
        // Log error but don't fail logout
        console.error('[AUTH] Audit log failed during logout:', err);
      });

      // Wait only for signOut to complete
      await signOutPromise;
    }
  } catch (error) {
    // SECURITY: Even on error, redirect to login - see function docstring
    console.error('[AUTH] Logout error:', error);
  }

  redirect('/gp8x2k4m/login');
}

// ============================================
// 2FA Actions (with rate limiting)
// ============================================

export async function verifyTOTPAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const userAgent = headersList.get('user-agent') || '';
  const ipHash = hashIP(clientIP);

  // Rate limit 2FA attempts (5 per 15 minutes) - prevents brute force
  const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, ipHash);
  if (!limitSuccess) {
    console.warn(`[AUTH] 2FA rate limit exceeded for IP: ${clientIP}`);
    return { error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
  }

  const code = formData.get('code') as string;
  if (!code || code.length !== 6) {
    return { error: 'Code invalide' };
  }

  // Try to get existing session first (normal BetterAuth flow - trusted device)
  const preSession = await auth.api.getSession({ headers: headersList });

  if (preSession) {
    // Normal flow: session exists (device was already trusted)
    const userId = preSession.user.id;
    const userEmail = preSession.user.email;
    const sessionId = preSession.session.id;

    try {
      await auth.api.verifyTOTP({
        body: { code },
        headers: headersList,
      });

      // Audit log successful 2FA verification
      await logAdminAction({
        userId: userId,
        userEmail: userEmail,
        action: 'LOGIN',
        resource: '2FA',
        resourceId: sessionId,
        ip: clientIP,
        details: { status: '2FA verification successful' },
      });

      // Clear failed attempts since 2FA was successful
      await clearFailedAttempts(clientIP);

      console.warn(`[AUTH] User ${userEmail} completed 2FA verification`);
      return { success: true };
    } catch (error) {
      console.error('[AUTH] TOTP verification error:', error);

      // Log failed 2FA attempt
      await logAdminAction({
        userId: userId,
        userEmail: userEmail,
        action: 'LOGIN_FAILED',
        resource: '2FA',
        resourceId: sessionId,
        ip: clientIP,
        details: { status: '2FA verification failed' },
      });

      return { error: 'Code incorrect' };
    }
  }

  // ============================================
  // Alternative flow: No session (device was verified BEFORE 2FA)
  // This happens when user verified their device first, then needs 2FA
  // We need to verify TOTP manually and create a session
  // ============================================

  // Get fingerprint from cookie (consistent with loginAction)
  // This is crucial because headers can vary between requests
  const fingerprint = await getAuthFingerprint(headersList, userAgent);

  // Check Redis for pending 2FA info
  const redisKey = `pending_2fa:${fingerprint}`;
  const pendingData = await redis.get(redisKey);

  if (!pendingData) {
    return { error: 'Session expiree. Veuillez vous reconnecter.' };
  }

  // Upstash Redis automatically parses JSON, so pendingData might already be an object
  let pendingInfo: { userId: string; email: string };
  try {
    if (typeof pendingData === 'string') {
      pendingInfo = JSON.parse(pendingData);
    } else {
      pendingInfo = pendingData as { userId: string; email: string };
    }
  } catch {
    console.error('[AUTH] Failed to parse pending 2FA data');
    return { error: 'Erreur interne. Veuillez vous reconnecter.' };
  }

  const { userId, email: userEmail } = pendingInfo;

  // Get the user's TOTP secret from database
  const twoFactorRecord = await prisma.twoFactor.findFirst({
    where: { userId },
    select: { secret: true },
  });

  if (!twoFactorRecord) {
    console.error(`[AUTH] No 2FA record found for user ${userId}`);
    return { error: 'Configuration 2FA introuvable.' };
  }

  // Verify TOTP manually using BetterAuth's internal utilities
  try {
    const { createOTP } = await import('@better-auth/utils/otp');
    const { symmetricDecrypt } = await import('better-auth/crypto');

    // Decrypt the secret (BetterAuth stores it encrypted)
    const secret = await symmetricDecrypt({
      key: process.env.BETTER_AUTH_SECRET!,
      data: twoFactorRecord.secret,
    });

    // Verify the TOTP code
    const isValidCode = await createOTP(secret, {
      period: 30,
      digits: 6,
    }).verify(code);

    if (!isValidCode) {

      // Log failed 2FA attempt
      await logAdminAction({
        userId,
        userEmail,
        action: 'LOGIN_FAILED',
        resource: '2FA',
        resourceId: fingerprint,
        ip: clientIP,
        details: { status: '2FA verification failed (post-device flow)' },
      });

      return { error: 'Code incorrect' };
    }

    // TOTP is valid! Create a session manually
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const session = await prisma.session.create({
      data: {
        userId,
        token: sessionToken,
        expiresAt,
        ipAddress: clientIP,
        userAgent: userAgent || null,
      },
    });

    // Set the session cookie with BetterAuth-compatible signature
    const cookieStore = await cookies();
    const signedToken = await signSessionCookie(sessionToken, process.env.BETTER_AUTH_SECRET!);

    // BetterAuth uses "{prefix}.session_token" as the cookie name
    // In production with useSecureCookies: true, it prefixes with "__Secure-"
    // The value must be signed with HMAC-SHA256 for BetterAuth to recognize it
    const sessionCookieName = getSessionCookieName();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      expires: expiresAt,
    };

    cookieStore.set(sessionCookieName, signedToken, cookieOptions);

    // Delete the pending 2FA info from Redis
    await redis.del(`pending_2fa:${fingerprint}`);

    // Clear the auth fingerprint cookie (login flow complete)
    await clearAuthFingerprint();

    // Audit log successful 2FA verification
    await logAdminAction({
      userId,
      userEmail,
      action: 'LOGIN',
      resource: '2FA',
      resourceId: session.id,
      ip: clientIP,
      details: { status: '2FA verification successful (post-device flow)' },
    });

    // Clear failed attempts since 2FA was successful
    await clearFailedAttempts(clientIP);

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Manual TOTP verification error:', error);
    return { error: 'Erreur de verification. Veuillez reessayer.' };
  }
}

export async function enable2FAAction(code: string): Promise<{ error?: string; success?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const userAgent = headersList.get('user-agent') || '';
  const ipHash = hashIP(clientIP);

  // Rate limit 2FA setup attempts
  const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, ipHash);
  if (!limitSuccess) {
    return { error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
  }

  try {
    const response = await auth.api.verifyTOTP({
      body: {
        code,
      },
      headers: headersList,
    });

    if (response) {
      // Update user's twoFactorEnabled flag
      const session = await auth.api.getSession({ headers: headersList });
      if (session) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { twoFactorEnabled: true },
        });

        // Add current device as trusted (2FA setup proves device ownership)
        const fingerprint = generateDeviceFingerprint(
          extractFingerprintHeaders(headersList, userAgent)
        );
        const deviceInfo = parseUserAgent(userAgent);
        await addTrustedDevice(session.user.id, fingerprint, {
          ...deviceInfo,
          ip: clientIP,
        });

        // Audit log
        await logAdminAction({
          userId: session.user.id,
          userEmail: session.user.email,
          action: 'UPDATE',
          resource: '2FA',
          resourceId: session.user.id,
          ip: clientIP,
          details: { action: '2FA enabled', deviceTrusted: true },
        });
      }

      return { success: true };
    }
    return { error: 'Echec de l\'activation' };
  } catch (error) {
    console.error('[AUTH] 2FA enable error:', error);
    return { error: 'Code incorrect ou erreur serveur' };
  }
}

// ============================================
// Device Verification Action
// ============================================
export async function verifyDeviceAction(
  code: string
): Promise<{ error?: string; success?: boolean; twoFactorRequired?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const userAgent = headersList.get('user-agent') || '';
  const ipHash = hashIP(clientIP);

  // Rate limit verification attempts
  const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, `device:${ipHash}`);
  if (!limitSuccess) {
    return { error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
  }

  try {
    // Get fingerprint from cookie (consistent with loginAction)
    // Falls back to generating from headers if no cookie exists
    const fingerprint = await getAuthFingerprint(headersList, userAgent);

    // Use fingerprint-based verification (works even without session)
    // This is needed because device verification happens BEFORE 2FA,
    // and users with 2FA don't have a full session yet
    const result = await verifyDeviceCodeByFingerprint(fingerprint, code);

    if (!result.success) {
      return { error: result.message || 'Code invalide' };
    }

    // Audit log
    await logAdminAction({
      userId: result.userId!,
      userEmail: result.userEmail!,
      action: 'CREATE',
      resource: 'TrustedDevice',
      resourceId: fingerprint,
      ip: clientIP,
      details: {
        action: 'Device verified and trusted',
        twoFactorPending: result.twoFactorEnabled ?? false,
      },
    });

    // If 2FA is enabled, user needs to complete 2FA verification after device verification
    if (result.twoFactorEnabled) {
        return { success: true, twoFactorRequired: true };
    }

    // Clear failed attempts since verification was successful
    await clearFailedAttempts(clientIP);

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Device verification error:', error);
    return { error: 'Erreur de verification' };
  }
}

// ============================================
// Resend Device Verification Action
// ============================================
export async function resendDeviceVerificationAction(): Promise<{ error?: string; success?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const userAgent = headersList.get('user-agent') || '';

  try {
    // Get fingerprint from cookie (consistent with loginAction)
    const fingerprint = await getAuthFingerprint(headersList, userAgent);

    // First try to get session (might exist for users without 2FA)
    const session = await auth.api.getSession({ headers: headersList });

    let userId: string;
    let userEmail: string;

    if (session) {
      userId = session.user.id;
      userEmail = session.user.email;
    } else {
      // No session - lookup the existing device verification record
      // This happens when device verification is BEFORE 2FA
      const existingVerification = await prisma.deviceVerification.findFirst({
        where: { fingerprint },
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (!existingVerification) {
        return { error: 'Session expiree. Veuillez vous reconnecter.' };
      }

      userId = existingVerification.userId;
      userEmail = existingVerification.user.email;
    }

    const deviceInfo = parseUserAgent(userAgent);

    const result = await startDeviceVerification(
      userId,
      userEmail,
      fingerprint,
      {
        ...deviceInfo,
        ip: clientIP,
      }
    );

    if (!result.success) {
      return { error: result.message || 'Erreur lors de l\'envoi' };
    }

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Resend device verification error:', error);
    return { error: 'Erreur serveur' };
  }
}

// ============================================
// Backup Code Verification Action
// ============================================
export async function verifyBackupCodeAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const userAgent = headersList.get('user-agent') || '';
  const ipHash = hashIP(clientIP);

  // Rate limit backup code attempts (stricter than TOTP)
  const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, `backup:${ipHash}`);
  if (!limitSuccess) {
    return { error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
  }

  const code = formData.get('code') as string;
  if (!code || code.length < 8) {
    return { error: 'Code de secours invalide' };
  }

  // Try to get existing session first (normal BetterAuth flow - trusted device)
  const preSession = await auth.api.getSession({ headers: headersList });

  if (preSession) {
    // Normal flow: session exists (device was already trusted)
    const userId = preSession.user.id;
    const userEmail = preSession.user.email;
    const sessionId = preSession.session.id;

    try {
      // Use BetterAuth API to verify backup code
      const response = await auth.api.verifyBackupCode({
        body: { code },
        headers: headersList,
      });

      if (!response) {
        return { error: 'Code de secours invalide' };
      }

      // Count remaining backup codes
      const twoFactorRecord = await prisma.twoFactor.findFirst({
        where: { userId: userId },
        select: { backupCodes: true },
      });

      let remainingCodes = 0;
      if (twoFactorRecord?.backupCodes) {
        try {
          const codes = JSON.parse(twoFactorRecord.backupCodes);
          remainingCodes = codes.filter((c: { used: boolean }) => !c.used).length;
        } catch {
          // Ignore parse errors
        }
      }

      // Send notification email
      await sendBackupCodeUsedEmail(
        userEmail,
        remainingCodes,
        clientIP
      );

      // Audit log
      await logAdminAction({
        userId: userId,
        userEmail: userEmail,
        action: 'LOGIN',
        resource: '2FA',
        resourceId: sessionId,
        ip: clientIP,
        details: {
          method: 'backup_code',
          remainingCodes,
        },
      });

      // Clear failed attempts since backup code was successful
      await clearFailedAttempts(clientIP);

      console.warn(`[AUTH] User ${userEmail} completed 2FA via backup code (${remainingCodes} remaining)`);
      return { success: true };
    } catch (error) {
      console.error('[AUTH] Backup code verification error:', error);
      return { error: 'Code de secours invalide' };
    }
  }

  // ============================================
  // Alternative flow: No session (device was verified BEFORE 2FA)
  // This happens when user verified their device first, then needs 2FA
  // We need to verify backup code manually and create a session
  // ============================================

  // Get fingerprint from cookie (consistent with loginAction)
  const fingerprint = await getAuthFingerprint(headersList, userAgent);

  // Check Redis for pending 2FA info
  const pendingData = await redis.get(`pending_2fa:${fingerprint}`);
  if (!pendingData) {
    return { error: 'Session expiree. Veuillez vous reconnecter.' };
  }

  // Upstash Redis automatically parses JSON, so pendingData might already be an object
  let pendingInfo: { userId: string; email: string };
  try {
    if (typeof pendingData === 'string') {
      pendingInfo = JSON.parse(pendingData);
    } else {
      pendingInfo = pendingData as { userId: string; email: string };
    }
  } catch {
    console.error('[AUTH] Failed to parse pending 2FA data');
    return { error: 'Erreur interne. Veuillez vous reconnecter.' };
  }

  const { userId, email: userEmail } = pendingInfo;

  // Get the user's backup codes from database
  const twoFactorRecord = await prisma.twoFactor.findFirst({
    where: { userId },
    select: { id: true, backupCodes: true },
  });

  if (!twoFactorRecord || !twoFactorRecord.backupCodes) {
    console.error(`[AUTH] No backup codes found for user ${userId}`);
    return { error: 'Codes de secours introuvables.' };
  }

  // Verify backup code manually
  try {
    const { symmetricDecrypt } = await import('better-auth/crypto');

    // Decrypt the backup codes (BetterAuth stores them encrypted)
    const decryptedCodes = await symmetricDecrypt({
      key: process.env.BETTER_AUTH_SECRET!,
      data: twoFactorRecord.backupCodes,
    });

    let codesArray: Array<{ code: string; used: boolean }>;
    try {
      codesArray = JSON.parse(decryptedCodes);
    } catch {
      console.error('[AUTH] Failed to parse backup codes');
      return { error: 'Erreur de configuration 2FA.' };
    }

    // Find matching unused code
    const normalizedInput = code.replace(/[-\s]/g, '').toLowerCase();
    const matchIndex = codesArray.findIndex(
      (c) => !c.used && c.code.toLowerCase() === normalizedInput
    );

    if (matchIndex === -1) {

      await logAdminAction({
        userId,
        userEmail,
        action: 'LOGIN_FAILED',
        resource: '2FA',
        resourceId: fingerprint,
        ip: clientIP,
        details: { status: 'Backup code verification failed (post-device flow)' },
      });

      return { error: 'Code de secours invalide' };
    }

    // Mark the code as used
    codesArray[matchIndex].used = true;

    // Re-encrypt and save the updated codes
    const { symmetricEncrypt } = await import('better-auth/crypto');
    const encryptedCodes = await symmetricEncrypt({
      key: process.env.BETTER_AUTH_SECRET!,
      data: JSON.stringify(codesArray),
    });

    await prisma.twoFactor.update({
      where: { id: twoFactorRecord.id },
      data: { backupCodes: encryptedCodes },
    });

    // Count remaining codes
    const remainingCodes = codesArray.filter((c) => !c.used).length;

    // Backup code valid! Create a session manually
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const session = await prisma.session.create({
      data: {
        userId,
        token: sessionToken,
        expiresAt,
        ipAddress: clientIP,
        userAgent: userAgent || null,
      },
    });

    // Set the session cookie with BetterAuth-compatible signature
    const cookieStore = await cookies();
    const signedToken = await signSessionCookie(sessionToken, process.env.BETTER_AUTH_SECRET!);

    // BetterAuth uses "{prefix}.session_token" as the cookie name
    // In production with useSecureCookies: true, it prefixes with "__Secure-"
    const sessionCookieName = getSessionCookieName();
    cookieStore.set(sessionCookieName, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    // Delete the pending 2FA info from Redis
    await redis.del(`pending_2fa:${fingerprint}`);

    // Clear the auth fingerprint cookie (login flow complete)
    await clearAuthFingerprint();

    // Send notification email
    await sendBackupCodeUsedEmail(userEmail, remainingCodes, clientIP);

    // Audit log
    await logAdminAction({
      userId,
      userEmail,
      action: 'LOGIN',
      resource: '2FA',
      resourceId: session.id,
      ip: clientIP,
      details: {
        method: 'backup_code',
        remainingCodes,
        flow: 'post-device',
      },
    });

    // Clear failed attempts
    await clearFailedAttempts(clientIP);

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Manual backup code verification error:', error);
    return { error: 'Erreur de verification. Veuillez reessayer.' };
  }
}

// ============================================
// 2FA Disable - Two-Step Process with Email Confirmation
// ============================================

// Redis key prefix for 2FA disable codes
const DISABLE_2FA_CODE_PREFIX = '2fa-disable:';
const DISABLE_2FA_CODE_TTL = 600; // 10 minutes

/**
 * Step 1: Request 2FA disable - Verify password and send confirmation code
 */
export async function requestDisable2FAAction(
  password: string
): Promise<{ error?: string; success?: boolean; emailSent?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const ipHash = hashIP(clientIP);

  // Rate limit disable attempts (same as 2FA verification)
  const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, `disable2fa:${ipHash}`);
  if (!limitSuccess) {
    return { error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
  }

  try {
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) {
      return { error: 'Session expiree. Veuillez vous reconnecter.' };
    }

    // Check if user's role allows disabling 2FA
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, twoFactorEnabled: true },
    });

    if (!dbUser?.twoFactorEnabled) {
      return { error: 'La 2FA n\'est pas activee sur votre compte.' };
    }

    // Prevent high-privilege users from disabling 2FA
    if (requires2FA(dbUser.role)) {
      console.warn(`[AUTH] User ${session.user.email} attempted to disable mandatory 2FA`);
      return { error: 'La 2FA est obligatoire pour votre niveau d\'acces.' };
    }

    // Verify password by attempting a sign-in (BetterAuth doesn't expose password verification directly)
    // SECURITY NOTE: This creates a server-side session, but since we're in a server action
    // and don't return the session cookie to the client, it won't replace the user's current session.
    // The orphaned session will expire naturally based on TTL. This is acceptable tradeoff
    // for password verification without exposing internal BetterAuth methods.
    const verifyResponse = await auth.api.signInEmail({
      body: {
        email: session.user.email.toLowerCase(),
        password,
      },
    }).catch(() => null);

    if (!verifyResponse || !verifyResponse.user) {
      console.warn(`[AUTH] 2FA disable failed - wrong password for ${session.user.email}`);
      return { error: 'Mot de passe incorrect.' };
    }

    // Generate cryptographically secure 6-digit confirmation code
    const code = crypto.randomInt(100000, 1000000).toString();

    // Store code in Redis with TTL
    const redisKey = `${DISABLE_2FA_CODE_PREFIX}${session.user.id}`;
    await redis.set(redisKey, code, { ex: DISABLE_2FA_CODE_TTL });

    // Send confirmation email
    const emailSent = await send2FADisableConfirmationEmail(
      session.user.email,
      code,
      clientIP
    );

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'UPDATE',
      resource: '2FA',
      resourceId: session.user.id,
      ip: clientIP,
      details: { action: '2FA disable requested', emailSent },
    });

    if (!emailSent) {
      console.error(`[AUTH] Failed to send 2FA disable confirmation email to ${session.user.email}`);
      return { error: 'Erreur lors de l\'envoi de l\'email de confirmation.' };
    }

    return { success: true, emailSent: true };
  } catch (error) {
    console.error('[AUTH] 2FA disable request error:', error);
    return { error: 'Erreur lors de la demande de desactivation.' };
  }
}

/**
 * Step 2: Confirm 2FA disable - Verify email code and disable 2FA
 */
export async function confirmDisable2FAAction(
  code: string
): Promise<{ error?: string; success?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const ipHash = hashIP(clientIP);

  // Rate limit confirmation attempts
  const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, `disable2fa-confirm:${ipHash}`);
  if (!limitSuccess) {
    return { error: 'Trop de tentatives. Reessayez dans 15 minutes.' };
  }

  if (!code || code.length !== 6) {
    return { error: 'Code invalide.' };
  }

  try {
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) {
      return { error: 'Session expiree. Veuillez vous reconnecter.' };
    }

    // Verify code from Redis
    const redisKey = `${DISABLE_2FA_CODE_PREFIX}${session.user.id}`;
    const storedCode = await redis.get<string>(redisKey);

    if (!storedCode) {
      return { error: 'Code expire ou invalide. Veuillez recommencer.' };
    }

    if (storedCode !== code) {
      console.warn(`[AUTH] Invalid 2FA disable code for ${session.user.email}`);
      return { error: 'Code incorrect.' };
    }

    // Delete the code immediately to prevent reuse
    await redis.del(redisKey);

    // Delete the 2FA record from database (BetterAuth twoFactor table)
    await prisma.twoFactor.deleteMany({
      where: { userId: session.user.id },
    });

    // Update user's twoFactorEnabled flag
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false },
    });

    // Send notification email
    await send2FADisabledEmail(session.user.email, clientIP);

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'UPDATE',
      resource: '2FA',
      resourceId: session.user.id,
      ip: clientIP,
      details: { action: '2FA disabled via email confirmation' },
    });

    console.warn(`[AUTH] 2FA disabled for ${session.user.email}`);
    return { success: true };
  } catch (error) {
    console.error('[AUTH] 2FA disable confirmation error:', error);
    return { error: 'Erreur lors de la desactivation.' };
  }
}
