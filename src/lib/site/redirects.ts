import 'server-only';
import { unstable_cache } from 'next/cache';
import { permanentRedirect, redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CACHE_TAGS } from './cache';

/** Redirections administrables, mises en cache (invalidées à chaque modification dans l'admin). */
const loadRedirects = unstable_cache(
  async () => prisma.redirect.findMany({ where: { enabled: true }, select: { id: true, source: true, destination: true, permanent: true } }),
  ['site-redirects'],
  { tags: [CACHE_TAGS.redirects], revalidate: 3600 },
);

const normalizePath = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p).toLowerCase();

export async function findRedirect(pathname: string) {
  try {
    const list = await loadRedirects();
    const target = normalizePath(pathname);
    return list.find((r) => normalizePath(r.source) === target) ?? null;
  } catch {
    return null;
  }
}

/**
 * À appeler quand aucun contenu publié ne correspond à l'URL : applique la redirection
 * enregistrée (301/302) si elle existe, sinon affiche la page 404.
 * Un contenu publié est donc toujours prioritaire sur une redirection.
 */
export async function redirectOrNotFound(pathname: string): Promise<never> {
  const r = await findRedirect(pathname);
  if (r) {
    prisma.redirect.update({ where: { id: r.id }, data: { hits: { increment: 1 } } }).catch(() => undefined);
    if (r.permanent) permanentRedirect(r.destination);
    redirect(r.destination);
  }
  notFound();
}
