/* eslint-disable @next/next/no-img-element -- vignettes */
import Link from 'next/link';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PAGE_DEFINITIONS } from '@/lib/site/pages-registry';
import { PAGE_CONTENT_MODELS } from '@/lib/site/page-content';
import { pageToValues } from '@/lib/admin/page-forms';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';
import AdminShell from '@/components/admin/AdminShell';
import { Badge, fmtDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Pages principales', keys: ['accueil', 'a-propos', 'proprete-services', 'grands-comptes', 'zones-intervention', 'realisations', 'avis', 'nous-rejoindre', 'contact'] },
  { title: 'Médias', keys: ['medias', 'presse'] },
  { title: 'Blocs partagés', keys: ['blocs-communs'] },
  { title: 'Pages légales', keys: ['mentions-legales', 'politique-de-confidentialite', 'conditions-generales-d-utilisation', 'politique-des-cookies'] },
];

/** Première image d'une page (vignette). */
function firstImage(key: string, content: unknown) {
  const model = PAGE_CONTENT_MODELS[key];
  if (!model) return null;
  const v = pageToValues(model, content);
  for (const s of model.sections) for (const f of s.fields) {
    if (f.type === 'image' && typeof v[f.key] === 'string' && v[f.key]) return v[f.key] as string;
    if (f.type === 'list' && f.itemFields.some((x) => x.type === 'image')) {
      const imgKey = f.itemFields.find((x) => x.type === 'image')!.key;
      const first = (v[f.key] as Record<string, string>[]).find((it) => it[imgKey]);
      if (first) return first[imgKey]!;
    }
  }
  return null;
}

export default async function PagesPage() {
  await requirePermission('content:view');
  const rows = await prisma.page.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <AdminShell title="Pages">
      <p className="m-0 mb-6 text-[14px] text-zinc-500">Modifiez les textes et les images de chaque page. La mise en page reste fixe : rien ne peut être cassé. Les services, villes, réalisations et articles se gèrent dans leurs rubriques.</p>
      {GROUPS.map((g) => (
        <section key={g.title} className="mb-8">
          <h2 className="m-0 mb-2.5 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">{g.title}</h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-[14px]">
              <thead><tr className="border-b border-zinc-200 text-left text-[13px] text-zinc-500"><th className="px-4 py-2.5 font-medium">Page</th><th className="px-3 py-2.5 font-medium">Statut</th><th className="px-3 py-2.5 font-medium">Mis à jour</th><th className="px-4"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {g.keys.map((key) => {
                  const def = PAGE_DEFINITIONS.find((d) => d.key === key);
                  if (!def) return null;
                  const row = byKey.get(key);
                  const model = PAGE_CONTENT_MODELS[key];
                  const img = firstImage(key, row?.content);
                  const href = `${ADMIN_BASE_PATH}/pages/${key}`;
                  return (
                    <tr key={key} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60">
                      <td className="px-4 py-2.5">
                        <Link href={href} className="flex items-center gap-3 text-zinc-950 no-underline">
                          <span className="h-9 w-14 flex-none overflow-hidden rounded bg-zinc-100">{img && <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />}</span>
                          <span><span className="block font-medium">{def.title}</span><span className="block text-[12.5px] text-zinc-500">{key === 'blocs-communs' ? 'Engagements et bandeaux repris sur plusieurs pages' : def.path} · {model?.sections.length ?? 0} section{(model?.sections.length ?? 0) > 1 ? 's' : ''}</span></span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5"><span className="inline-flex gap-1"><Badge tone="green">Publié</Badge>{row?.draft ? <Badge tone="orange">Modifié</Badge> : null}</span></td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-600">{row ? fmtDate(row.updatedAt) : '—'}</td>
                      <td className="px-4 py-2.5 text-right"><Link href={href} className="inline-flex h-8 items-center rounded-md border border-zinc-200 bg-white px-2.5 text-[13.5px] text-zinc-900 no-underline hover:bg-zinc-50">Modifier</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </AdminShell>
  );
}
