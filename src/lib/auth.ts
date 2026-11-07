import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from './prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import {
  canAccessAdmin,
  hasPermission,
  type Permission,
  ROLE_HIERARCHY,
} from './permissions';
import { twoFactor } from 'better-auth/plugins';
import { sendPasswordResetEmail } from './email';
import { cache } from 'react';

// ============================================
// BetterAuth Configuration
// ============================================
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    // Password reset token expires in 1 hour
    resetPasswordTokenExpiresIn: 3600,
    // Use bcrypt for password hashing (compatible with existing passwords)
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 12);
      },
      verify: async (data: { hash: string; password: string }) => {
        return bcrypt.compare(data.password, data.hash);
      },
    },
    // Send password reset email
    sendResetPassword: async ({ user, url }, request) => {
      // Extract IP from request for security logging
      const forwarded = request?.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0].trim() : request?.headers.get('x-real-ip') || undefined;



      await sendPasswordResetEmail(user.email, url, user.name || undefined, ip || undefined);
    },
  },
  session: {
    // SECURITY: Admin sessions expire after 24 hours (not 7 days)
    // Forces re-authentication for security-critical operations
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 4, // Update session every 4 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: 'aspeo',
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Capture IP and UserAgent for session tracking
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'],
      disableIpTracking: false,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 5, // 5 requests per minute for login
  },
  // IMPORTANT: nextCookies must be the last plugin
  plugins: [
    twoFactor({
      issuer: 'Aspeo',
    }),
    nextCookies(),
  ],
});

// ============================================
// Session Types
// ============================================
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export interface SessionData {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
  };
}

// ============================================
// Session Helpers
// ============================================

/**
 * Get the current session using BetterAuth API
 * Fetches user role from database since BetterAuth doesn't return custom fields
 * Returns null if no valid session exists
 *
 * Wrapped with React cache() to deduplicate calls within the same request
 * (e.g., when requireAdmin() and AdminShell both need the session)
 */
export const getSession = cache(async (): Promise<SessionData | null> => {
  try {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return null;
    }

    // BetterAuth doesn't return custom fields like 'role'
    // Fetch it from the database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // SECURITY: Default to lowest privilege if role not found
    const role: Role = (dbUser?.role as Role) || 'USER';

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  } catch {
    return null;
  }
});

/**
 * Require admin panel access (any valid role)
 * Redirects to login if not authenticated
 * Throws error if user doesn't have minimum required role
 */
export async function requireAdmin(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    redirect('/gp8x2k4m/login');
  }

  // Check if user can access admin panel at all
  if (!canAccessAdmin(session.user.role)) {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

/**
 * Require a specific permission
 * Redirects to login if not authenticated
 * Throws error if user doesn't have the permission
 */
export async function requirePermission(permission: Permission): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    redirect('/gp8x2k4m/login');
  }

  if (!hasPermission(session.user.role, permission)) {
    throw new Error(`Forbidden: Permission '${permission}' required`);
  }

  return session;
}

/**
 * Require minimum role level
 * Redirects to login if not authenticated
 * Throws error if user's role is below minimum
 */
export async function requireRole(minimumRole: Role): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    redirect('/gp8x2k4m/login');
  }

  if (ROLE_HIERARCHY[session.user.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error(`Forbidden: Role '${minimumRole}' or higher required`);
  }

  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Check if user has admin-level access (ADMIN or SUPER_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return ROLE_HIERARCHY[session.user.role] >= ROLE_HIERARCHY['ADMIN'];
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return hasPermission(session.user.role, permission);
}
