import 'server-only';
import { getArticles, getCatalog, getCities, getPressArticles, getRealisations } from './content';
import { urls } from './urls';

export type SearchType = 'service' | 'realisation' | 'article' | 'presse' | 'zone' | 'page';
export interface SearchResult {
  type: SearchType;
  cat: string;
  title: string;
  href: string;
  img: string | null;
  excerpt: string;
}
interface Doc extends SearchResult { hay: string }

export const SEARCH_TYPE_LABELS: Record<SearchType, string> = { service: 'Services', realisation: 'Réalisations', article: 'Articles', presse: 'Presse', zone: 'Villes', page: 'Pages' };

/** Minuscules sans accents (comparaison tolérante). */
export const normalize = (s: string | null | undefined) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const PAGES: [string, string, string][] = [
  ['Grands Comptes & Marchés Publics', urls.accounts(), 'grands comptes marches publics appel d offres multi-sites collectivites'],
  ["Nous rejoindre — offres d'emploi", urls.careers(), 'recrutement emploi offres candidature agent de proprete'],
  ['Notre histoire', urls.about(), 'histoire entreprise equipe valeurs panissieres'],
  ['Avis clients', urls.reviews(), 'avis clients temoignages note google'],
  ['Contact & devis gratuit', urls.contact(), 'contact devis telephone formulaire'],
  ['Nos réalisations', urls.realisations(), 'realisations chantiers photos avant apres'],
  ["Zones d'intervention", urls.zones(), 'zones intervention villes communes loire rhone'],
];

async function corpus(): Promise<Doc[]> {
  const [catalog, articles, cities, realisations, press] = await Promise.all([getCatalog(), getArticles(), getCities(), getRealisations(), getPressArticles()]);
  return [
    ...catalog.services.map((s) => ({ type: 'service' as const, cat: 'Service', title: s.title, href: s.href, img: s.image, excerpt: s.tagline || s.short, hay: normalize(`${s.title} ${s.tagline} ${s.short}`) })),
    ...articles.map((a) => ({ type: 'article' as const, cat: 'Article', title: a.title, href: a.href, img: a.image, excerpt: a.excerpt ?? '', hay: normalize(`${a.title} ${a.excerpt ?? ''} ${a.category ?? ''}`) })),
    ...cities.filter((c) => c.intro).map((c) => ({ type: 'zone' as const, cat: 'Ville', title: `Nettoyage à ${c.name}`, href: urls.city(c.slug), img: c.image, excerpt: c.intro ?? '', hay: normalize(`${c.name} ${c.sector ?? ''} ${c.intro ?? ''}`) })),
    ...realisations.map((r) => ({ type: 'realisation' as const, cat: 'Réalisation', title: r.title, href: urls.realisation(r.slug), img: r.image, excerpt: r.context ?? '', hay: normalize(`${r.title} ${r.city ?? ''} ${r.serviceLabel ?? ''} ${r.context ?? ''}`) })),
    ...press.map((p) => ({ type: 'presse' as const, cat: 'Presse', title: p.title, href: urls.pressArticle(p.slug), img: p.image, excerpt: p.excerpt ?? '', hay: normalize(`${p.title} ${p.excerpt ?? ''} ${p.media ?? ''}`) })),
    ...PAGES.map(([title, href, k]) => ({ type: 'page' as const, cat: 'Page', title, href, img: null, excerpt: '', hay: normalize(`${title} ${k}`) })),
  ];
}

/** Classement repris de la maquette : tous les mots doivent être présents ; bonus si présents dans le titre. */
export function rank<T extends { title: string; hay: string }>(docs: T[], query: string): T[] {
  const q = normalize(query).trim();
  if (!q) return docs;
  const tokens = q.split(/[^a-z0-9]+/).filter((w) => w.length > 1).map((w) => (w.length > 4 ? w.replace(/(es|s|x)$/, '') : w));
  if (!tokens.length) return [];
  return docs
    .map((d, idx) => {
      const t = normalize(d.title);
      const hay = `${d.hay} ${t}`;
      if (!tokens.every((w) => hay.includes(w))) return null;
      let score = 0;
      if (t === q) score += 20;
      if (t.startsWith(q)) score += 8;
      if (t.includes(q)) score += 6;
      for (const w of tokens) score += t.includes(w) ? 3 : 1;
      return { d, score, idx };
    })
    .filter((x): x is { d: T; score: number; idx: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((x) => x.d);
}

export async function search(query: string, limit?: number): Promise<SearchResult[]> {
  const ranked = rank(await corpus(), query.slice(0, 120));
  return (limit ? ranked.slice(0, limit) : ranked).map(({ hay: _hay, ...r }) => r);
}
