'use server';

import { Actualite } from '@/types/actualites';
import fs from 'fs';
import path from 'path';

/**
 * Récupère les métadonnées de toutes les actualités MDX
 */
export async function getActualites(): Promise<Actualite[]> {
  const actualitesDir = path.join(process.cwd(), 'src/content/actualites');

  // Vérifier si le dossier existe
  if (!fs.existsSync(actualitesDir)) {
    return [];
  }

  const files = fs.readdirSync(actualitesDir).filter(
    file => file.endsWith('.mdx') && !file.endsWith('.example')
  );

  const actualites = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace('.mdx', '');
      const { metadata } = await import(`@/content/actualites/${slug}.mdx`);
      return metadata as Actualite;
    })
  );

  // Trier par date décroissante
  return actualites.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Récupère une actualité par son slug
 */
export async function getActualiteBySlug(slug: string): Promise<Actualite | null> {
  try {
    const { metadata } = await import(`@/content/actualites/${slug}.mdx`);
    return metadata as Actualite;
  } catch {
    return null;
  }
}


