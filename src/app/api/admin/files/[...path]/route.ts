import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/permissions';
import { readPrivateLocal } from '@/lib/storage/files';
import { detectType } from '@/lib/storage/images';

/** Fichiers privés stockés localement (CV, photos de demandes) : réservés aux administrateurs connectés. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.user.role)) return new NextResponse('Accès refusé', { status: 403 });
  const { path } = await params;
  const buf = await readPrivateLocal(path.join('/'));
  if (!buf) return new NextResponse('Introuvable', { status: 404 });
  return new NextResponse(new Uint8Array(buf), {
    headers: { 'Content-Type': detectType(buf) ?? 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' },
  });
}
