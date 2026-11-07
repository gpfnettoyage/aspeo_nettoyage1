/**
 * Titres : ~50–60 caractères affichés dans les SERP (cible 60 max).
 * Méta descriptions : ~150–160 caractères (cible 158 pour marge).
 */
import type { Metadata } from 'next';
import { COMPANY } from '@/constants/company';

/** Longueur max des titres (balise title, og:title, etc.) */
export const SEO_TITLE_MAX_LENGTH = 60;
/** Longueur max des meta descriptions (SERP + cohérence avec les réseaux) */
export const SEO_DESCRIPTION_MAX_LENGTH = 158;

const siteOrigin = COMPANY.website.replace(/\/$/, '');

const defaultOgImage = {
  url: `${siteOrigin}/img/logo/logo.png`,
  alt: `${COMPANY.name} Logo`,
  width: 1200,
  height: 630,
} as const;

/**
 * Open Graph complet par page : dans l'App Router, un `openGraph` partiel
 * remplace tout l'objet du layout parent (pas de fusion profonde).
 * Il faut donc redéfinir title, description, type, images et url sur chaque route.
 */
export function pageOpenGraph(
  title: string,
  description: string,
  pathname: string
): NonNullable<Metadata['openGraph']> {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return {
    title,
    description,
    url: `${siteOrigin}${path}`,
    siteName: COMPANY.name,
    type: 'website',
    locale: 'fr_FR',
    images: [defaultOgImage],
  };
}

/**
 * Tronque un titre final (ex. titre saisi en admin) pour respecter la limite SERP.
 */
export function truncateSeoTitle(
  title: string,
  max = SEO_TITLE_MAX_LENGTH
): string {
  const t = title.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  let cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.45) {
    cut = cut.slice(0, lastSpace);
  }
  return `${cut.trimEnd()}…`;
}

/**
 * Tronque une méta description (mot entier + « … » si besoin).
 */
export function truncateMetaDescription(
  text: string,
  max = SEO_DESCRIPTION_MAX_LENGTH
): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  let cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.55) {
    cut = cut.slice(0, lastSpace);
  }
  return `${cut.trimEnd()}…`;
}

export function generateSEOTitle(pageTitle: string): string {
  const trimmed = pageTitle.trim();
  const suffixes = [
    ` | ${COMPANY.name} Nettoyage Loire & Rhône`,
    ` | ${COMPANY.name} Nettoyage 42 & 69`,
    ` | ${COMPANY.name}`,
  ];

  for (const suffix of suffixes) {
    const candidate = `${trimmed}${suffix}`;
    if (candidate.length <= SEO_TITLE_MAX_LENGTH) {
      return candidate;
    }
  }

  const suffix = suffixes[2];
  const ellipsis = '…';
  const maxBase = SEO_TITLE_MAX_LENGTH - suffix.length - ellipsis.length;
  if (maxBase < 8) {
    return truncateSeoTitle(`${trimmed}${suffix}`);
  }

  let base = trimmed.slice(0, maxBase);
  const lastSpace = base.lastIndexOf(' ');
  if (lastSpace > maxBase * 0.45) {
    base = base.slice(0, lastSpace);
  }
  return `${base.trimEnd()}${ellipsis}${suffix}`;
}

/**
 * Génère un titre SEO avec template personnalisé
 */
export function generateSEOTitleWithTemplate(
  pageTitle: string,
  customSuffix?: string
): string {
  if (customSuffix) {
    return truncateSeoTitle(`${pageTitle} | ${customSuffix}`);
  }
  return generateSEOTitle(pageTitle);
}
