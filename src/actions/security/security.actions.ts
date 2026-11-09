'use server';

import { requirePermission } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import {
  getSecurityStats,
  getBannedIPs,
  getBannedIPsPaginated,
  getRecentFailedAttempts,
  getRecentFailedAttemptsPaginated,
  banIP,
  unbanIP,
  isValidIP,
  type SecurityStats,
  type BannedIP,
  type FailedAttempt,
  type PaginatedBannedIPs,
  type PaginatedFailedAttempts,
} from '@/lib/security';
import { revalidatePath } from 'next/cache';
import { DEFAULT_PAGE_SIZES } from '@/types/pagination';

// ============================================
// Get Security Stats
// ============================================
export async function getSecurityStatsAction(): Promise<SecurityStats> {
  // Require security:view permission (ADMIN, SUPER_ADMIN only)
  await requirePermission('security:view');
  return getSecurityStats();
}

// ============================================
// Get Banned IPs
// ============================================
export async function getBannedIPsAction(): Promise<BannedIP[]> {
  await requirePermission('security:view');
  return getBannedIPs();
}

// ============================================
// Get Banned IPs (Paginated)
// ============================================
export async function getBannedIPsPaginatedAction(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZES.bannedIPs
): Promise<PaginatedBannedIPs> {
  await requirePermission('security:view');
  return getBannedIPsPaginated(page, pageSize);
}

// ============================================
// Get Recent Failed Attempts
// ============================================
export async function getRecentFailedAttemptsAction(
  limit = 50
): Promise<FailedAttempt[]> {
  await requirePermission('security:view');
  return getRecentFailedAttempts(limit);
}

// ============================================
// Get Recent Failed Attempts (Paginated)
// ============================================
export async function getRecentFailedAttemptsPaginatedAction(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZES.securityLogs
): Promise<PaginatedFailedAttempts> {
  await requirePermission('security:view');
  return getRecentFailedAttemptsPaginated(page, pageSize);
}

// ============================================
// Ban IP Action
// ============================================
export async function banIPAction(
  ip: string,
  reason: string,
  durationHours = 1
): Promise<{ success: boolean; error?: string }> {
  // Require security:ban_ip permission (ADMIN, SUPER_ADMIN only)
  const session = await requirePermission('security:ban_ip');

  // Validate IP format (prevents injection attacks)
  if (!isValidIP(ip)) {
    return { success: false, error: 'Format d\'adresse IP invalide (IPv4 ou IPv6 requis)' };
  }

  // Sanitize reason to prevent injection
  const sanitizedReason = reason.slice(0, 200).replace(/[<>"'&]/g, '');

  try {
    await banIP(ip, sanitizedReason, durationHours * 60 * 60);

    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      resource: 'Session',
      resourceId: ip,
      resourceName: `IP Ban: ${ip}`,
      details: { reason: sanitizedReason, durationHours },
    });

    revalidatePath('/gp8x2k4m/security');
    return { success: true };
  } catch (error) {
    console.error('[SECURITY] Ban IP failed:', error);
    return { success: false, error: 'Erreur lors du bannissement' };
  }
}

// ============================================
// Unban IP Action
// ============================================
export async function unbanIPAction(
  ip: string
): Promise<{ success: boolean; error?: string }> {
  // Require security:unban_ip permission (ADMIN, SUPER_ADMIN only)
  const session = await requirePermission('security:unban_ip');

  // Validate IP format (prevents injection attacks)
  if (!isValidIP(ip)) {
    return { success: false, error: 'Format d\'adresse IP invalide' };
  }

  try {
    await unbanIP(ip);

    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Session',
      resourceId: ip,
      resourceName: `IP Unban: ${ip}`,
    });

    revalidatePath('/gp8x2k4m/security');
    return { success: true };
  } catch (error) {
    console.error('[SECURITY] Unban IP failed:', error);
    return { success: false, error: 'Erreur lors du débannissement' };
  }
}
