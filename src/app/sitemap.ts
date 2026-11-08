import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/site/settings-defaults';
import { PAGE_DEFINITIONS } from '@/lib/site/pages-registry';
import { urls } from '@/lib/site/urls';

/**
 * Sitemap dynamique : pages fixes indexables + contenus publiés (services, activités, villes,
 * réalisations, articles, presse). Les brouillons, archives et pages noindex sont exclus.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SETTINGS.company.website).replace(/\/$/, '');
  const at = (path: string) => `${base}${path}`;
  const pub = { status: 'PUBLISHED' as const };
  const [pages, services, categories, cities, realisations, articles, press] = await Promise.all([
    prisma.page.findMany({ select: { key: true, noindex: true, status: true, updatedAt: true } }),
    prisma.service.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { published: true, services: { some: { published: true } } }, select: { slug: true, updatedAt: true } }),
    prisma.city.findMany({ where: { ...pub, intro: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.realisation.findMany({ where: pub, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ where: { ...pub, publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    prisma.pressArticle.findMany({ where: pub, select: { slug: true, updatedAt: true } }),
  ]);
  const pageRows = new Map(pages.map((p) => [p.key, p]));
  const fixed = PAGE_DEFINITIONS.filter((d) => {
    const row = pageRows.get(d.key);
    return !d.noindex && !(row?.noindex) && row?.status !== 'DRAFT' && d.key !== 'actualites';
  }).map((d) => ({ url: at(d.path), lastModified: pageRows.get(d.key)?.updatedAt ?? new Date(), changeFrequency: 'monthly' as const, priority: d.path === '/' ? 1 : d.key.includes('politique') || d.key.includes('mentions') || d.key.includes('conditions') ? 0.2 : 0.8 }));

  return [
    ...fixed,
    ...categories.map((c) => ({ url: at(urls.category(c.slug)), lastModified: c.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...services.map((s) => ({ url: at(urls.service(s.slug)), lastModified: s.updatedAt, changeFrequency: 'monthly' as const, priority: 0.9 })),
    ...cities.map((c) => ({ url: at(urls.city(c.slug)), lastModified: c.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...realisations.map((r) => ({ url: at(urls.realisation(r.slug)), lastModified: r.updatedAt, changeFrequency: 'yearly' as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: at(urls.article(a.slug)), lastModified: a.updatedAt, changeFrequency: 'yearly' as const, priority: 0.6 })),
    ...press.map((p) => ({ url: at(urls.pressArticle(p.slug)), lastModified: p.updatedAt, changeFrequency: 'yearly' as const, priority: 0.4 })),
  ];
}
