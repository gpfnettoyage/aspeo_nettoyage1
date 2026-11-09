'use server';

import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectType, isImageType, processImage } from '@/lib/storage/images';
import { removeStored, storePublic } from '@/lib/storage/files';
import { recordAudit } from '@/lib/admin/audit-log';
import { invalidatePublicSite } from '@/lib/site/cache';

export interface MediaItem { id: string; url: string; filename: string; alt: string | null; width: number | null; height: number | null; size: number; folder: string | null; createdAt: string }

const toItem = (m: { id: string; url: string; filename: string; alt: string | null; width: number | null; height: number | null; size: number; folder: string | null; createdAt: Date }): MediaItem => ({ ...m, createdAt: m.createdAt.toISOString() });
const MAX_BYTES = 15 * 1024 * 1024;

export async function listMediaAction(query = '', take = 120): Promise<MediaItem[]> {
  await requirePermission('media:view');
  const q = query.trim();
  const rows = await prisma.media.findMany({
    where: q ? { OR: [{ filename: { contains: q, mode: 'insensitive' } }, { alt: { contains: q, mode: 'insensitive' } }, { folder: { contains: q, mode: 'insensitive' } }] } : {},
    orderBy: { createdAt: 'desc' },
    take,
  });
  return rows.map(toItem);
}

/**
 * Téléversement d'images : contrôle du type réel, conversion HEIC/HEIF (iPhone), rotation,
 * suppression des métadonnées (dont la localisation GPS), redimensionnement et WebP.
 */
export async function uploadMediaAction(fd: FormData): Promise<{ ok: true; items: MediaItem[]; errors: string[] } | { ok: false; message: string }> {
  const session = await requirePermission('media:upload');
  const files = fd.getAll('files').filter((x): x is File => x instanceof File && x.size > 0).slice(0, 20);
  const folder = String(fd.get('folder') ?? 'medias').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'medias';
  const defaultAlt = String(fd.get('alt') ?? '').trim().slice(0, 200);
  if (!files.length) return { ok: false, message: 'Aucun fichier reçu.' };
  const items: MediaItem[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      if (file.size > MAX_BYTES) { errors.push(`${file.name} : fichier trop lourd (15 Mo max).`); continue; }
      const buf = Buffer.from(await file.arrayBuffer());
      const type = detectType(buf);
      if (!isImageType(type)) { errors.push(`${file.name} : format non accepté (JPG, PNG, WebP, GIF, AVIF ou HEIC).`); continue; }
      const img = await processImage(buf, type!, 2400, 82);
      const base = file.name.replace(/\.[^.]+$/, '');
      const stored = await storePublic(img.buffer, `${base}${img.extension}`, img.contentType, folder);
      const media = await prisma.media.create({
        data: { url: stored.url, pathname: stored.pathname, filename: `${base}${img.extension}`, originalName: file.name, mimeType: img.contentType, size: stored.size, width: img.width, height: img.height, alt: defaultAlt || null, folder, uploadedBy: session.user.id },
      });
      items.push(toItem(media));
    } catch (error) {
      console.error('[medias] téléversement', error);
      errors.push(`${file.name} : image illisible.`);
    }
  }
  if (items.length) await recordAudit(session, 'upload', 'medias', null, `${items.length} image(s)`);
  return { ok: true, items, errors };
}

export async function updateMediaAltAction(id: string, alt: string) {
  const session = await requirePermission('media:upload');
  const media = await prisma.media.update({ where: { id }, data: { alt: alt.trim().slice(0, 200) || null } });
  await recordAudit(session, 'update', 'medias', id, media.filename);
  invalidatePublicSite();
  return toItem(media);
}

/** Recherche des contenus qui utilisent une image (avant suppression). */
async function usages(url: string) {
  const like = { contains: url };
  const [services, categories, cities, realisations, articles, press, pages, settings] = await Promise.all([
    prisma.$queryRaw<{ title: string }[]>`SELECT title FROM "Service" WHERE content::text LIKE ${'%' + url + '%'}`,
    prisma.$queryRaw<{ name: string }[]>`SELECT name FROM "Category" WHERE content::text LIKE ${'%' + url + '%'}`,
    prisma.city.findMany({ where: { image: url }, select: { name: true } }),
    prisma.realisation.findMany({ where: { OR: [{ image: url }] }, select: { title: true } }),
    prisma.article.findMany({ where: { OR: [{ image: url }, { body: like }] }, select: { title: true } }),
    prisma.pressArticle.findMany({ where: { OR: [{ image: url }, { body: like }] }, select: { title: true } }),
    prisma.$queryRaw<{ title: string }[]>`SELECT title FROM "Page" WHERE content::text LIKE ${'%' + url + '%'}`,
    prisma.$queryRaw<{ key: string }[]>`SELECT key FROM "SiteSetting" WHERE value::text LIKE ${'%' + url + '%'}`,
  ]);
  return [...services.map((x) => x.title), ...categories.map((x) => x.name), ...cities.map((x) => x.name), ...realisations.map((x) => x.title), ...articles.map((x) => x.title), ...press.map((x) => x.title), ...pages.map((x) => `Page ${x.title}`), ...settings.map((x) => `Réglage ${x.key}`)];
}

export async function mediaUsagesAction(id: string): Promise<string[]> {
  await requirePermission('media:view');
  const media = await prisma.media.findUnique({ where: { id } });
  return media ? usages(media.url) : [];
}

const IMG_RE = /(?:https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com|\/(?:img|uploads))\/[^"'\s)\\]+?\.(?:webp|jpe?g|png|gif|avif|svg)/gi;
const MIME: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml' };

/**
 * Recense les images déjà utilisées par le site (contenus, pages, réglages) et les ajoute à la
 * bibliothèque. Ajout uniquement : aucune image ni aucun contenu n'est modifié ou supprimé.
 */
export async function syncMediaFromContentAction(): Promise<{ ok: true; added: number }> {
  const session = await requirePermission('media:upload');
  const sources: [string, unknown][] = [];
  const [services, categories, cities, realisations, articles, press, pages, settings] = await Promise.all([
    prisma.service.findMany({ select: { content: true } }), prisma.category.findMany({ select: { content: true } }),
    prisma.city.findMany({ select: { image: true } }), prisma.realisation.findMany({ select: { image: true, gallery: true } }),
    prisma.article.findMany({ select: { image: true, body: true } }), prisma.pressArticle.findMany({ select: { image: true, body: true } }),
    prisma.page.findMany({ select: { content: true } }), prisma.siteSetting.findMany({ select: { key: true, value: true } }),
  ]);
  services.forEach((x) => sources.push(['services', x]));
  categories.forEach((x) => sources.push(['services', x]));
  cities.forEach((x) => sources.push(['villes', x]));
  realisations.forEach((x) => sources.push(['realisations', x]));
  articles.forEach((x) => sources.push(['articles', x]));
  press.forEach((x) => sources.push(['presse', x]));
  pages.forEach((x) => sources.push(['pages', x]));
  settings.forEach((x) => sources.push([x.key === 'identity' ? 'logos' : 'pages', x]));
  const found = new Map<string, string>();
  for (const [folder, data] of sources) for (const m of JSON.stringify(data).matchAll(IMG_RE)) if (!found.has(m[0])) found.set(m[0], folder);
  const existing = new Set((await prisma.media.findMany({ where: { url: { in: [...found.keys()] } }, select: { url: true } })).map((m) => m.url));
  const rows = [...found].filter(([url]) => !existing.has(url)).map(([url, folder]) => {
    const filename = decodeURIComponent(url.split('/').pop() ?? 'image');
    return { url, filename, mimeType: MIME[filename.split('.').pop()!.toLowerCase()] ?? 'image/webp', size: 0, folder, uploadedBy: session.user.id };
  });
  if (rows.length) await prisma.media.createMany({ data: rows, skipDuplicates: true });
  if (rows.length) await recordAudit(session, 'upload', 'medias', null, `${rows.length} image(s) recensée(s)`);
  return { ok: true, added: rows.length };
}

export async function deleteMediaAction(id: string, force = false): Promise<{ ok: boolean; message: string; usedBy?: string[] }> {
  const session = await requirePermission('media:delete');
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { ok: false, message: 'Image introuvable.' };
  const usedBy = await usages(media.url);
  if (usedBy.length && !force) return { ok: false, message: 'Cette image est utilisée : supprimez-la des contenus concernés ou confirmez la suppression.', usedBy };
  await removeStored(media.url, media.pathname);
  await prisma.media.delete({ where: { id } });
  await recordAudit(session, 'delete', 'medias', id, media.filename);
  return { ok: true, message: 'Image supprimée.' };
}
