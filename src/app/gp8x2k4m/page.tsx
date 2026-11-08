import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ADMIN_BASE_PATH as B } from '@/lib/constants/admin';
import { seoAudit, titleLevel, descLevel } from '@/lib/admin/seo-audit';
import { quoteRows } from '@/lib/admin/leads';
import AdminShell from '@/components/admin/AdminShell';
import { LEAD_STATUS } from '@/lib/admin/lead-status';
import { Badge, relativeTime } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const VERB: Record<string, string> = { create: 'a ajouté', update: 'a modifié', draft: 'a enregistré un brouillon de', publish: 'a publié', unpublish: 'a dépublié', archive: 'a archivé', delete: 'a supprimé', upload: 'a ajouté', settings: 'a mis à jour', status: 'a traité' };
const RESOURCE: Record<string, [string, string | null]> = {
  services: ['le service', 'contenus/services'], categories: ['la catégorie', 'contenus/categories'], villes: ['la ville', 'contenus/villes'], realisations: ['la réalisation', 'contenus/realisations'],
  articles: ['l’article', 'contenus/articles'], presse: ['la parution', 'contenus/presse'], avis: ['l’avis', 'contenus/avis'], emplois: ['l’offre', 'contenus/emplois'], faq: ['la question', 'contenus/faq'],
  pages: ['la page', 'pages'], medias: ['des images :', null], reglages: ['', null], redirections: ['la redirection', null], demandes: ['la demande de', null], candidatures: ['la candidature de', null],
};
const initials = (s: string) => s.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

async function countPending() {
  const [b, c, d, e, f, g] = await Promise.all([
    prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*) AS n FROM "Service" WHERE draft IS NOT NULL`,
    prisma.$queryRaw<{ n: bigint }[]>`SELECT (SELECT COUNT(*) FROM "City" WHERE draft IS NOT NULL OR status = 'DRAFT') + (SELECT COUNT(*) FROM "Realisation" WHERE draft IS NOT NULL OR status = 'DRAFT') AS n`,
    prisma.$queryRaw<{ n: bigint }[]>`SELECT (SELECT COUNT(*) FROM "Article" WHERE draft IS NOT NULL OR status = 'DRAFT') + (SELECT COUNT(*) FROM "PressArticle" WHERE draft IS NOT NULL OR status = 'DRAFT') AS n`,
    prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*) AS n FROM "Page" WHERE draft IS NOT NULL`,
    prisma.service.count({ where: { published: false } }),
    prisma.$queryRaw<{ n: bigint }[]>`SELECT (SELECT COUNT(*) FROM "Testimonial" WHERE status = 'DRAFT') + (SELECT COUNT(*) FROM "Job" WHERE status = 'DRAFT') + (SELECT COUNT(*) FROM "FaqItem" WHERE status = 'DRAFT') AS n`,
  ]);
  return [b, c, d, e, g].reduce((n, r) => n + Number(r[0]?.n ?? 0), 0) + f;
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const role = session.user.role;
  const canLeads = hasPermission(role, 'leads:view');
  const [newLeads, recent, logs, pending, seo, missingAlt] = await Promise.all([
    prisma.quoteRequest.count({ where: { status: 'NEW' } }),
    canLeads ? prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }) : Promise.resolve([]),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    countPending(),
    seoAudit(),
    prisma.media.count({ where: { OR: [{ alt: null }, { alt: '' }] } }),
  ]);
  const seoToFix = seo.filter((r) => titleLevel(r.title) !== 'ok' || descLevel(r.desc) !== 'ok').length;

  const stat = (label: string, n: number, sub: string, href: string, accent = false) => (
    <Link href={href} className="block rounded-lg border border-zinc-200 bg-white p-4 text-zinc-950 no-underline hover:border-zinc-300">
      <p className="m-0 text-[13.5px] text-zinc-500">{label}</p>
      <p className={`m-0 mt-1 text-[28px] font-semibold leading-tight ${accent && n > 0 ? 'text-[#C74700]' : ''}`}>{n}</p>
      <p className="m-0 text-[13px] text-zinc-500">{sub}</p>
    </Link>
  );
  const shortcuts: [string, string][] = [
    ['Modifier la page d’accueil', `${B}/pages/accueil`], ['Ajouter une réalisation', `${B}/contenus/realisations/nouveau`],
    ['Publier un article', `${B}/contenus/articles/nouveau`], ['Mettre à jour les horaires', `${B}/reglages/company`],
  ];

  return (
    <AdminShell title="Tableau de bord">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stat('Demandes à traiter', newLeads, 'nouvelles demandes de devis', `${B}/demandes`, true)}
        {stat('En attente de publication', pending, 'brouillons et modifications', `${B}/contenus/services`)}
        {stat('Référencement à corriger', seoToFix, 'titres ou descriptions', `${B}/referencement`)}
        {stat('Images sans texte alternatif', missingAlt, 'à compléter', `${B}/medias`)}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {canLeads && (
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3.5"><h2 className="m-0 text-[15px] font-semibold">Demandes de devis récentes</h2><Link href={`${B}/demandes`} className="text-[13.5px] font-medium text-[#06226D]">Tout voir →</Link></div>
              {recent.length ? (
                <ul className="m-0 list-none p-0">
                  {quoteRows(recent).map((r) => (
                    <li key={r.id} className="border-b border-zinc-100 last:border-0">
                      <Link href={`${B}/demandes?id=${r.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-zinc-950 no-underline hover:bg-zinc-50">
                        <span className="min-w-0"><span className="block font-medium">{r.name}</span><span className="block truncate text-[13px] text-zinc-500">{r.need} · {r.date}</span></span>
                        <Badge tone={LEAD_STATUS[r.status]?.tone}>{LEAD_STATUS[r.status]?.label}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="m-0 px-4 py-6 text-[14px] text-zinc-500">Aucune demande pour le moment.</p>}
            </section>
          )}
          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-4 py-3.5"><h2 className="m-0 text-[15px] font-semibold">Raccourcis</h2></div>
            <div className="grid gap-2 p-4">
              {shortcuts.map(([l, h]) => <Link key={h} href={h} className="flex items-center justify-between rounded-md border border-zinc-200 px-3.5 py-2.5 text-[14.5px] text-zinc-950 no-underline hover:bg-zinc-50">{l}<ArrowRight className="h-4 w-4 text-zinc-500" /></Link>)}
            </div>
          </section>
        </div>
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-4 py-3.5"><h2 className="m-0 text-[15px] font-semibold">Dernières modifications</h2></div>
          {logs.length ? (
            <ul className="m-0 list-none p-0">
              {logs.map((l) => {
                const [what, path] = RESOURCE[l.resource] ?? ['', null];
                const href = path && l.resourceId && l.action !== 'delete' ? `${B}/${path}/${l.resourceId}` : null;
                return (
                  <li key={l.id} className="flex gap-3 border-b border-zinc-100 px-4 py-3 last:border-0">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600" aria-hidden="true">{initials(l.userName ?? '?')}</span>
                    <span className="min-w-0 text-[14px]">
                      <strong className="font-semibold">{l.userName}</strong> {VERB[l.action] ?? l.action} {what}{' '}
                      {href ? <Link href={href} className="text-[#06226D]">{l.resourceName}</Link> : <span className="text-[#06226D]">{l.resourceName}</span>}
                      <span className="block text-[12.5px] text-zinc-500">{relativeTime(l.createdAt)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : <p className="m-0 px-4 py-6 text-[14px] text-zinc-500">Les modifications faites dans l’administration apparaîtront ici.</p>}
        </section>
      </div>
    </AdminShell>
  );
}
