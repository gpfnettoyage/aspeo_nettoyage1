import type { SettingsMap } from './settings-defaults';
import { absoluteUrl } from './urls';

/** Données structurées schema.org (LocalBusiness, Service, FAQPage, BreadcrumbList, Article). */

export function localBusiness(s: SettingsMap, extra: Record<string, unknown> = {}) {
  const c = s.company;
  const base = c.website;
  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${base}/#organisation`,
    name: c.name,
    url: base,
    image: absoluteUrl(s.identity.ogImage, base),
    logo: absoluteUrl(s.identity.logo, base),
    telephone: c.phoneIntl,
    email: c.email,
    address: { '@type': 'PostalAddress', streetAddress: c.street, postalCode: c.postalCode, addressLocality: c.city, addressRegion: c.department, addressCountry: 'FR' },
    ...(c.latitude != null && c.longitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: c.latitude, longitude: c.longitude } } : {}),
    areaServed: ['Loire (42)', 'Rhône (69)', 'Plaine du Forez', 'Monts du Lyonnais', 'Roannais', 'Saint-Étienne', 'Lyon'].map((name) => ({ '@type': 'AdministrativeArea', name })),
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '07:30', closes: '12:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '13:00', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '08:00', closes: '16:00' },
    ],
    sameAs: [c.facebook, c.instagram, c.linkedin, c.googleBusiness].filter(Boolean),
    ...(s.stats.googleReviewCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: s.stats.googleRating, reviewCount: s.stats.googleReviewCount, bestRating: 5 } } : {}),
    ...extra,
  };
}

export function breadcrumb(items: { name: string; path: string }[], base: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Accueil', path: '/' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path, base) })),
  };
}

export function faqPage(items: { question: string; answer: string }[]) {
  return { '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) };
}

export function serviceSchema(s: SettingsMap, svc: { title: string; description: string; path: string; image?: string | null }) {
  const base = s.company.website;
  return {
    '@type': 'Service',
    name: svc.title,
    serviceType: svc.title,
    description: svc.description,
    url: absoluteUrl(svc.path, base),
    ...(svc.image ? { image: absoluteUrl(svc.image, base) } : {}),
    provider: { '@id': `${base}/#organisation` },
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Loire (42)' }, { '@type': 'AdministrativeArea', name: 'Rhône (69)' }],
  };
}

export function articleSchema(s: SettingsMap, a: { title: string; description: string; path: string; image?: string | null; publishedAt?: Date | null; updatedAt?: Date | null }) {
  const base = s.company.website;
  return {
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: absoluteUrl(a.path, base),
    ...(a.image ? { image: absoluteUrl(a.image, base) } : {}),
    ...(a.publishedAt ? { datePublished: a.publishedAt.toISOString() } : {}),
    ...(a.updatedAt ? { dateModified: a.updatedAt.toISOString() } : {}),
    author: { '@type': 'Organization', name: s.company.name },
    publisher: { '@id': `${base}/#organisation` },
  };
}

/** Script JSON-LD (échappement de « < » pour éviter toute injection HTML). */
export function jsonLdScript(graph: Record<string, unknown>[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
