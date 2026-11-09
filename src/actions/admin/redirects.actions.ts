'use server';

import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/admin/audit-log';
import { invalidatePublicSite } from '@/lib/site/cache';

type Result = { ok: true; message: string } | { ok: false; message: string; field?: 'source' | 'destination' };

const cleanPath = (p: string) => {
  const s = p.trim();
  try { if (/^https?:\/\//i.test(s)) { const u = new URL(s); if (/(^|\.)aspeo\.fr$/i.test(u.hostname)) return (u.pathname.replace(/\/+$/, '') || '/') + u.search; return s; } } catch { /* adresse invalide */ }
  return s.length > 1 ? s.replace(/\/+$/, '') : s;
};

/** Ajoute ou modifie une redirection : chemins validés, pas de boucle, pas de chaîne. */
export async function saveRedirectAction(id: string | null, input: { source: string; destination: string; permanent: boolean; note: string }): Promise<Result> {
  const session = await requirePermission('redirects:manage');
  const source = cleanPath(input.source);
  const destination = cleanPath(input.destination);
  if (!/^\/[^\s?#]*$/.test(source) || source.startsWith('//')) return { ok: false, message: 'L’ancienne adresse doit commencer par « / » (ex. /services/ancien-nom).', field: 'source' };
  if (source.startsWith('/api') || source.startsWith('/_next') || source.startsWith('/gp8x2k4m')) return { ok: false, message: 'Cette adresse ne peut pas être redirigée.', field: 'source' };
  if (!(/^\/[^\s]*$/.test(destination) && !destination.startsWith('//')) && !/^https:\/\/[^\s]+$/.test(destination)) return { ok: false, message: 'La nouvelle adresse doit commencer par « / » ou « https:// ».', field: 'destination' };
  if (source.toLowerCase() === destination.toLowerCase()) return { ok: false, message: 'Les deux adresses sont identiques.', field: 'destination' };
  const loop = await prisma.redirect.findFirst({ where: { source: { equals: destination, mode: 'insensitive' }, destination: { equals: source, mode: 'insensitive' }, enabled: true, ...(id ? { NOT: { id } } : {}) } });
  if (loop) return { ok: false, message: 'Cette redirection créerait une boucle avec une redirection existante.', field: 'destination' };
  const dup = await prisma.redirect.findFirst({ where: { source: { equals: source, mode: 'insensitive' }, ...(id ? { NOT: { id } } : {}) } });
  if (dup) return { ok: false, message: 'Une redirection existe déjà pour cette ancienne adresse.', field: 'source' };
  // Évite les chaînes : si la destination est elle-même redirigée, on pointe vers sa cible finale.
  const next = await prisma.redirect.findFirst({ where: { source: { equals: destination, mode: 'insensitive' }, enabled: true } });
  const finalDest = next ? next.destination : destination;
  const data = { source, destination: finalDest, permanent: input.permanent, note: input.note.trim().slice(0, 200) || null };
  if (id) await prisma.redirect.update({ where: { id }, data }); else await prisma.redirect.create({ data });
  await prisma.redirect.updateMany({ where: { destination: { equals: source, mode: 'insensitive' } }, data: { destination: finalDest } });
  await recordAudit(session, id ? 'update' : 'create', 'redirections', id, `${source} → ${finalDest}`);
  invalidatePublicSite();
  return { ok: true, message: next ? `Enregistrée (redirigée directement vers ${finalDest} pour éviter une chaîne).` : 'Redirection enregistrée.' };
}

export async function toggleRedirectAction(id: string, enabled: boolean): Promise<Result> {
  const session = await requirePermission('redirects:manage');
  const r = await prisma.redirect.update({ where: { id }, data: { enabled } });
  await recordAudit(session, 'update', 'redirections', id, `${r.source} ${enabled ? 'activée' : 'désactivée'}`);
  invalidatePublicSite();
  return { ok: true, message: enabled ? 'Redirection activée.' : 'Redirection désactivée.' };
}

export async function deleteRedirectAction(id: string): Promise<Result> {
  const session = await requirePermission('redirects:manage');
  const r = await prisma.redirect.delete({ where: { id } });
  await recordAudit(session, 'delete', 'redirections', id, `${r.source} → ${r.destination}`);
  invalidatePublicSite();
  return { ok: true, message: 'Redirection supprimée.' };
}
