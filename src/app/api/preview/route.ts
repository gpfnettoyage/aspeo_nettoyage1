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
  // URL() retire les tabulations et retours à la ligne avant d'analyser l'adresse.
  const origin = new URL(request.url).origin;
  const destination = new URL('/', origin);
  if (path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') && !/[\r\n\t]/.test(path)) {
    const candidate = new URL(path, origin);
    if (candidate.origin === origin) destination.href = candidate.href;
  }
  (await draftMode()).enable();
  return NextResponse.redirect(destination, { status: 307 });
}
