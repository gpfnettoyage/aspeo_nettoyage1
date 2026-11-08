'use client';

/* eslint-disable @next/next/no-img-element -- vignettes (URL variables) */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { setEntryStatusAction, deleteEntryAction } from '@/actions/admin/content.actions';
import { ConfirmDialog, useToast } from './feedback';
import { Badge, Btn, Segmented, inputCls, type Tone } from './ui';

export interface ListRow {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  cells: { text: string; tone?: Tone; badge?: boolean }[];
  state: 'live' | 'offline' | 'archived';
  pending: boolean;
  search: string;
  filter?: string;
}

interface Props {
  collection: string;
  singular: string;
  basePath: string;
  columns: string[];
  rows: ListRow[];
  statusMode: 'content' | 'boolean' | 'none';
  can: { publish: boolean; delete: boolean };
  filter?: { label: string; options: { value: string; label: string }[] };
  hasImage: boolean;
  gender: 'm' | 'f';
}

export default function EntryList({ collection, singular, basePath, columns, rows, statusMode, can, filter, hasImage, gender }: Props) {
  const router = useRouter();
  const { say, node: toast } = useToast();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'live' | 'offline'>('all');
  const [scope, setScope] = useState('');
  const [busy, start] = useTransition();
  const [toDelete, setToDelete] = useState<ListRow | null>(null);

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shown = useMemo(() => rows.filter((r) =>
    (tab === 'all' || (tab === 'live' ? r.state === 'live' : r.state !== 'live'))
    && (!scope || r.filter === scope)
    && (!q.trim() || norm(r.search).includes(norm(q.trim())))), [rows, tab, q, scope]);

  const counts = { all: rows.length, live: rows.filter((r) => r.state === 'live').length, offline: rows.filter((r) => r.state !== 'live').length };

  const status = (r: ListRow, s: 'publish' | 'unpublish') => start(async () => {
    const res = await setEntryStatusAction(collection, r.id, s);
    say(res.message, !res.ok);
    if (res.ok) router.refresh();
  });
  const remove = () => start(async () => {
    if (!toDelete) return;
    const res = await deleteEntryAction(collection, toDelete.id);
    say(res.message, !res.ok);
    setToDelete(null);
    if (res.ok) router.refresh();
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="search" className={`${inputCls} max-w-xs`} placeholder={`Rechercher ${gender === 'f' ? 'une' : 'un'} ${singular}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
        {statusMode !== 'none' && <Segmented label="Filtrer par statut" value={tab} onChange={setTab} options={[{ value: 'all', label: 'Tous' }, { value: 'live', label: 'Publiés' }, { value: 'offline', label: 'Brouillons' }]} />}
        {filter && (
          <select className={`${inputCls} w-auto`} value={scope} onChange={(e) => setScope(e.target.value)} aria-label={filter.label}>
            <option value="">{filter.label} : toutes</option>
            {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        <span className="ml-auto text-[13.5px] text-zinc-500">{shown.length} sur {counts.all}</span>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-[14px] text-zinc-500">
          {rows.length ? 'Aucun résultat pour ces filtres.' : `Aucun contenu pour le moment.`}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[720px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[13px] text-zinc-500">
                <th className="px-4 py-2.5 font-medium">{singular.charAt(0).toUpperCase() + singular.slice(1)}</th>
                {columns.map((c) => <th key={c} className="px-3 py-2.5 font-medium">{c}</th>)}
                <th className="px-4 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60">
                  <td className="px-4 py-2.5">
                    <Link href={`${basePath}/${r.id}`} className="flex items-center gap-3 text-zinc-950 no-underline">
                      {hasImage && <span className="h-9 w-12 flex-none overflow-hidden rounded bg-zinc-100">{r.image && <img src={r.image} alt="" className="h-full w-full object-cover" loading="lazy" />}</span>}
                      <span className="min-w-0">
                        <span className="block font-medium">{r.title || '(sans titre)'}</span>
                        {r.subtitle && <span className="block max-w-[420px] truncate text-[12.5px] text-zinc-500">{r.subtitle}</span>}
                      </span>
                    </Link>
                  </td>
                  {r.cells.map((c, i) => (
                    <td key={i} className="whitespace-nowrap px-3 py-2.5 text-zinc-600">
                      {c.tone || c.badge ? <span className="inline-flex gap-1"><Badge tone={c.tone ?? 'gray'}>{c.text}</Badge>{c.tone && r.pending && <Badge tone="orange">Modifié</Badge>}</span> : c.text}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`${basePath}/${r.id}`} className="inline-flex h-8 items-center rounded-md border border-zinc-200 bg-white px-2.5 text-[13.5px] text-zinc-900 no-underline hover:bg-zinc-50">Modifier</Link>
                      {statusMode !== 'none' && can.publish && (r.state === 'live'
                        ? <Btn size="sm" disabled={busy} onClick={() => status(r, 'unpublish')}>Dépublier</Btn>
                        : <Btn size="sm" disabled={busy} onClick={() => status(r, 'publish')}>Publier</Btn>)}
                      {can.delete && <Btn size="sm" variant="danger" disabled={busy} onClick={() => setToDelete(r)}>Supprimer</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!toDelete} busy={busy} title={`Supprimer « ${toDelete?.title ?? ''} » ?`} confirmLabel="Supprimer définitivement" onCancel={() => setToDelete(null)} onConfirm={remove}>
        Cette action est irréversible. Pour retirer temporairement un contenu du site, utilisez plutôt « Dépublier ».
      </ConfirmDialog>
      {toast}
    </div>
  );
}
