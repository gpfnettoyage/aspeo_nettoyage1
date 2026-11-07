import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import { getSession } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/permissions';

/**
 * Mode prévisualisation : actif uniquement si le cookie Draft Mode est présent ET si la
 * personne est connectée à l'administration. Un cookie seul ne donne jamais accès aux brouillons.
 */
export const isPreview = cache(async (): Promise<boolean> => {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return false;
  const session = await getSession();
  return !!session && canAccessAdmin(session.user.role);
});

/** Superpose les modifications en attente (colonne `draft`) aux valeurs publiées. */
export function withDraft<T extends { draft?: unknown }>(row: T, preview: boolean): T {
  if (!preview || !row.draft || typeof row.draft !== 'object') return row;
  return { ...row, ...(row.draft as Partial<T>) };
}
