/**
 * Import NON DESTRUCTIF des contenus de la refonte 2026.
 *
 * - Ne supprime jamais rien, n'écrase jamais une valeur existante.
 * - Services existants : seuls les champs de contenu ABSENTS sont ajoutés ;
 *   titre, slug et statut de publication ne sont pas modifiés.
 * - Les contenus que ASPEO doit encore valider (maquettes/export-dev/Contenus a valider.md)
 *   sont importés en BROUILLON, sauf si --publish-unvalidated (base de développement uniquement).
 *
 * Usage :
 *   npx tsx scripts/import-refonte.ts --dry-run          # simulation, aucune écriture
 *   npx tsx scripts/import-refonte.ts                    # import (prudent)
 *   npx tsx scripts/import-refonte.ts --publish-unvalidated --assign-categories   # base de dev
 */
import 'dotenv/config';
import { PrismaClient, Prisma, type ContentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import data from '../prisma/seed-data/refonte-2026.json';
import { DEFAULT_SETTINGS } from '../src/lib/site/settings-defaults';
import { LEGACY_REDIRECTS } from '../src/lib/site/redirects-defaults';
import { PAGE_DEFINITIONS } from '../src/lib/site/pages-registry';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const PUBLISH_UNVALIDATED = args.has('--publish-unvalidated');
const ASSIGN_CATEGORIES = args.has('--assign-categories');

const prisma = new PrismaClient({ adapter: new PrismaPg(new pg.Pool({ connectionString: process.env.DATABASE_URL })) });
const report: string[] = [];
const log = (s: string) => { report.push(s); console.log(s); };
const unvalidated = (): ContentStatus => (PUBLISH_UNVALIDATED ? 'PUBLISHED' : 'DRAFT');
const json = (v: unknown) => v as Prisma.InputJsonValue;

async function write<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  if (DRY) { log(`[simulation] ${label}`); return null; }
  const r = await fn(); log(`✔ ${label}`); return r;
}

async function settings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (existing) { log(`= réglage « ${key} » déjà présent (inchangé)`); continue; }
    await write(`réglage « ${key} » créé`, () => prisma.siteSetting.create({ data: { key, value: json(value), updatedBy: 'import-refonte' } }));
  }
}

async function categories() {
  for (const c of data.categories) {
    const existing = await prisma.category.findFirst({ where: { OR: [{ slug: c.slug }, { name: c.name }] } });
    if (!existing) {
      await write(`catégorie « ${c.name} » créée`, () => prisma.category.create({ data: { slug: c.slug, name: c.name, pole: c.pole, description: c.description, displayOrder: c.displayOrder, content: json(c.content) } }));
      continue;
    }
    const patch: Prisma.CategoryUpdateInput = {};
    if (!existing.pole) patch.pole = c.pole;
    if (!existing.description) patch.description = c.description;
    if (!existing.content) patch.content = json(c.content);
    if (Object.keys(patch).length) await write(`catégorie « ${existing.name} » complétée (${Object.keys(patch).join(', ')})`, () => prisma.category.update({ where: { id: existing.id }, data: patch }));
    else log(`= catégorie « ${existing.name} » déjà complète`);
  }
}

async function services() {
  const cats = await prisma.category.findMany();
  const catId = (slug: string | null) => (slug ? cats.find((c) => c.slug === slug)?.id ?? null : null);
  for (const s of data.services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      const published = s.published && (PUBLISH_UNVALIDATED || !('toWrite' in s.content));
      await write(`service « ${s.title} » créé (${published ? 'publié' : 'non publié'})`, () =>
        prisma.service.create({ data: { slug: s.slug, title: s.title, subtitle: s.subtitle, seoTitle: s.seoTitle, seoDesc: s.seoDesc, published, publishedAt: published ? new Date() : null, displayOrder: s.displayOrder, categoryId: catId(s.categorySlug), content: json(s.content) } }));
      continue;
    }
    const current = (existing.content ?? {}) as Record<string, unknown>;
    const incoming = s.content as Record<string, unknown>;
    const added = Object.keys(incoming).filter((k) => incoming[k] !== null && incoming[k] !== undefined && (current[k] === undefined || current[k] === null));
    const patch: Prisma.ServiceUpdateInput = {};
    if (added.length) patch.content = json({ ...Object.fromEntries(added.map((k) => [k, incoming[k]])), ...current });
    if (existing.displayOrder === 0) patch.displayOrder = s.displayOrder;
    const target = catId(s.categorySlug);
    if (target && existing.categoryId !== target) {
      if (!existing.categoryId || ASSIGN_CATEGORIES) patch.category = { connect: { id: target } };
      else log(`! service « ${existing.title} » : catégorie actuelle conservée (relancer avec --assign-categories pour le classer dans « ${s.categorySlug} »)`);
    }
    if (data.notCommercial.includes(s.slug) && existing.published) log(`! service « ${existing.title} » est publié alors que la consigne est de ne plus le proposer : à dépublier depuis l'admin après validation.`);
    if (Object.keys(patch).length) await write(`service « ${existing.title} » complété (${added.join(', ') || 'ordre/catégorie'})`, () => prisma.service.update({ where: { id: existing.id }, data: patch }));
    else log(`= service « ${existing.title} » déjà complet`);
  }
}

async function createMany<T extends { slug: string }>(label: string, items: T[], exists: (slug: string) => Promise<unknown>, create: (item: T) => Promise<unknown>) {
  for (const item of items) {
    if (await exists(item.slug)) { log(`= ${label} « ${item.slug} » déjà présent`); continue; }
    await write(`${label} « ${item.slug} » créé`, () => create(item));
  }
}

async function contents() {
  const status = unvalidated();
  const pub = (s: ContentStatus) => (s === 'PUBLISHED' ? new Date() : null);
  await createMany('ville', data.villes, (slug) => prisma.city.findUnique({ where: { slug } }), (v) =>
    prisma.city.create({ data: { slug: v.slug, name: v.name, sector: v.sector, distance: v.distance, focusService: v.focusService, image: v.image, imageAlt: `Intervention ASPEO à ${v.name}`, intro: v.intro, sectorText: v.sectorText, whyText: v.whyText, urgencyText: v.urgencyText, insalubreText: v.insalubreText, practicalText: v.practicalText, caseText: v.caseText, mapX: v.mapX ?? null, mapY: v.mapY ?? null, displayOrder: v.displayOrder, featured: true, status, publishedAt: pub(status) } }));
  await createMany('ville (fiche à rédiger)', data.emptyCities, (slug) => prisma.city.findUnique({ where: { slug } }), (v) =>
    prisma.city.create({ data: { slug: v.slug, name: v.name, displayOrder: v.displayOrder, status: 'DRAFT' } }));
  // Réalisations : exemples de la maquette (fictifs) -> toujours en brouillon tant qu'ils ne sont pas remplacés.
  await createMany('réalisation', data.realisations, (slug) => prisma.realisation.findUnique({ where: { slug } }), (r) =>
    prisma.realisation.create({ data: { slug: r.slug, title: r.title, pole: r.pole, serviceSlug: r.serviceSlug, serviceLabel: r.serviceLabel, city: r.city, client: r.client, dateLabel: r.dateLabel, image: r.image, imageAlt: r.title, facts: json(r.facts), context: r.context, constraints: r.constraints, intervention: r.intervention, result: r.result, displayOrder: r.displayOrder, status, publishedAt: pub(status) } }));
  await createMany('article', data.articles, (slug) => prisma.article.findUnique({ where: { slug } }), (a) => {
    const real = a.source === 'site-actuel';
    const st: ContentStatus = real ? 'PUBLISHED' : status;
    return prisma.article.create({ data: { slug: a.slug, title: a.title, category: a.category, excerpt: a.excerpt, image: a.image, imageAlt: a.title, body: a.body, tags: 'tags' in a ? (a.tags as string[]) : [], faq: 'faq' in a && a.faq ? json(a.faq) : undefined, status: st, publishedAt: a.publishedAt ? new Date(a.publishedAt) : pub(st) } });
  });
  await createMany('article de presse', data.presse, (slug) => prisma.pressArticle.findUnique({ where: { slug } }), (p) =>
    prisma.pressArticle.create({ data: { slug: p.slug, title: p.title, media: p.media, type: p.type, dateLabel: p.dateLabel, excerpt: p.excerpt, body: p.body, image: p.image, status, publishedAt: p.publishedAt ? new Date(p.publishedAt) : pub(status) } }));
  await createMany('offre d\'emploi', data.jobs, (slug) => prisma.job.findUnique({ where: { slug } }), (j) =>
    prisma.job.create({ data: { ...j, status, publishedAt: pub(status) } }));
  if (await prisma.testimonial.count() === 0) {
    await write(`${data.testimonials.length} avis clients importés`, () => prisma.testimonial.createMany({ data: data.testimonials.map((t) => ({ ...t, status: 'PUBLISHED' as const, source: 'google' })) }));
  } else log('= avis clients déjà présents');
  if (await prisma.faqItem.count({ where: { scope: 'accueil' } }) === 0) {
    await write('FAQ de l\'accueil importée', () => prisma.faqItem.createMany({ data: data.faq.map((f) => ({ ...f, status: 'PUBLISHED' as const })) }));
  } else log('= FAQ accueil déjà présente');
}

async function pages() {
  for (const p of PAGE_DEFINITIONS) {
    if (await prisma.page.findUnique({ where: { key: p.key } })) { log(`= page « ${p.title} » déjà présente`); continue; }
    await write(`page « ${p.title} » créée`, () => prisma.page.create({ data: { key: p.key, title: p.title, path: p.path, seoTitle: p.seoTitle, seoDesc: p.seoDesc, noindex: p.noindex ?? false, status: 'PUBLISHED', publishedAt: new Date() } }));
  }
}

async function redirects() {
  for (const r of LEGACY_REDIRECTS) {
    if (await prisma.redirect.findUnique({ where: { source: r.source } })) { log(`= redirection ${r.source} déjà présente`); continue; }
    await write(`redirection ${r.source} → ${r.destination}`, () => prisma.redirect.create({ data: { source: r.source, destination: r.destination, permanent: true, note: r.note } }));
  }
}

async function main() {
  console.log(DRY ? '— SIMULATION (aucune écriture) —' : '— IMPORT —');
  await settings();
  await categories();
  await services();
  await contents();
  await pages();
  await redirects();
  console.log(`\nTerminé. ${report.filter((l) => l.startsWith('!')).length} point(s) à vérifier.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
