import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/permissions';

/**
 * Active la prévisualisation (brouillons visibles) pour un administrateur connecté,
 * puis ouvre la page demandée. Seuls les chemins internes sont acceptés (pas de redirection ouverte).
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.user.role)) return new NextResponse('Accès réservé aux administrateurs.', { status: 401 });
  const path = new URL(request.url).searchParams.get('path') || '/';
  const safe = path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path : '/';
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(safe, request.url), { status: 307 });
}
