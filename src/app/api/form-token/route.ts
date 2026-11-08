import { NextResponse } from 'next/server';
import { createFormToken } from '@/lib/forms/antispam';

export const dynamic = 'force-dynamic';

/** Jeton horodaté signé, demandé par les formulaires publics à leur affichage. */
export function GET() {
  return NextResponse.json({ token: createFormToken() }, { headers: { 'Cache-Control': 'no-store' } });
}
