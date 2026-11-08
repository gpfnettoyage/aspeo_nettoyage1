'use server';

import type { Prisma } from '@prisma/client';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCollection } from '@/lib/admin/collections';
import { getEntry, isLive, publicUrl, repo } from '@/lib/admin/repository';
import { valuesToData, type FormValues } from '@/lib/admin/values';
import { recordAudit } from '@/lib/admin/audit-log';
import { invalidatePublicSite } from '@/lib/site/cache';
import type { CollectionDef } from '@/lib/admin/fields';

export type SaveIntent = 'save' | 'draft' | 'publish';
export type ActionResult = { ok: true; id: string; message: string } | { ok: false; message: string; errors?: Record<string, string> };

const LISTING: Record<string, string> = { services: '/proprete-services', categories: '/proprete-services', villes: '/zones-intervention', realisations: '/realisations', articles: '/medias', presse: '/medias/presse' };
const titleOf = (def: CollectionDef, row: Record<string, unknown>) => String(row[def.list.title] ?? '').slice(0, 140);

/** Données de mise en ligne selon le mode de statut de la collection. */
function liveData(def: CollectionDef, row: Record<string, unknown> | null) {
  if (def.status === 'boolean') return { published: true, ...(def.key === 'services' && !row?.publishedAt ? { publishedAt: new Date() } : {}) };
  if (def.status === 'content') return { status: 'PUBLISHED', ...(row?.publishedAt ? {} : { publishedAt: new Date() }) };
  return {};
}
function offlineData(def: CollectionDef) {
  if (def.status === 'boolean') return { published: false };
  if (def.status === 'content') return { status: 'DRAFT' };
  return {};
}

/** Redirection 301 automatique quand l'adresse d'un contenu publié change ou disparaît. */
async function ensureRedirect(source: string, destination: string, note: string) {
  if (source === destination) return;
  await prisma.redirect.upsert({ where: { source }, update: { destination, enabled: true, note }, create: { source, destination, permanent: true, note } });
  // Évite les chaînes : les redirections qui pointaient vers l'ancienne adresse pointent vers la nouvelle
  await prisma.redirect.updateMany({ where: { destination: source }, data: { destination } });
}

export async function saveEntryAction(collection: string, id: string | null, values: FormValues, intent: SaveIntent): Promise<ActionResult> {
  const def = getCollection(collection);
  if (!def) return { ok: false, message: 'Type de contenu inconnu.' };
  const session = await requirePermission(id ? 'content:update' : 'content:create');
  if (intent === 'publish') await requirePermission('content:publish');

  const existing = id ? await getEntry(def, id) : null;
  if (id && !existing) return { ok: false, message: 'Ce contenu n’existe plus.' };
  const { data, errors } = valuesToData(def, values, existing);
  if (Object.keys(errors).length) return { ok: false, message: 'Certains champs sont à corriger.', errors };

  if (typeof data.slug === 'string') {
    const dup = await repo(def.key).findFirst({ where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) } });
    if (dup) return { ok: false, message: 'Cette adresse est déjà utilisée par un autre contenu.', errors: { slug: 'Adresse déjà utilisée.' } };
  }

  const db = repo(def.key);
  try {
    if (!existing) {
      const created = await db.create({ data: { ...data, ...(intent === 'publish' ? liveData(def, null) : offlineData(def)) } });
      await recordAudit(session, intent === 'publish' ? 'publish' : 'create', def.key, String(created.id), titleOf(def, created));
      invalidatePublicSite();
      return { ok: true, id: String(created.id), message: intent === 'publish' ? 'Contenu créé et publié.' : 'Brouillon créé.' };
    }

    const live = isLive(def, existing);
    // Contenu en ligne + « Enregistrer le brouillon » : le site n'est pas modifié avant publication.
    if (live && def.draft && intent === 'draft') {
      await db.update({ where: { id }, data: { draft: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue } });
      await recordAudit(session, 'draft', def.key, id, titleOf(def, { ...existing, ...data }));
      invalidatePublicSite();
      return { ok: true, id: id!, message: 'Modifications enregistrées en brouillon (non visibles sur le site).' };
    }

    const oldUrl = publicUrl(def, existing);
    await db.update({ where: { id }, data: { ...data, ...(def.draft ? { draft: null } : {}), ...(intent === 'publish' ? liveData(def, existing) : {}) } });
    const newUrl = publicUrl(def, { ...existing, ...data });
    if ((live || intent === 'publish') && oldUrl && newUrl && oldUrl !== newUrl && !oldUrl.includes('#')) await ensureRedirect(oldUrl, newUrl, `Changement d'adresse (${def.singular})`);
    await recordAudit(session, intent === 'publish' && !live ? 'publish' : 'update', def.key, id, titleOf(def, { ...existing, ...data }));
    invalidatePublicSite();
    return { ok: true, id: id!, message: intent === 'publish' ? 'Publié : les modifications sont en ligne.' : live ? 'Enregistré : les modifications sont en ligne.' : 'Brouillon enregistré.' };
  } catch (error) {
    console.error('[admin] enregistrement impossible', error);
    return { ok: false, message: 'Enregistrement impossible. Vérifiez les champs et réessayez.' };
  }
}

export async function setEntryStatusAction(collection: string, id: string, status: 'publish' | 'unpublish' | 'archive'): Promise<ActionResult> {
  const def = getCollection(collection);
  if (!def || def.status === 'none') return { ok: false, message: 'Action impossible.' };
  const session = await requirePermission('content:publish');
  const row = await getEntry(def, id);
  if (!row) return { ok: false, message: 'Ce contenu n’existe plus.' };
  if (status === 'archive' && def.status !== 'content') return { ok: false, message: 'Archivage non disponible pour ce contenu.' };
  // Publier depuis la liste applique aussi les modifications en attente.
  const pending = status === 'publish' && def.draft && row.draft && typeof row.draft === 'object' ? (row.draft as Record<string, unknown>) : {};
  const data = status === 'publish' ? { ...pending, ...liveData(def, row), ...(def.draft ? { draft: null } : {}) } : status === 'archive' ? { status: 'ARCHIVED' } : offlineData(def);
  await repo(def.key).update({ where: { id }, data });
  await recordAudit(session, status, def.key, id, titleOf(def, row));
  invalidatePublicSite();
  return { ok: true, id, message: status === 'publish' ? 'Publié.' : status === 'archive' ? 'Archivé (conservé, non visible).' : 'Dépublié : le contenu n’est plus visible sur le site.' };
}

export async function discardDraftAction(collection: string, id: string): Promise<ActionResult> {
  const def = getCollection(collection);
  if (!def?.draft) return { ok: false, message: 'Action impossible.' };
  const session = await requirePermission('content:update');
  await repo(def.key).update({ where: { id }, data: { draft: null } });
  await recordAudit(session, 'update', def.key, id, 'Brouillon abandonné');
  invalidatePublicSite();
  return { ok: true, id, message: 'Modifications en attente abandonnées.' };
}

export async function deleteEntryAction(collection: string, id: string): Promise<ActionResult> {
  const def = getCollection(collection);
  if (!def) return { ok: false, message: 'Type de contenu inconnu.' };
  const session = await requirePermission('content:delete');
  const row = await getEntry(def, id);
  if (!row) return { ok: false, message: 'Ce contenu n’existe plus.' };
  if (def.key === 'categories' && (await prisma.service.count({ where: { categoryId: id } })) > 0) {
    return { ok: false, message: 'Cette catégorie contient des services : déplacez-les avant de la supprimer.' };
  }
  const url = publicUrl(def, row);
  await repo(def.key).delete({ where: { id } });
  // L'ancienne adresse ne renvoie pas d'erreur 404 : redirection vers la rubrique.
  if (url && isLive(def, row) && LISTING[def.key] && !url.includes('#')) await ensureRedirect(url, LISTING[def.key]!, `Contenu supprimé (${def.singular})`);
  await recordAudit(session, 'delete', def.key, id, titleOf(def, row));
  invalidatePublicSite();
  return { ok: true, id, message: 'Supprimé.' };
}
