import { COMPANY } from '@/constants/company';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';

/**
 * Convertit une date au format YYYY-MM-DD en format ISO 8601 avec fuseau horaire
 * Format attendu par Schema.org: YYYY-MM-DDTHH:mm:ss+01:00
 *
 * @param dateString - Date au format YYYY-MM-DD
 * @param timezone - Fuseau horaire (par défaut: +01:00 pour la France)
 * @returns Date au format ISO 8601 avec fuseau horaire
 *
 * @example
 * formatDateForSchema('2026-01-09') // '2026-01-09T00:00:00+01:00'
 */
export function formatDateForSchema(
  dateString: string,
  timezone: string = '+01:00'
): string {
  // Valider le format de date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    throw new Error(
      `Format de date invalide. Attendu: YYYY-MM-DD, reçu: ${dateString}`
    );
  }

  // Extraire les composants de la date
  const [year, month, day] = dateString.split('-').map(Number);

  // Valider que la date est valide
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Date invalide: ${dateString}`);
  }

  // Formater au format ISO 8601 avec fuseau horaire
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');

  return `${year}-${formattedMonth}-${formattedDay}T00:00:00${timezone}`;
}

/**
 * Génère l'objet JSON-LD pour un Article Schema.org
 * Note: N'inclut pas @context car destiné à être utilisé dans un @graph
 *
 * @param params - Paramètres de l'article
 * @returns Objet JSON-LD pour Article (sans @context)
 */
export function generateArticleSchema(params: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName?: string;
  authorUrl?: string;
  baseUrl?: string;
}): JsonLdObject {
  const {
    headline,
    description,
    image,
    datePublished,
    dateModified,
    url,
    authorName = `Équipe ${COMPANY.name}`,
    authorUrl,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || COMPANY.website,
  } = params;

  const metadataBase = new URL(baseUrl);

  return {
    '@type': 'Article',
    '@id': `${url}/#article`,
    headline,
    description,
    image: new URL(image, metadataBase).toString(),
    datePublished: formatDateForSchema(datePublished),
    dateModified: formatDateForSchema(dateModified || datePublished),
    author: {
      '@type': 'Organization',
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${url}/#webpage`,
    },
  };
}

/**
 * Génère l'objet JSON-LD pour une FAQPage Schema.org
 * Note: N'inclut pas @context car destiné à être utilisé dans un @graph
 *
 * @param faqItems - Liste des questions/réponses
 * @returns Objet JSON-LD pour FAQPage (sans @context)
 */
export function generateFAQSchema(faqItems: Array<{ question: string; answer: string }>): JsonLdObject | null {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Supprime le @context d'un objet JSON-LD
 * Utile quand l'objet est utilisé dans un @graph
 *
 * @param schema - Objet JSON-LD avec potentiellement un @context
 * @returns Objet JSON-LD sans @context
 */
export function removeContext<T extends JsonLdObject>(schema: T): Omit<T, '@context'> {
  const { '@context': _context, ...rest } = schema;
  return rest;
}
