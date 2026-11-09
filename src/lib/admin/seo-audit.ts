import 'server-only';
import { prisma } from '@/lib/prisma';
import { PAGE_DEFINITIONS } from '@/lib/site/pages-registry';
import { PAGE_CONTENT_MODELS } from '@/lib/site/page-content';
import { urls } from '@/lib/site/urls';
import { ADMIN_BASE_PATH as B } from '@/lib/constants/admin';

export type SeoKind = 'Page' | 'Service' | 'Activité' | 'Ville' | 'Réalisation' | 'Article' | 'Presse';
export interface SeoRow { kind: SeoKind; name: string; path: string; title: string; desc: string; customTitle: boolean; customDesc: boolean; edit: string; noindex: boolean }
export type SeoLevel = 'ok' | 'long' | 'short' | 'missing';

export const titleLevel = (t: string): SeoLevel => (!t ? 'missing' : t.length > 60 ? 'long' : t.length < 20 ? 'short' : 'ok');
export const descLevel = (d: string): SeoLevel => (!d ? 'missing' : d.length > 160 ? 'long' : d.length < 70 ? 'short' : 'ok');

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const c = (row: { content: unknown }) => (row.content && typeof row.content === 'object' ? (row.content as Record<string, unknown>) : {});

/**
 * Titre et description effectivement servis à Google pour chaque page publiée
 * (mêmes règles de repli que les generateMetadata du site public).
 */
export async function seoAudit(): Promise<SeoRow[]> {
  const pub = { status: 'PUBLISHED' as const };
  const [pages, services, categories, cities, realisations, articles, press] = await Promise.all([
    prisma.page.findMany(), prisma.service.findMany({ where: { published: true }, orderBy: [{ displayOrder: 'asc' }] }),
    prisma.category.findMany({ where: { published: true }, orderBy: [{ displayOrder: 'asc' }] }), prisma.city.findMany({ where: pub, orderBy: [{ displayOrder: 'asc' }] }),
    prisma.realisation.findMany({ where: pub, orderBy: [{ displayOrder: 'asc' }] }), prisma.article.findMany({ where: pub, orderBy: { publishedAt: 'desc' } }),
    prisma.pressArticle.findMany({ where: pub, orderBy: { publishedAt: 'desc' } }),
  ]);
  const byKey = new Map(pages.map((p) => [p.key, p]));
  const rows: SeoRow[] = [];
  for (const d of PAGE_DEFINITIONS) {
    if (d.key === 'blocs-communs' || !PAGE_CONTENT_MODELS[d.key]) continue;
    const p = byKey.get(d.key);
    rows.push({ kind: 'Page', name: d.title, path: d.path, title: p?.seoTitle || d.seoTitle, desc: p?.seoDesc || d.seoDesc, customTitle: !!p?.seoTitle, customDesc: !!p?.seoDesc, edit: `${B}/pages/${d.key}`, noindex: !!(p?.noindex || d.noindex) });
  }
  for (const s of services) {
    const tagline = str(c(s).tagline);
    rows.push({ kind: 'Service', name: s.title, path: urls.service(s.slug), title: s.seoTitle || `${s.title.length > 36 ? s.title : `${s.title} — Loire & Rhône`} | ASPEO`,
      desc: s.seoDesc || (s.subtitle || tagline ? `${(s.subtitle || tagline).replace(/\.$/, '')}. Loire et Rhône, devis gratuit sous 24h après la visite.`.slice(0, 158) : ''),
      customTitle: !!s.seoTitle, customDesc: !!s.seoDesc, edit: `${B}/contenus/services/${s.id}`, noindex: false });
  }
  for (const k of categories) rows.push({ kind: 'Activité', name: k.name, path: urls.category(k.slug), title: k.seoTitle || `${k.name} | ASPEO`, desc: k.seoDesc || str(c(k).subtitle) || k.description || '', customTitle: !!k.seoTitle, customDesc: !!k.seoDesc, edit: `${B}/contenus/categories/${k.id}`, noindex: false });
  for (const v of cities) rows.push({ kind: 'Ville', name: v.name, path: urls.city(v.slug), title: v.seoTitle || `Nettoyage Professionnel à ${v.name} | ASPEO`,
    desc: v.seoDesc || `ASPEO intervient à ${v.name}${v.sector ? ` (${v.sector})` : ''} pour le nettoyage professionnel, l'insalubrité et la remise en état. ${v.distance ? `${v.distance}. ` : ''}Devis gratuit sous 24h après la visite.`,
    customTitle: !!v.seoTitle, customDesc: !!v.seoDesc, edit: `${B}/contenus/villes/${v.id}`, noindex: false });
  for (const r of realisations) rows.push({ kind: 'Réalisation', name: r.title, path: urls.realisation(r.slug), title: r.seoTitle || `${r.title}${r.city ? ` — ${r.city}` : ''} | ASPEO`, desc: r.seoDesc || (r.context ?? '').slice(0, 155), customTitle: !!r.seoTitle, customDesc: !!r.seoDesc, edit: `${B}/contenus/realisations/${r.id}`, noindex: false });
  for (const a of articles) rows.push({ kind: 'Article', name: a.title, path: urls.article(a.slug), title: a.seoTitle || `${a.title} | Blog ASPEO`, desc: a.seoDesc || a.excerpt || '', customTitle: !!a.seoTitle, customDesc: !!a.seoDesc, edit: `${B}/contenus/articles/${a.id}`, noindex: false });
  for (const p of press) rows.push({ kind: 'Presse', name: p.title, path: urls.pressArticle(p.slug), title: p.seoTitle || `${p.title}${p.media ? ` | ${p.media}` : ''} | ASPEO`, desc: p.seoDesc || p.excerpt || '', customTitle: !!p.seoTitle, customDesc: !!p.seoDesc, edit: `${B}/contenus/presse/${p.id}`, noindex: false });
  return rows;
}
