import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canAccessAdmin, hasPermission } from '@/lib/permissions';
import { readPrivate } from '@/lib/storage/files';

export const dynamic = 'force-dynamic';

/** Types affichés dans le navigateur ; les autres (Word…) sont toujours téléchargés. */
const INLINE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf']);

const asciiName = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_').slice(0, 120) || 'fichier';

/**
 * Fichiers confidentiels (CV, photos jointes aux demandes) : réservés aux administrateurs connectés
 * disposant de la permission « leads:view ». Les fichiers sont déchiffrés à la volée et ne sont
 * jamais mis en cache. `?download=1` force le téléchargement.
 */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.user.role) || !hasPermission(session.user.role, 'leads:view')) {
    return new NextResponse('Accès refusé', { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
  }
  const { path } = await params;
  let file;
  try {
    file = await readPrivate(path.map(decodeURIComponent).join('/'));
  } catch (error) {
    console.error('[files] lecture impossible', error);
    return new NextResponse('Fichier illisible', { status: 500, headers: { 'Cache-Control': 'private, no-store' } });
  }
  if (!file) return new NextResponse('Introuvable', { status: 404, headers: { 'Cache-Control': 'private, no-store' } });

  const download = new URL(req.url).searchParams.get('download') === '1' || !INLINE.has(file.contentType);
  const name = file.name ?? 'fichier';
  return new NextResponse(new Uint8Array(file.content), {
    headers: {
      'Content-Type': file.contentType,
      'Content-Length': String(file.content.length),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      'Referrer-Policy': 'no-referrer',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${asciiName(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
}
