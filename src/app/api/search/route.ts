import { NextResponse } from 'next/server';
import { search } from '@/lib/site/search';

/** Recherche instantanée (barre de l'accueil) : 6 premiers résultats. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = await search(q, 6);
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
