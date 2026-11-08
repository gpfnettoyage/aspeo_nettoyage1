'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Segmented, type Tone } from './ui';

export interface SeoTableRow { kind: string; name: string; path: string; title: string; desc: string; customTitle: boolean; customDesc: boolean; edit: string; noindex: boolean; titleLevel: string; descLevel: string }

const tone = (l: string): Tone => (l === 'ok' ? 'green' : l === 'missing' ? 'red' : 'orange');
const label = (l: string, n: number, kind: 'title' | 'desc') => (l === 'missing' ? 'Manquant' : l === 'long' ? `${n} car. · trop long` : l === 'short' ? `${n} car. · ${kind === 'title' ? 'court' : 'courte'}` : `${n} car.`);

export default function SeoTable({ rows }: { rows: SeoTableRow[] }) {
  const [tab, setTab] = useState<'all' | 'fix' | 'Page' | 'Service' | 'Ville' | 'other'>('all');
  const fix = (r: SeoTableRow) => r.titleLevel !== 'ok' || r.descLevel !== 'ok';
  const shown = rows.filter((r) => tab === 'all' || (tab === 'fix' ? fix(r) : tab === 'other' ? !['Page', 'Service', 'Ville'].includes(r.kind) : r.kind === tab));
  return (
    <div>
      <div className="mb-3"><Segmented label="Filtrer" value={tab} onChange={setTab} options={[{ value: 'all', label: 'Toutes' }, { value: 'fix', label: 'À corriger', count: rows.filter(fix).length }, { value: 'Page', label: 'Pages' }, { value: 'Service', label: 'Services' }, { value: 'Ville', label: 'Villes' }, { value: 'other', label: 'Autres' }]} /></div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full min-w-[860px] border-collapse text-[14px]">
          <thead><tr className="border-b border-zinc-200 text-left text-[13px] text-zinc-500"><th className="px-4 py-2.5 font-medium">Page</th><th className="px-3 py-2.5 font-medium">Titre Google</th><th className="px-3 py-2.5 font-medium">Description</th><th className="px-4"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.kind}${r.path}`} className="border-b border-zinc-100 align-top last:border-0">
                <td className="px-4 py-2.5"><span className="block font-medium">{r.name}</span><span className="block text-[12.5px] text-zinc-500">{r.kind} · {r.path}{r.noindex ? ' · non indexée' : ''}</span></td>
                <td className="max-w-[360px] px-3 py-2.5"><span className="block truncate" title={r.title}>{r.title}</span><span className="mt-0.5 inline-flex gap-1"><Badge tone={tone(r.titleLevel)}>{label(r.titleLevel, r.title.length, 'title')}</Badge>{!r.customTitle && <Badge>automatique</Badge>}</span></td>
                <td className="max-w-[300px] px-3 py-2.5"><span className="line-clamp-2 text-[13px] text-zinc-600" title={r.desc}>{r.desc || '—'}</span><span className="mt-0.5 inline-flex gap-1"><Badge tone={tone(r.descLevel)}>{label(r.descLevel, r.desc.length, 'desc')}</Badge>{r.desc && !r.customDesc && <Badge>automatique</Badge>}</span></td>
                <td className="px-4 py-2.5 text-right"><Link href={r.edit} className="inline-flex h-8 items-center rounded-md border border-zinc-200 px-2.5 text-[13.5px] text-zinc-900 no-underline hover:bg-zinc-50">Modifier</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
