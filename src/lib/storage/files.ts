import 'server-only';
import { randomBytes } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { put, del, get } from '@vercel/blob';
import { decryptPrivateFile, encryptPrivateFile, isEncryptedFile } from './private-crypto';
import { detectType } from './images';

/**
 * Stockage des fichiers.
 * - Production : Vercel Blob (BLOB_READ_WRITE_TOKEN, déjà utilisé par le site actuel).
 * - Développement sans jeton : disque local.
 *   · fichiers publics (bibliothèque d'images) -> public/uploads (servis par Next.js) ;
 *   · fichiers privés (CV, photos de demandes) -> storage/private.
 * Fichiers privés : chiffrés avant stockage (private-crypto.ts), enregistrés sous un nom aléatoire,
 * et lisibles uniquement par /api/admin/files/... après vérification de la session et de la
 * permission « leads:view ». L'adresse enregistrée en base est toujours celle de cette route :
 * l'URL du fichier sur Vercel Blob n'est jamais exposée (panel, e-mails internes).
 */
export const usesBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'uploads');
const PRIVATE_DIR = path.join(process.cwd(), 'storage', 'private');

/** Préfixe des adresses de fichiers privés (route réservée aux administrateurs). */
export const PRIVATE_ROUTE = '/api/admin/files/';

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

/** Fichier privé (pièce jointe d'une demande, CV) : chiffré, nom aléatoire sans le nom d'origine. */
export async function storePrivate(buffer: Buffer, filename: string, contentType: string, folder: string): Promise<StoredFile> {
  const pathname = `prive/${folder.replace(/[^a-z0-9-]/gi, '')}/${Date.now().toString(36)}-${randomBytes(16).toString('hex')}.bin`;
  await writePrivate(pathname, encryptPrivateFile(buffer, { contentType, name: filename }));
  return { url: `${PRIVATE_ROUTE}${pathname}`, pathname, size: buffer.length };
}

/** Écrit (ou remplace) un fichier privé déjà chiffré. */
export async function writePrivate(pathname: string, payload: Buffer) {
  if (!isSafePathname(pathname)) throw new Error('Chemin de fichier privé invalide.');
  if (usesBlob()) {
    await put(pathname, payload, { access: 'public', contentType: 'application/octet-stream', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
    return;
  }
  const target = path.join(PRIVATE_DIR, pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, payload);
}

/** Chemin de stockage d'un fichier privé à partir de l'adresse enregistrée (route admin ou ancienne URL Blob). */
export function privatePathnameOf(url: string): string | null {
  if (url.startsWith(PRIVATE_ROUTE)) return decodeURIComponent(url.slice(PRIVATE_ROUTE.length));
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('.blob.vercel-storage.com') && u.pathname.startsWith('/prive/')) return decodeURIComponent(u.pathname.slice(1));
  } catch { /* adresse relative ou invalide */ }
  return null;
}

/** Adresse à afficher dans le panel ou les e-mails internes : toujours la route protégée. */
export function privateHref(url: string): string {
  const p = privatePathnameOf(url);
  return p ? `${PRIVATE_ROUTE}${p.split('/').map(encodeURIComponent).join('/')}` : url;
}

export const isSafePathname = (p: string) => p.startsWith('prive/') && !p.includes('..') && /^[a-z0-9/._-]+$/i.test(p);

async function readRaw(pathname: string): Promise<Buffer | null> {
  if (usesBlob()) {
    const res = await get(pathname, { access: 'public', useCache: false }).catch(() => null);
    if (!res || !res.stream) return null;
    return Buffer.from(await new Response(res.stream).arrayBuffer());
  }
  const target = path.normalize(path.join(PRIVATE_DIR, pathname));
  if (!target.startsWith(PRIVATE_DIR + path.sep)) return null;
  try { return await readFile(target); } catch { return null; }
}

/**
 * Lecture d'un fichier privé (route réservée aux administrateurs).
 * Un fichier déposé en clair avant le chiffrement (« legacy ») reste lisible, toujours derrière la
 * vérification d'accès ; scripts/secure-private-files.ts le chiffre et retire l'original public.
 */
export async function readPrivate(pathname: string): Promise<{ content: Buffer; contentType: string; name: string | null; legacy: boolean } | null> {
  if (!isSafePathname(pathname)) return null;
  const raw = await readRaw(pathname);
  if (!raw) return null;
  if (isEncryptedFile(raw)) {
    const { content, meta } = decryptPrivateFile(raw);
    return { content, contentType: meta.contentType || 'application/octet-stream', name: meta.name || null, legacy: false };
  }
  return { content: raw, contentType: detectType(raw) ?? 'application/octet-stream', name: null, legacy: true };
}

/** Suppression d'un fichier (bibliothèque d'images ou fichier privé). */
export async function removeStored(url: string, pathname?: string | null) {
  const priv = privatePathnameOf(url);
  if (priv && isSafePathname(priv)) {
    if (usesBlob()) await del(priv);
    else {
      const target = path.normalize(path.join(PRIVATE_DIR, priv));
      if (target.startsWith(PRIVATE_DIR + path.sep)) await unlink(target).catch(() => undefined);
    }
    return;
  }
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
