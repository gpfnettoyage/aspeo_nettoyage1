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
const INCLUDES: Record<string, object | undefined> = { services: { category: { select: { id: true, name: true } } } };

export const repo = (key: string) => {
  const factory = DELEGATES[key];
  if (!factory) throw new Error(`Collection inconnue : ${key}`);
  return factory();
};

export async function listEntries(def: CollectionDef) {
  return repo(def.key).findMany({ orderBy: def.orderBy, ...(INCLUDES[def.key] ? { include: INCLUDES[def.key] } : {}) });
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
