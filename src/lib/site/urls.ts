/** Construction des URL publiques (une seule source de vérité pour le maillage interne). */
export const urls = {
  home: () => '/',
  about: () => '/a-propos',
  services: () => '/proprete-services',
  service: (slug: string) => `/proprete-services/${slug}`,
  category: (slug: string) => `/proprete-services/${slug}`,
  zones: () => '/zones-intervention',
  city: (slug: string) => `/ville/${slug}`,
  realisations: () => '/realisations',
  realisation: (slug: string) => `/realisations/${slug}`,
  medias: () => '/medias',
  articles: () => '/medias/actualites',
  article: (slug: string) => `/medias/actualites/${slug}`,
  press: () => '/medias/presse',
  pressArticle: (slug: string) => `/medias/presse/${slug}`,
  reviews: () => '/avis',
  careers: () => '/nous-rejoindre',
  accounts: () => '/grands-comptes',
  contact: (service?: string) => (service ? `/contact?prestation=${encodeURIComponent(service)}#devis` : '/contact'),
  search: (q?: string) => (q ? `/recherche?q=${encodeURIComponent(q)}` : '/recherche'),
} as const;

/** URL absolue à partir du domaine public. */
export function absoluteUrl(path: string, base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aspeo.fr') {
  if (/^https?:\/\//.test(path)) return path;
  return base.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`);
}
