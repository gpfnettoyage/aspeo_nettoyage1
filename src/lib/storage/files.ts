import 'server-only';
import { randomBytes } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { put, del } from '@vercel/blob';

/**
 * Stockage des fichiers.
 * - Production : Vercel Blob (BLOB_READ_WRITE_TOKEN, déjà utilisé par le site actuel).
 * - Développement sans jeton : disque local.
 *   · fichiers publics (bibliothèque d'images) -> public/uploads (servis par Next.js) ;
 *   · fichiers privés (CV, photos de demandes) -> storage/private (servis uniquement à un
 *     administrateur connecté par /api/admin/files/...).
 * Les fichiers privés stockés sur Vercel Blob ont une URL longue et imprévisible et ne sont
 * jamais affichés publiquement (uniquement dans l'administration et les e-mails internes).
 */
export const usesBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'uploads');
const PRIVATE_DIR = path.join(process.cwd(), 'storage', 'private');

export interface StoredFile { url: string; pathname: string; size: number }

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'fichier';

export function buildPathname(folder: string, filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const base = slug(path.basename(filename, ext));
  return `${folder.replace(/[^a-z0-9/-]/gi, '')}/${base}-${Date.now().toString(36)}${randomBytes(4).toString('hex')}${ext}`;
}

/** Fichier public (image de la bibliothèque). */
export async function storePublic(buffer: Buffer, filename: string, contentType: string, folder = 'medias'): Promise<StoredFile> {
  const pathname = buildPathname(folder, filename);
  if (usesBlob()) {
    const blob = await put(pathname, buffer, { access: 'public', contentType, addRandomSuffix: false });
    return { url: blob.url, pathname: blob.pathname, size: buffer.length };
  }
  const target = path.join(PUBLIC_DIR, pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return { url: `/uploads/${pathname}`, pathname, size: buffer.length };
}

/** Fichier privé (pièce jointe d'une demande, CV). */
export async function storePrivate(buffer: Buffer, filename: string, contentType: string, folder: string): Promise<StoredFile> {
  const pathname = buildPathname(`prive/${folder}`, filename);
  if (usesBlob()) {
    const blob = await put(pathname, buffer, { access: 'public', contentType, addRandomSuffix: true });
    return { url: blob.url, pathname: blob.pathname, size: buffer.length };
  }
  const target = path.join(PRIVATE_DIR, pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return { url: `/api/admin/files/${pathname}`, pathname, size: buffer.length };
}

/** Lecture d'un fichier privé local (route réservée aux administrateurs). */
export async function readPrivateLocal(pathname: string): Promise<Buffer | null> {
  const target = path.normalize(path.join(PRIVATE_DIR, pathname));
  if (!target.startsWith(PRIVATE_DIR + path.sep)) return null;
  try { return await readFile(target); } catch { return null; }
}

/** Suppression (bibliothèque d'images). */
export async function removeStored(url: string, pathname?: string | null) {
  if (/^https?:\/\//.test(url)) {
    if (usesBlob()) await del(url);
    return;
  }
  if (url.startsWith('/uploads/')) {
    const target = path.normalize(path.join(PUBLIC_DIR, url.slice('/uploads/'.length)));
    if (target.startsWith(PUBLIC_DIR + path.sep)) await unlink(target).catch(() => undefined);
  } else if (pathname) {
    const target = path.normalize(path.join(PRIVATE_DIR, pathname));
    if (target.startsWith(PRIVATE_DIR + path.sep)) await unlink(target).catch(() => undefined);
  }
}
