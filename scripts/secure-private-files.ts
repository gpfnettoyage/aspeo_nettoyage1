/**
 * Transition : sécurise les fichiers confidentiels déposés en clair (photos de demandes de devis, CV).
 *
 * Pour chaque demande ou candidature dont un fichier est stocké en clair (ancienne adresse Vercel Blob
 * publique, ou fichier local non chiffré) :
 *   1. le fichier est lu, chiffré et déposé sous un nouveau nom aléatoire ;
 *   2. l'adresse enregistrée en base est remplacée par celle de la route protégée ;
 *   3. l'ancien fichier en clair est supprimé.
 * Enfin, les fichiers du dossier privé rattachés à aucune demande ni candidature sont listés
 * (« orphelins ») : ils ne sont jamais supprimés automatiquement.
 * Les fichiers déjà chiffrés sont ignorés : le script peut être relancé sans risque.
 *
 * Utilisation (avec les variables d'environnement du site : DATABASE_URL, BLOB_READ_WRITE_TOKEN,
 * FILES_ENCRYPTION_KEY ou BETTER_AUTH_SECRET) :
 *   npx tsx --conditions=react-server scripts/secure-private-files.ts           # simulation : aucune écriture
 *   npx tsx --conditions=react-server scripts/secure-private-files.ts --apply   # transition réelle
 */
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { randomBytes } from 'crypto';
import { readdir } from 'fs/promises';
import path from 'path';
import { list } from '@vercel/blob';
import { PRIVATE_ROUTE, privatePathnameOf, readPrivate, removeStored, usesBlob, writePrivate } from '../src/lib/storage/files';
import { encryptPrivateFile } from '../src/lib/storage/private-crypto';

const APPLY = process.argv.includes('--apply');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type Attachment = { url?: string; pathname?: string; name?: string; size?: number };
const stats = { examined: 0, alreadyProtected: 0, secured: 0, missing: 0, errors: 0 };

/** Chiffre un fichier en clair et renvoie sa nouvelle adresse (ou null si rien à faire). */
async function secure(url: string, folder: string, fallbackName: string): Promise<string | null> {
  stats.examined++;
  const pathname = privatePathnameOf(url);
  if (!pathname) { console.warn(`  ? adresse non reconnue, ignorée : ${url}`); stats.errors++; return null; }
  const file = await readPrivate(pathname).catch((e: unknown) => { console.error(`  ! lecture impossible : ${pathname}`, e); return undefined; });
  if (file === undefined) { stats.errors++; return null; }
  if (file === null) { console.warn(`  ? fichier introuvable : ${pathname}`); stats.missing++; return null; }
  if (!file.legacy) { stats.alreadyProtected++; return url.startsWith(PRIVATE_ROUTE) ? null : `${PRIVATE_ROUTE}${pathname}`; }
  const target = `prive/${folder}/${Date.now().toString(36)}-${randomBytes(16).toString('hex')}.bin`;
  console.log(`  → ${APPLY ? 'chiffrement' : '[simulation] chiffrerait'} ${pathname} (${file.content.length} octets) vers ${target}`);
  if (!APPLY) { stats.secured++; return null; }
  await writePrivate(target, encryptPrivateFile(file.content, { contentType: file.contentType, name: fallbackName }));
  const check = await readPrivate(target);
  if (!check || check.legacy || !check.content.equals(file.content)) throw new Error(`Vérification échouée pour ${target}`);
  stats.secured++;
  return `${PRIVATE_ROUTE}${target}`;
}

async function main() {
  console.log(APPLY ? 'Transition RÉELLE des fichiers confidentiels' : 'SIMULATION (aucune écriture) — ajouter --apply pour exécuter');

  const quotes = await prisma.quoteRequest.findMany({ where: { attachments: { not: Prisma.DbNull } }, select: { id: true, attachments: true } });
  for (const q of quotes) {
    const list = Array.isArray(q.attachments) ? (q.attachments as Attachment[]) : [];
    let changed = false;
    const next: Attachment[] = [];
    const toDelete: Attachment[] = [];
    for (const a of list) {
      if (!a?.url) { next.push(a); continue; }
      try {
        const url = await secure(a.url, 'devis', a.name ?? 'photo');
        if (url) { next.push({ ...a, url, pathname: privatePathnameOf(url)! }); toDelete.push(a); changed = true; }
        else next.push(a);
      } catch (e) { console.error(`  ! demande ${q.id}`, e); stats.errors++; next.push(a); }
    }
    if (APPLY && changed) {
      await prisma.quoteRequest.update({ where: { id: q.id }, data: { attachments: next as unknown as Prisma.InputJsonValue } });
      // Supprime l'ancien fichier en clair, sauf s'il s'agit du même emplacement (fichier déjà chiffré, simplement ré-adressé).
      for (const old of toDelete) {
        const oldPath = privatePathnameOf(old.url!);
        if (oldPath && !next.some((n) => n.pathname === oldPath)) await removeStored(old.url!, oldPath);
      }
    }
  }

  const apps = await prisma.jobApplication.findMany({ where: { cvUrl: { not: null } }, select: { id: true, cvUrl: true, cvName: true } });
  for (const a of apps) {
    try {
      const url = await secure(a.cvUrl!, 'candidatures', a.cvName ?? 'CV');
      if (APPLY && url) {
        await prisma.jobApplication.update({ where: { id: a.id }, data: { cvUrl: url } });
        const oldPath = privatePathnameOf(a.cvUrl!);
        if (oldPath && privatePathnameOf(url) !== oldPath) await removeStored(a.cvUrl!, oldPath);
      }
    } catch (e) { console.error(`  ! candidature ${a.id}`, e); stats.errors++; }
  }

  // Fichiers privés rattachés à aucun enregistrement (signalés uniquement)
  const referenced = new Set<string>();
  for (const q of await prisma.quoteRequest.findMany({ select: { attachments: true } })) {
    for (const a of (Array.isArray(q.attachments) ? (q.attachments as Attachment[]) : [])) { const p = a?.url ? privatePathnameOf(a.url) : null; if (p) referenced.add(p); }
  }
  for (const a of await prisma.jobApplication.findMany({ where: { cvUrl: { not: null } }, select: { cvUrl: true } })) { const p = privatePathnameOf(a.cvUrl!); if (p) referenced.add(p); }
  const stored: string[] = [];
  if (usesBlob()) {
    let cursor: string | undefined;
    do { const page = await list({ prefix: 'prive/', cursor, limit: 1000 }); stored.push(...page.blobs.map((b) => b.pathname)); cursor = page.hasMore ? page.cursor : undefined; } while (cursor);
  } else {
    const root = path.join(process.cwd(), 'storage', 'private');
    const walk = async (dir: string): Promise<void> => { for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) { const f = path.join(dir, e.name); if (e.isDirectory()) await walk(f); else stored.push(path.relative(root, f).split(path.sep).join('/')); } };
    await walk(path.join(root, 'prive'));
  }
  const orphans = stored.filter((p) => !referenced.has(p));
  if (orphans.length) {
    console.log(`Fichiers privés non rattachés (à examiner, non supprimés) : ${orphans.length}`);
    for (const o of orphans) console.log(`  · ${o}${o.endsWith('.bin') ? '' : '  (en clair)'}`);
  }

  console.log('Bilan :', { ...stats, orphans: orphans.length });
  if (stats.errors) process.exitCode = 1;
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
