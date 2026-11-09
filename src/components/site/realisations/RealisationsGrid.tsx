'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface RealisationCard { slug: string; href: string; title: string; city: string | null; client: string | null; serviceLabel: string | null; image: string | null; imageAlt: string | null; pole: string | null; facts: { k: string; v: string }[] }

const TABS = [
  { f: 'tous', label: 'Tous les chantiers' },
  { f: 'professionnel', label: 'Nettoyage Professionnel' },
  { f: 'specialise', label: 'Interventions Spécialisées' },
];

/** Grille des réalisations filtrable par pôle. */
export default function RealisationsGrid({ items }: { items: RealisationCard[] }) {
  const [filter, setFilter] = useState('tous');
  const list = items.filter((r) => filter === 'tous' || r.pole === filter);
  return (
    <>
      <div className="flex gap-[10px] mb-[28px] flex-wrap" role="group" aria-label="Filtrer les réalisations">
        {TABS.map((t) => {
          const on = filter === t.f;
          return (
            <button key={t.f} type="button" aria-pressed={on} onClick={() => setFilter(t.f)} className="p-[11px_20px] font-heading font-bold text-[length:.9rem] cursor-pointer"
              style={{ border: `1px solid ${on ? '#06226D' : '#d7dee8'}`, background: on ? '#06226D' : '#fff', color: on ? '#fff' : '#06226D' }}>
              {t.label}
            </button>
          );
        })}
      </div>
      <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-[24px]">
        {list.map((r) => (
          <li key={r.slug}>
            <Link href={r.href} className="h-full text-left bg-white [border:1px_solid_#eef2f7] p-0 flex flex-col no-underline [transition:transform_.2s_ease,box-shadow_.2s_ease] hover:[transform:translateY(-4px)] hover:shadow-[0_22px_46px_-22px_rgba(6,34,109,.3)]">
              <div className="relative aspect-[16/10] bg-navy overflow-hidden">
                {r.image && <Image src={r.image} alt={r.imageAlt || r.title} fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" />}
                {r.city && <span className="absolute left-[14px] bottom-[14px] bg-white text-navy p-[6px_10px] font-heading font-bold text-[length:.74rem]">{r.city}</span>}
              </div>
              <div className="p-[22px_22px_24px] flex flex-col gap-[10px] flex-1">
                {r.serviceLabel && <span className="font-heading font-bold text-[length:.72rem] tracking-[.06em] uppercase text-navy">{r.serviceLabel}</span>}
                <h2 className="font-heading font-bold text-[length:1.12rem] leading-[1.3] text-navy m-0">{r.title}</h2>
                {r.client && <p className="text-[length:.88rem] leading-[1.5] text-[color:#8a97a8] m-0">{r.client}</p>}
                {r.facts.length > 0 && (
                  <dl className="m-[6px_0_0] grid grid-cols-[1fr_1fr] gap-[1px] bg-[color:#eef2f7] [border:1px_solid_#eef2f7]" data-r2s="">
                    {r.facts.slice(0, 2).map((f) => (
                      <div key={f.k} className="bg-white p-[10px_12px]">
                        <dt className="text-[length:.7rem] text-[color:#8a97a8] uppercase tracking-[.06em]">{f.k}</dt>
                        <dd className="m-0 font-heading font-bold text-[length:.9rem] text-navy mt-[2px]">{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <span className="inline-flex items-center gap-[8px] font-heading font-bold text-[length:.88rem] text-navy mt-auto pt-[8px]">Voir le chantier <span className="text-[color:var(--asp-accent-ink)]" aria-hidden="true">→</span></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-[color:#5b6878]" role="status">Aucune réalisation publiée dans cette catégorie pour le moment.</p>}
    </>
  );
}
