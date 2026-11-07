'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';
import { sendSessionRevokedEmail } from '@/lib/email';

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
 * Parse user agent string to extract device info
 */
function parseUserAgent(userAgent: string | null): {
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { browser: 'Inconnu', os: 'Inconnu' };
  }

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
// Get User's Active Sessions
// ============================================
export interface SessionInfo {
  id: string;
  browser: string;
  os: string;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export async function getActiveSessionsAction(): Promise<{
  sessions: SessionInfo[];
  error?: string;
}> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { sessions: [], error: 'Non authentifie' };
    }

    // Get all sessions for the user
    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        expiresAt: { gt: new Date() }, // Only active sessions
      },
      orderBy: { updatedAt: 'desc' },
    });

    const sessionsInfo: SessionInfo[] = sessions.map((s) => {
      const deviceInfo = parseUserAgent(s.userAgent);
      return {
        id: s.id,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.id === session.session.id,
      };
    });

    return { sessions: sessionsInfo };
  } catch (error) {
    console.error('[SESSION] Error fetching sessions:', error);
    return { sessions: [], error: 'Erreur serveur' };
  }
}

// ============================================
// Revoke a Session
// ============================================
export async function revokeSessionAction(
  sessionId: string
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

    // Don't allow revoking the current session
    if (sessionId === session.session.id) {
      return { success: false, error: 'Vous ne pouvez pas revoquer votre session actuelle' };
    }

    // Find the session to revoke
    const sessionToRevoke = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id, // Ensure user owns this session
      },
    });

    if (!sessionToRevoke) {
      return { success: false, error: 'Session non trouvee' };
    }

    const deviceInfo = parseUserAgent(sessionToRevoke.userAgent);
    const clientIP = extractIP(headersList);

    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // Send notification email
    await sendSessionRevokedEmail(session.user.email, {
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip: sessionToRevoke.ipAddress || undefined,
    }, new Date());

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Session',
      resourceId: sessionId,
      ip: clientIP,
      details: {
        action: 'Session revoked',
        browser: deviceInfo.browser,
        os: deviceInfo.os,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[SESSION] Error revoking session:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

// ============================================
// Revoke All Other Sessions
// ============================================
export async function revokeAllOtherSessionsAction(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return { success: false, count: 0, error: 'Non authentifie' };
    }

    const clientIP = extractIP(headersList);

    // Delete all sessions except current one
    const result = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        id: { not: session.session.id },
      },
    });

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Session',
      resourceId: 'all_other',
      ip: clientIP,
      details: {
        action: 'All other sessions revoked',
        count: result.count,
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('[SESSION] Error revoking all sessions:', error);
    return { success: false, count: 0, error: 'Erreur serveur' };
  }
}
