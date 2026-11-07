import 'server-only';
import type { Metadata } from 'next';
import { getPage } from './content';
import { getPageDefinition } from './pages-registry';
import { getSettings } from './settings';
import { absoluteUrl } from './urls';

export const truncate = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
}

/** Métadonnées complètes : title, description, canonique, Open Graph, Twitter, robots. */
export async function buildMetadata({ title, description, path, image, noindex, type = 'website', publishedTime }: MetaInput): Promise<Metadata> {
  const settings = await getSettings();
  const url = absoluteUrl(path, settings.company.website);
  const og = absoluteUrl(image || settings.identity.ogImage, settings.company.website);
  const desc = truncate(description, 160);
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: { title, description: desc, url, siteName: settings.seo.siteName, locale: 'fr_FR', type, images: [{ url: og, width: 1200, height: 630 }], ...(publishedTime ? { publishedTime } : {}) },
    twitter: { card: 'summary_large_image', title, description: desc, images: [og] },
    ...(settings.seo.googleSiteVerification ? { verification: { google: settings.seo.googleSiteVerification } } : {}),
  };
}

/** Métadonnées d'une page fixe : valeurs saisies dans l'admin, sinon valeurs par défaut de la maquette. */
export async function pageMetadata(key: string): Promise<Metadata> {
  const def = getPageDefinition(key);
  const page = await getPage(key);
  return buildMetadata({
    title: page?.seoTitle || def?.seoTitle || 'ASPEO',
    description: page?.seoDesc || def?.seoDesc || '',
    path: def?.path ?? page?.path ?? '/',
    image: page?.ogImage,
    noindex: page?.noindex ?? def?.noindex,
  });
}
