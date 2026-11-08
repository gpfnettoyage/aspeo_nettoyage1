'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Segmented, type Tone } from './ui';

/** Pastille compacte du tableau de référencement (11,5 px, comme la maquette). */
const SmallBadge = ({ tone: t = 'gray', children }: { tone?: Tone; children: React.ReactNode }) => <span className="[&>span]:px-2 [&>span]:py-px [&>span]:text-[11.5px]"><Badge tone={t}>{children}</Badge></span>;

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
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse">
          <thead><tr className="border-b border-gray-200 bg-[#fafafa] text-left text-[13px] text-gray-500 [&>th]:px-3.5 [&>th]:py-2.5"><th className="font-medium">Page</th><th className="font-medium">Titre Google</th><th className="font-medium">Description</th><th className="w-[100px]"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.kind}${r.path}`} className="border-b border-[#f0f0f1] [&>td]:px-3.5 [&>td]:py-3">
                <td><span className="block font-medium">{r.name}</span><span className="mt-0.5 block text-[12px] text-gray-500">{r.kind} · {r.path}{r.noindex ? ' · non indexée' : ''}</span></td>
                <td className="max-w-[340px]"><span className="block truncate text-[13px] text-zinc-700" title={r.title}>{r.title}</span><span className="mt-1 inline-flex gap-1"><SmallBadge tone={tone(r.titleLevel)}>{label(r.titleLevel, r.title.length, 'title')}</SmallBadge>{!r.customTitle && <SmallBadge>automatique</SmallBadge>}</span></td>
                <td><span className="inline-flex gap-1" title={r.desc || undefined}><SmallBadge tone={tone(r.descLevel)}>{label(r.descLevel, r.desc.length, 'desc')}</SmallBadge>{r.desc && !r.customDesc && <SmallBadge>automatique</SmallBadge>}</span></td>
                <td className="text-right"><Link href={r.edit} className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-black no-underline hover:bg-[#f4f4f5]">Modifier</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
