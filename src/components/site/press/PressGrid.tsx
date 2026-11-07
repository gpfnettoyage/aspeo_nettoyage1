'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface PressCard { href: string; title: string; media: string | null; type: string | null; date: string; excerpt: string | null; image: string | null }

/** Parutions presse filtrables par type (Article, Reportage, Communiqué…). */
export default function PressGrid({ title, text, items }: { title: string; text: string; items: PressCard[] }) {
  const types = Array.from(new Set(items.map((p) => p.type).filter((t): t is string => !!t)));
  const [filter, setFilter] = useState('Tous');
  const list = filter === 'Tous' ? items : items.filter((p) => p.type === filter);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-[16px] mb-[26px]">
        <div className="max-w-[640px]">
          <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{title}</h2>
          <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-0">{text}</p>
        </div>
        {types.length > 1 && (
          <div className="flex flex-wrap gap-[8px]" role="group" aria-label="Filtrer les parutions">
            {['Tous', ...types].map((t) => {
              const on = filter === t;
              return (
                <button key={t} type="button" aria-pressed={on} onClick={() => setFilter(t)} className="p-[10px_16px] min-h-[44px] font-heading font-bold text-[length:.85rem] cursor-pointer"
                  style={{ border: `1px solid ${on ? '#06226D' : '#d7dee8'}`, background: on ? '#06226D' : '#fff', color: on ? '#fff' : '#06226D' }}>
                  {t === 'Tous' ? 'Toutes' : t}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[22px]">
        {list.map((pr) => (
          <li key={pr.href}>
            <Link href={pr.href} className="h-full text-left bg-white [border:1px_solid_#dbe5f4] p-0 flex flex-col no-underline hover:[border-color:var(--asp-accent-ink)]">
              <div className="relative aspect-[16/9] bg-[color:#dfe7f2] overflow-hidden">
                {pr.image && <Image src={pr.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" />}
                {pr.media && <span className="absolute left-[14px] top-[14px] bg-white text-navy font-heading font-extrabold text-[length:.78rem] tracking-[.04em] p-[7px_11px]">{pr.media}</span>}
              </div>
              <div className="p-[20px_22px_24px] flex flex-col gap-[10px] flex-1">
                <div className="text-[length:.78rem] tracking-[.08em] uppercase text-[color:var(--asp-accent-ink)] font-bold">{[pr.type, pr.date].filter(Boolean).join(' · ')}</div>
                <h3 className="font-heading font-bold text-[length:1.1rem] text-navy leading-[1.35] m-0">{pr.title}</h3>
                {pr.excerpt && <p className="text-[length:.93rem] leading-[1.6] text-[color:#42505f] m-0 flex-1">{pr.excerpt}</p>}
                <span className="font-heading font-bold text-[length:.88rem] text-navy">Lire l&apos;article <span className="text-[color:var(--asp-accent-ink)]" aria-hidden="true">→</span></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p role="status" className="text-[color:#5b6878]">Aucune parution publiée pour le moment.</p>}
    </>
  );
}
