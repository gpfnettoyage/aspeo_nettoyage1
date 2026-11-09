import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

/** Quitte la prévisualisation et revient à la page en cours (version publiée). */
export async function POST(request: Request) {
  (await draftMode()).disable();
  const back = request.headers.get('referer');
  const target = back && new URL(back).origin === new URL(request.url).origin ? new URL(back).pathname : '/';
  return NextResponse.redirect(new URL(target, request.url), { status: 303 });
}
