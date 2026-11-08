import 'server-only';
import { prisma } from '@/lib/prisma';
import type { CollectionDef } from './fields';

/** Interface minimale commune aux délégués Prisma utilisés par l'administration. */
interface Delegate {
  findMany(args: object): Promise<Record<string, unknown>[]>;
  findUnique(args: object): Promise<Record<string, unknown> | null>;
  findFirst(args: object): Promise<Record<string, unknown> | null>;
  create(args: object): Promise<Record<string, unknown>>;
  update(args: object): Promise<Record<string, unknown>>;
  delete(args: object): Promise<Record<string, unknown>>;
  count(args?: object): Promise<number>;
}

const d = (x: unknown) => x as Delegate;
const DELEGATES: Record<string, () => Delegate> = {
  services: () => d(prisma.service),
  categories: () => d(prisma.category),
  villes: () => d(prisma.city),
  realisations: () => d(prisma.realisation),
  articles: () => d(prisma.article),
  presse: () => d(prisma.pressArticle),
  avis: () => d(prisma.testimonial),
  emplois: () => d(prisma.job),
  faq: () => d(prisma.faqItem),
};
/** Colonnes non nulles des modèles (extrait de prisma/schema.prisma). */
const REQUIRED: Record<string, string[]> = {
  services: ['slug', 'title', 'published', 'displayOrder', 'content'],
  categories: ['name', 'slug', 'displayOrder', 'published'],
  villes: ['slug', 'name', 'featured', 'status', 'displayOrder'],
  realisations: ['slug', 'title', 'featured', 'status', 'displayOrder'],
  articles: ['slug', 'title', 'body', 'status'],
  presse: ['slug', 'title', 'body', 'status'],
  avis: ['author', 'rating', 'quote', 'status', 'displayOrder'],
  emplois: ['slug', 'title', 'status', 'displayOrder'],
  faq: ['scope', 'question', 'answer', 'status', 'displayOrder'],
};
/** Colonnes non nulles disposant d'une valeur par défaut en base. */
const WITH_DEFAULT = new Set(['displayOrder', 'rating', 'featured', 'published', 'status']);

/**
 * Valeurs nulles sur des colonnes obligatoires : celles qui ont une valeur par défaut sont retirées
 * (défaut à la création, valeur existante conservée en modification) ; les autres sont signalées.
 */
export function checkRequiredColumns(key: string, data: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null && REQUIRED[key]?.includes(k)) {
      if (!WITH_DEFAULT.has(k)) errors[k] = 'Champ obligatoire.';
      continue;
    }
    out[k] = v;
  }
  return { data: out, errors };
}

const INCLUDES: Record<string, object | undefined> = { services: { category: { select: { id: true, name: true } } } };
/** Données supplémentaires pour les listes uniquement (jamais renvoyées lors de l'enregistrement). */
const LIST_INCLUDES: Record<string, object | undefined> = { ...INCLUDES, categories: { _count: { select: { services: true } } } };

export const repo = (key: string) => {
  const factory = DELEGATES[key];
  if (!factory) throw new Error(`Collection inconnue : ${key}`);
  return factory();
};

export async function listEntries(def: CollectionDef) {
  return repo(def.key).findMany({ orderBy: def.orderBy, ...(LIST_INCLUDES[def.key] ? { include: LIST_INCLUDES[def.key] } : {}) });
}

export async function getEntry(def: CollectionDef, id: string) {
  return repo(def.key).findUnique({ where: { id }, ...(INCLUDES[def.key] ? { include: INCLUDES[def.key] } : {}) });
}

/** Options des champs « relation ». */
export async function relationOptions() {
  const [categories, services, jobs] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true, slug: true } }),
    prisma.service.findMany({ orderBy: [{ displayOrder: 'asc' }, { title: 'asc' }], select: { id: true, title: true, slug: true, published: true } }),
    prisma.job.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true, slug: true } }),
  ]);
  return {
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, label: c.name })),
    services: services.map((s) => ({ id: s.id, slug: s.slug, label: s.published ? s.title : `${s.title} (non publié)` })),
    jobs: jobs.map((j) => ({ id: j.id, slug: j.slug, label: j.title })),
  };
}
export type RelationOptions = Awaited<ReturnType<typeof relationOptions>>;

/** Indique si un enregistrement est actuellement visible sur le site. */
export const isLive = (def: CollectionDef, row: Record<string, unknown>) =>
  def.status === 'boolean' ? row.published === true : def.status === 'content' ? row.status === 'PUBLISHED' : true;

/** Adresse publique d'un enregistrement (prévisualisation, lien « voir »). */
export const publicUrl = (def: CollectionDef, row: Record<string, unknown>) =>
  def.publicPath && typeof row.slug === 'string' ? def.publicPath.replace('{slug}', row.slug) : null;
