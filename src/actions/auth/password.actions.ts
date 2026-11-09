'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { z } from 'zod';
import { safeRateLimit } from '@/lib/redis';
import { hashIP } from '@/lib/utils/security';
import { extractClientIP } from '@/lib/utils/ip';
import { logAdminAction } from '@/lib/audit';
import { sendPasswordChangedEmail } from '@/lib/email';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

// ============================================
// Rate Limiter for Password Reset (strict)
// Max 3 requests per hour per IP
// ============================================
const passwordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:password-reset',
});

// ============================================
// Validation Schemas
// ============================================
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Token invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});


// ============================================
// Forgot Password Action
// ============================================
export async function forgotPasswordAction(
  _prevState: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const ipHash = hashIP(clientIP);

  // Rate limiting - strict for password reset
  const { success: limitSuccess } = await safeRateLimit(passwordResetRateLimit, ipHash);
  if (!limitSuccess) {
    console.warn(`[AUTH] Password reset rate limit exceeded for IP: ${clientIP}`);
    return {
      error: 'Trop de demandes. Reessayez dans 1 heure.',
    };
  }

  // Artificial delay to prevent timing attacks
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

  const rawData = {
    email: formData.get('email'),
  };

  // Validate input
  const result = forgotPasswordSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email } = result.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Call BetterAuth API to request password reset
    await auth.api.requestPasswordReset({
      body: {
        email: email.toLowerCase(),
        redirectTo: `${appUrl}/gp8x2k4m/reset-password`,
      },
      headers: headersList,
    });

    // Log the attempt (don't reveal if email exists)
    console.warn(`[AUTH] Password reset requested for: ${email} from IP: ${clientIP}`);

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: 'Si cette adresse existe dans notre systeme, vous recevrez un email avec les instructions.',
    };
  } catch (error) {
    console.error('[AUTH] Password reset error:', error);
    // Still return success to prevent email enumeration
    return {
      success: true,
      message: 'Si cette adresse existe dans notre systeme, vous recevrez un email avec les instructions.',
    };
  }
}

// ============================================
// Reset Password Action
// ============================================
export async function resetPasswordAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);

  const rawData = {
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  // Validate input
  const result = resetPasswordSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { token, password } = result.data;

  try {
    // Call BetterAuth API to reset password
    const response = await auth.api.resetPassword({
      body: {
        token,
        newPassword: password,
      },
      headers: headersList,
    });

    if (!response) {
      return { error: 'Token invalide ou expire' };
    }

    // Get user info for logging and notification
    const responseAny = response as Record<string, unknown>;
    const user = responseAny.user as { id?: string; email?: string } | undefined;

    if (user?.id && user?.email) {
      // SECURITY: Revoke ALL sessions for this user
      // This ensures any compromised session is invalidated after password reset
      const deletedSessions = await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      console.warn(`[AUTH] Revoked ${deletedSessions.count} session(s) for user ${user.email}`);

      // Send password changed notification
      await sendPasswordChangedEmail(user.email, clientIP);

      // Audit log
      await logAdminAction({
        userId: user.id,
        userEmail: user.email,
        action: 'UPDATE',
        resource: 'Session',
        resourceId: user.id,
        ip: clientIP,
        details: {
          action: 'Password reset completed',
          sessionsRevoked: deletedSessions.count,
        },
      });

      console.warn(`[AUTH] Password reset completed for: ${user.email} from IP: ${clientIP}`);
    }

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    return { error: 'Token invalide ou expire. Veuillez redemander un lien.' };
  }
}
