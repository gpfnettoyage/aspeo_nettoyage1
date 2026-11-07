import 'server-only';
import { revalidatePath, updateTag } from 'next/cache';

/** Étiquettes de cache des contenus publics. */
export const CACHE_TAGS = {
  settings: 'site:settings',
  content: 'site:content',
  redirects: 'site:redirects',
} as const;

/**
 * À appeler depuis une Server Action après toute modification de contenu :
 * expire immédiatement le cache des données et des pages publiques, pour qu'une
 * modification enregistrée dans l'admin soit visible sur le site au rechargement.
 */
export function invalidatePublicSite(...tags: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS][]) {
  for (const tag of tags.length ? tags : Object.values(CACHE_TAGS)) updateTag(tag);
  revalidatePath('/', 'layout');
}
