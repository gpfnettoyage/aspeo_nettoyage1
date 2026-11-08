import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CACHE_TAGS } from './cache';
import { isPreview, withDraft } from './preview';
import { urls } from './urls';
import { PAGE_CONTENT_MODELS, resolvePage, type PageAccessor } from './page-content';
import type { ArticleSummary, Catalog, CategoryContent, CategoryWithServices, ServiceContentV2, ServiceDetail, ServiceSummary } from './types';

/**
 * Couche d'accès aux contenus publics.
 * - Hors prévisualisation : seuls les contenus publiés, avec cache étiqueté (invalidé par l'admin).
 * - En prévisualisation (admin connecté + Draft Mode) : brouillons inclus, sans cache.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
/** unstable_cache sérialise en JSON : on restaure les champs date (…At) en objets Date. */
function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    // La colonne `draft` (modifications non publiées) ne doit jamais quitter le serveur.
    for (const [k, v] of Object.entries(value)) if (k !== 'draft') out[k] = typeof v === 'string' && k.endsWith('At') && ISO_DATE.test(v) ? new Date(v) : reviveDates(v);
    return out as T;
  }
  return value;
}
const cached = <A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>) => {
  const c = unstable_cache(fn, [key], { tags: [CACHE_TAGS.content], revalidate: 3600 });
  return async (...args: A): Promise<R> => reviveDates(await c(...args));
};

const published = { status: 'PUBLISHED' as const };
const visible = (preview: boolean) => (preview ? { status: { not: 'ARCHIVED' as const } } : published);

// ---------------------------------------------------------------- Services & catégories

type ServiceRow = Prisma.ServiceGetPayload<{ include: { category: true } }>;
type CategoryRow = Prisma.CategoryGetPayload<object>;

const asPole = (v: string | null | undefined): 'professionnel' | 'specialise' => (v === 'professionnel' ? 'professionnel' : 'specialise');

function toServiceSummary(row: ServiceRow): ServiceSummary {
  const c = (row.content ?? {}) as ServiceContentV2;
  return {
    id: row.id,
    slug: row.slug,
    href: urls.service(row.slug),
    title: row.title,
    short: row.subtitle ?? '',
    tagline: c.tagline ?? c.descriptions?.[0] ?? '',
    image: c.images?.[0] ?? null,
    pole: asPole(row.category?.pole),
    categorySlug: row.category?.slug ?? null,
    published: row.published,
  };
}

function toServiceDetail(row: ServiceRow): ServiceDetail {
  return {
    ...toServiceSummary(row),
    seoTitle: row.seoTitle,
    seoDesc: row.seoDesc,
    categoryName: row.category?.name ?? null,
    content: (row.content ?? {}) as ServiceContentV2,
    updatedAt: row.updatedAt,
  };
}

function buildCatalog(cats: CategoryRow[], services: ServiceRow[]): Catalog {
  const summaries = services.map(toServiceSummary);
  const categories: CategoryWithServices[] = cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    href: urls.category(c.slug),
    name: c.name,
    description: c.description,
    pole: asPole(c.pole),
    content: (c.content ?? {}) as CategoryContent,
    seoTitle: c.seoTitle,
    seoDesc: c.seoDesc,
    published: c.published,
    services: summaries.filter((s) => s.categorySlug === c.slug),
  }));
  return { categories: categories.filter((c) => c.services.length > 0), services: summaries };
}

async function queryCatalog(preview: boolean): Promise<Catalog> {
  const [cats, services] = await Promise.all([
    prisma.category.findMany({ where: preview ? {} : { published: true }, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] }),
    prisma.service.findMany({ where: preview ? {} : { published: true }, include: { category: true }, orderBy: [{ displayOrder: 'asc' }, { title: 'asc' }] }),
  ]);
  const rows = preview ? services.map((s) => withDraft(s, true)) : services;
  return buildCatalog(cats, rows);
}
const cachedCatalog = cached('catalog', () => queryCatalog(false));

/** Catégories (activités) et services publiés, dans l'ordre défini dans l'admin. */
export const getCatalog = cache(async (): Promise<Catalog> => ((await isPreview()) ? queryCatalog(true) : cachedCatalog()));

const cachedService = cached('service', async (slug: string) => {
  const row = await prisma.service.findFirst({ where: { slug, published: true }, include: { category: true } });
  return row ? toServiceDetail(row) : null;
});

export const getService = cache(async (slug: string): Promise<ServiceDetail | null> => {
  if (await isPreview()) {
    const row = await prisma.service.findUnique({ where: { slug }, include: { category: true } });
    return row ? toServiceDetail(withDraft(row, true)) : null;
  }
  return cachedService(slug);
});

export const getCategory = cache(async (slug: string): Promise<CategoryWithServices | null> => {
  const catalog = await getCatalog();
  return catalog.categories.find((c) => c.slug === slug) ?? null;
});

// ---------------------------------------------------------------- Villes

const cachedCities = cached('cities', () => prisma.city.findMany({ where: published, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] }));
export const getCities = cache(async () => ((await isPreview()) ? prisma.city.findMany({ where: visible(true), orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] }) : cachedCities()));

const cachedCity = cached('city', (slug: string) => prisma.city.findFirst({ where: { slug, ...published } }));
export const getCity = cache(async (slug: string) => {
  if (await isPreview()) {
    const row = await prisma.city.findUnique({ where: { slug } });
    return row ? withDraft(row, true) : null;
  }
  return cachedCity(slug);
});

// ---------------------------------------------------------------- Réalisations

const cachedRealisations = cached('realisations', () => prisma.realisation.findMany({ where: published, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }));
export const getRealisations = cache(async () => ((await isPreview()) ? prisma.realisation.findMany({ where: visible(true), orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }) : cachedRealisations()));

const cachedRealisation = cached('realisation', (slug: string) => prisma.realisation.findFirst({ where: { slug, ...published } }));
export const getRealisation = cache(async (slug: string) => {
  if (await isPreview()) {
    const row = await prisma.realisation.findUnique({ where: { slug } });
    return row ? withDraft(row, true) : null;
  }
  return cachedRealisation(slug);
});

// ---------------------------------------------------------------- Articles (Médias)

const articleOrder = [{ publishedAt: 'desc' as const }, { createdAt: 'desc' as const }];
const toArticleSummary = (a: { slug: string; title: string; category: string | null; excerpt: string | null; image: string | null; imageAlt: string | null; publishedAt: Date | null }): ArticleSummary => ({
  slug: a.slug, href: urls.article(a.slug), title: a.title, category: a.category, excerpt: a.excerpt, image: a.image, imageAlt: a.imageAlt, publishedAt: a.publishedAt,
});
const cachedArticles = cached('articles', async () => (await prisma.article.findMany({ where: { ...published, publishedAt: { lte: new Date() } }, orderBy: articleOrder })).map(toArticleSummary));
export const getArticles = cache(async (): Promise<ArticleSummary[]> =>
  (await isPreview()) ? (await prisma.article.findMany({ where: visible(true), orderBy: articleOrder })).map(toArticleSummary) : cachedArticles());

const cachedArticle = cached('article', (slug: string) => prisma.article.findFirst({ where: { slug, ...published, publishedAt: { lte: new Date() } } }));
export const getArticle = cache(async (slug: string) => {
  if (await isPreview()) {
    const row = await prisma.article.findUnique({ where: { slug } });
    return row ? withDraft(row, true) : null;
  }
  return cachedArticle(slug);
});

// ---------------------------------------------------------------- Presse

const cachedPress = cached('press', () => prisma.pressArticle.findMany({ where: published, orderBy: articleOrder }));
export const getPressArticles = cache(async () => ((await isPreview()) ? prisma.pressArticle.findMany({ where: visible(true), orderBy: articleOrder }) : cachedPress()));

const cachedPressArticle = cached('press-article', (slug: string) => prisma.pressArticle.findFirst({ where: { slug, ...published } }));
export const getPressArticle = cache(async (slug: string) => {
  if (await isPreview()) {
    const row = await prisma.pressArticle.findUnique({ where: { slug } });
    return row ? withDraft(row, true) : null;
  }
  return cachedPressArticle(slug);
});

// ---------------------------------------------------------------- Avis, emplois, FAQ

export const getTestimonials = cache(cached('testimonials', () => prisma.testimonial.findMany({ where: published, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] })));

export const getJobs = cache(async () => ((await isPreview())
  ? prisma.job.findMany({ where: visible(true), orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] })
  : cachedJobs()));
const cachedJobs = cached('jobs', () => prisma.job.findMany({ where: published, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }));

const cachedFaq = cached('faq', (scope: string) => prisma.faqItem.findMany({ where: { scope, ...published }, orderBy: { displayOrder: 'asc' } }));
export const getFaq = cache(async (scope: string) => cachedFaq(scope));

// ---------------------------------------------------------------- Pages fixes

const cachedPage = cached('page', (key: string) => prisma.page.findUnique({ where: { key } }));
/** Contenu éditable d'une page fixe (textes des sections, SEO). */
export const getPage = cache(async (key: string) => {
  if (await isPreview()) {
    const row = await prisma.page.findUnique({ where: { key } });
    return row ? withDraft(row, true) : null;
  }
  return cachedPage(key);
});

/** Lit un champ texte éditable d'une page, avec repli sur la valeur de la maquette. */
export function pageText(page: { content: Prisma.JsonValue | null } | null, key: string, fallback: string): string {
  const content = (page?.content ?? {}) as Record<string, unknown>;
  const v = content[key];
  return typeof v === 'string' && v.trim() ? v : fallback;
}

// ---------------------------------------------------------------- Contenus éditables des pages

/** Textes éditables d'une page fixe, complétés par les valeurs de la maquette. */
export async function getPageContent(key: string): Promise<{ page: Awaited<ReturnType<typeof getPage>>; c: PageAccessor }> {
  const page = await getPage(key);
  const model = PAGE_CONTENT_MODELS[key];
  return { page, c: model ? resolvePage(model, page?.content) : resolvePage({ key, sections: [] }, page?.content) };
}
