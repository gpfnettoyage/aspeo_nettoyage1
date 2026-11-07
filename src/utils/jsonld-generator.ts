import { COMPANY } from '@/constants/company';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';

/**
 * Génère le schéma LocalBusiness complet
 * Ce schéma est la base de toutes les pages du site
 */
export function generateLocalBusinessSchema(): JsonLdObject {
  return {
    '@type': ['LocalBusiness', 'Organization'],
    '@id': SCHEMA_IDS.BUSINESS,
    name: COMPANY.fullName,
    legalName: COMPANY.legal.name,
    description:
      'Entreprise de nettoyage professionnel pour bureaux, commerces et industries en Loire (42) et Rhône (69).',
    url: COMPANY.website,
    telephone: COMPANY.phoneValue,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      '@id': SCHEMA_IDS.ADDRESS,
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.zipCode,
      addressRegion: COMPANY.address.region,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    },
    logo: {
      '@type': 'ImageObject',
      '@id': SCHEMA_IDS.LOGO,
      url: `${COMPANY.website}/img/logo/logo.png`,
      width: 800,
      height: 600,
    },
    image: `${COMPANY.website}/img/logo/logo.png`,
    priceRange: '€',
    areaServed: COMPANY.areaServed,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: COMPANY.hours.weekMorningOpen,
        closes: COMPANY.hours.weekMorningClose,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: COMPANY.hours.weekAfternoonOpen,
        closes: COMPANY.hours.weekAfternoonClose,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: COMPANY.hours.fridayOpen,
        closes: COMPANY.hours.fridayClose,
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY.phoneValue,
      contactType: 'customer service',
      availableLanguage: 'French',
    },
    hasMap: COMPANY.socials.googleBusiness,
    sameAs: [
      COMPANY.socials.facebook,
      COMPANY.socials.instagram,
      COMPANY.socials.linkedin,
      COMPANY.socials.tiktok,
      COMPANY.socials.x,
      COMPANY.socials.googleBusiness,
    ].filter((url): url is string => Boolean(url)),
  };
}

/**
 * Génère le schéma WebSite
 */
export function generateWebSiteSchema(): JsonLdObject {
  return {
    '@type': 'WebSite',
    '@id': SCHEMA_IDS.WEBSITE,
    name: COMPANY.name,
    url: COMPANY.website,
    publisher: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };
}

/**
 * Génère le @graph complet avec LocalBusiness, WebSite et les schémas spécifiques de la page
 *
 * @param pageSchemas - Schémas spécifiques à la page (WebPage, Service, Article, etc.)
 * @returns Objet JSON-LD complet avec @context et @graph
 */
export function generateFullSchema(pageSchemas: JsonLdObject[]): {
  '@context': 'https://schema.org';
  '@graph': JsonLdObject[];
} {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateLocalBusinessSchema(),
      generateWebSiteSchema(),
      ...pageSchemas.filter(Boolean),
    ],
  };
}

export function stringifyJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Génère le script JSON-LD sous forme de string pour dangerouslySetInnerHTML
 */
export function generateJsonLdString(pageSchemas: JsonLdObject[]): string {
  return stringifyJsonLd(generateFullSchema(pageSchemas));
}
