import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { SessionData } from '@/lib/auth';

export type AuditVerb = 'create' | 'update' | 'draft' | 'publish' | 'unpublish' | 'archive' | 'delete' | 'upload' | 'settings' | 'status';

/**
 * Journal des modifications en base (tableau de bord « Dernières modifications »).
 * Complète le journal de sécurité existant (Redis, lib/audit.ts). Ne bloque jamais l'action.
 */
export async function recordAudit(session: SessionData, action: AuditVerb, resource: string, resourceId: string | null, resourceName: string | null, details?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({
      data: { userId: session.user.id, userName: session.user.name || session.user.email, action, resource, resourceId, resourceName, details: details as Prisma.InputJsonValue | undefined },
    });
  } catch (error) {
    console.error('[audit] écriture impossible', error);
  }
}
