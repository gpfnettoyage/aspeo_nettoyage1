import type { MetadataRoute } from 'next';
import { COMPANY } from '@/constants/company';

// Le chemin de l'administration n'est volontairement pas listé (il resterait public dans ce fichier) :
// ses pages sont protégées par authentification et marquées noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/recherche', '/private/'] },
    sitemap: `${COMPANY.website}/sitemap.xml`,
    host: COMPANY.website,
  };
}
