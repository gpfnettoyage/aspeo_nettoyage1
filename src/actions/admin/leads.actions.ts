'use server';

import type { LeadStatus } from '@prisma/client';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/admin/audit-log';
import { removeStored } from '@/lib/storage/files';

const STATUSES: LeadStatus[] = ['NEW', 'IN_PROGRESS', 'QUOTED', 'DONE', 'SPAM'];
type Result = { ok: boolean; message: string };

export async function updateLeadAction(kind: 'devis' | 'candidature', id: string, status: string, notes?: string): Promise<Result> {
  const session = await requirePermission('leads:update');
  if (!STATUSES.includes(status as LeadStatus)) return { ok: false, message: 'Statut inconnu.' };
  if (kind === 'devis') {
    const lead = await prisma.quoteRequest.update({ where: { id }, data: { status: status as LeadStatus, notes: notes?.trim().slice(0, 4000) || null } });
    await recordAudit(session, 'status', 'demandes', id, `${lead.firstName ?? ''} ${lead.lastName}`.trim());
  } else {
    const app = await prisma.jobApplication.update({ where: { id }, data: { status: status as LeadStatus } });
    await recordAudit(session, 'status', 'candidatures', id, `${app.firstName} ${app.lastName}`);
  }
  return { ok: true, message: 'Enregistré.' };
}

/** Suppression (droit à l'effacement RGPD) : la demande et ses pièces jointes. */
export async function deleteLeadAction(kind: 'devis' | 'candidature', id: string): Promise<Result> {
  const session = await requirePermission('leads:delete');
  if (kind === 'devis') {
    const lead = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!lead) return { ok: false, message: 'Demande introuvable.' };
    const files = Array.isArray(lead.attachments) ? (lead.attachments as { url?: string; pathname?: string }[]) : [];
    for (const f of files) if (f?.url) await removeStored(f.url, f.pathname ?? null).catch(() => undefined);
    await prisma.quoteRequest.delete({ where: { id } });
    await recordAudit(session, 'delete', 'demandes', id, `${lead.firstName ?? ''} ${lead.lastName}`.trim());
  } else {
    const app = await prisma.jobApplication.findUnique({ where: { id } });
    if (!app) return { ok: false, message: 'Candidature introuvable.' };
    if (app.cvUrl) await removeStored(app.cvUrl, app.cvUrl.startsWith('/api/admin/files/') ? decodeURIComponent(app.cvUrl.slice('/api/admin/files/'.length)) : null).catch(() => undefined);
    await prisma.jobApplication.delete({ where: { id } });
    await recordAudit(session, 'delete', 'candidatures', id, `${app.firstName} ${app.lastName}`);
  }
  return { ok: true, message: 'Supprimé définitivement.' };
}
