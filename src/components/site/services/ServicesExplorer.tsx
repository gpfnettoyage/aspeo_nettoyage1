'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ServiceTile from '@/components/site/shared/ServiceTile';
import { SearchIcon } from '@/components/site/ui/icons';

export interface ExplorerService { href: string; title: string; tagline: string; short: string; image: string | null; pole: 'professionnel' | 'specialise' }
export interface ExplorerGroup { slug: string; href: string; label: string; intro: string; pole: 'professionnel' | 'specialise'; items: ExplorerService[] }

type Filter = 'tous' | 'professionnel' | 'specialise';
const FILTERS: { f: Filter; label: string }[] = [
  { f: 'tous', label: 'Toutes les prestations' },
  { f: 'professionnel', label: 'Nettoyage Professionnel' },
  { f: 'specialise', label: 'Interventions Spécialisées' },
];
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Catalogue filtrable (onglets par pôle + recherche plein texte), groupé par activité. */
export default function ServicesExplorer({ groups }: { groups: ExplorerGroup[] }) {
  const [filter, setFilter] = useState<Filter>('tous');
  const [query, setQuery] = useState('');

  const view = useMemo(() => {
    const q = norm(query.trim());
    return groups
      .filter((g) => filter === 'tous' || g.pole === filter)
      .map((g) => ({ ...g, items: q ? g.items.filter((s) => norm(`${s.title} ${s.tagline} ${s.short}`).includes(q)) : g.items }))
      .filter((g) => g.items.length);
  }, [groups, filter, query]);

  return (
    <>
      <div className="flex flex-wrap gap-[20px] items-center justify-between mb-[40px]">
        <div className="flex flex-wrap gap-[4px_28px] [border-bottom:1px_solid_#dbe5f4]" role="tablist" aria-label="Filtrer les prestations">
          {FILTERS.map(({ f, label }) => {
            const sel = filter === f;
            return (
              <button key={f} type="button" role="tab" aria-selected={sel} onClick={() => setFilter(f)}
                className="bg-transparent border-x-0 border-t-0 mb-[-1px] p-[14px_2px] min-h-[48px] font-heading font-bold text-[length:.95rem] cursor-pointer hover:text-navy"
                style={{ borderBottom: `3px solid ${sel ? 'var(--asp-accent)' : 'transparent'}`, color: sel ? '#06226D' : '#5b6878' }}>
                {label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-[10px] [border:1.5px_solid_#dce3ec] p-[4px_4px_4px_14px] min-w-[min(100%,240px)] flex-[0_1_300px]">
          <span className="text-[color:#8a97a8] inline-flex"><SearchIcon size={18} /></span>
          <span className="sr-only">Rechercher un service</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 border-none outline-none text-[length:.95rem] text-navy p-[9px_0] bg-transparent" placeholder="Rechercher un service..." />
        </label>
      </div>

      <div className="flex flex-col gap-[clamp(48px,7vw,80px)]">
        {view.map((grp) => (
          <div key={grp.slug} id={grp.pole === 'professionnel' && grp === view.find((g) => g.pole === 'professionnel') ? 'professionnel' : undefined}>
            <div className="flex flex-wrap items-end justify-between gap-[12px_24px] mb-[24px] pb-[18px] [border-bottom:1px_solid_#dbe5f4]">
              <div className="max-w-[680px]">
                <div className="flex items-center gap-[14px] mb-[10px]">
                  <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
                  <h2 className="font-heading font-extrabold text-[length:clamp(1.45rem,2.6vw,2rem)] leading-[1.15] m-0 text-navy">{grp.label}</h2>
                  <span className="text-[length:.84rem] font-bold text-[color:#5b6878] whitespace-nowrap">{grp.items.length} prestation{grp.items.length > 1 ? 's' : ''}</span>
                </div>
                {grp.intro && <p className="text-[length:.98rem] leading-[1.65] text-[color:#42505f] m-[0_0_0_18px]">{grp.intro}</p>}
              </div>
              <Link href={grp.href} className="p-[10px_0] text-navy font-heading font-bold text-[length:.82rem] tracking-[.08em] uppercase no-underline">
                Voir la rubrique <span className="text-[color:var(--asp-accent)]" aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] [grid-auto-rows:minmax(280px,auto)] gap-[16px]">
              {grp.items.map((s) => <ServiceTile key={s.href} href={s.href} title={s.title} text={s.tagline} image={s.image} />)}
            </div>
          </div>
        ))}
      </div>

      {view.length === 0 && (
        <div className="text-center p-[60px_20px] [border:1px_dashed_#cdd6e0]" role="status">
          <p className="font-heading font-bold text-[length:1.1rem] text-navy m-[0_0_6px]">Aucun service ne correspond à votre recherche</p>
          <p className="text-[length:.95rem] text-[color:#8a97a8] m-[0_0_18px]">Décrivez-nous votre besoin, nous avons certainement une solution.</p>
          <Link href="/contact" className="inline-flex items-center gap-[8px] bg-[color:var(--asp-accent)] text-white p-[14px_24px] font-heading font-bold text-[length:.92rem] no-underline">Demander un devis <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </>
  );
}
