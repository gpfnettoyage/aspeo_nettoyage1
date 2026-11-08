'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResult, SearchType } from '@/lib/site/search';
import { SearchIcon } from '@/components/site/ui/icons';

const LABELS: Record<SearchType, string> = { service: 'Services', realisation: 'Réalisations', article: 'Articles', presse: 'Presse', zone: 'Villes', page: 'Pages' };
const ORDER: SearchType[] = ['service', 'realisation', 'article', 'presse', 'zone', 'page'];

/** Page de recherche : saisie filtrée au fil de la frappe (comme la maquette ; Entrée et formulaire GET restent valables sans JavaScript), filtres par type, cartes de résultats. */
export default function SearchView({ query, results, phone, phoneIntl }: { query: string; results: SearchResult[]; phone: string; phoneIntl: string }) {
  const [tag, setTag] = useState<SearchType | null>(null);
  const [text, setText] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);
  // Requête changée depuis l'extérieur (recherche du header, historique) : resynchronise la saisie et les filtres.
  if (query !== lastQuery) {
    setLastQuery(query);
    setTag(null);
    if (text.trim() !== query) setText(query);
  }
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onType = (value: string) => {
    setText(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = value.trim();
      startTransition(() => router.replace(q ? `/recherche?q=${encodeURIComponent(q)}` : '/recherche', { scroll: false }));
    }, 300);
  };
  const shown = tag ? results.filter((r) => r.type === tag) : results;
  const hidden = results.length - shown.length;
  const tags = ORDER.map((t) => ({ t, n: results.filter((r) => r.type === t).length })).filter((x) => x.n > 0);
  const count = query ? `${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${query} »${results.length > 1 ? ' · classés par pertinence' : ''}` : 'Exemples : bureaux, Diogène, Montbrison, vitres, fin de chantier';

  return (
    <main>
      <section className="p-[clamp(160px,20vh,190px)_0_clamp(32px,5vw,48px)] bg-navy text-white" data-dark="">
        <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[minmax(0,1fr)]">
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase">Recherche</span>
          </div>
          <h1 className="font-heading font-extrabold text-[length:clamp(1.7rem,3.6vw,2.6rem)] leading-[1.1] m-[16px_0_0]">Que recherchez-vous ?</h1>
          <form role="search" action="/recherche" className="flex items-center gap-[10px] mt-[24px] bg-white p-[6px_6px_6px_18px]">
            <span className="text-[color:#8a97a8] inline-flex"><SearchIcon size={18} /></span>
            <input name="q" type="search" value={text} className="flex-1 border-0 outline-none text-[length:1rem] text-navy p-[12px_0] bg-transparent" placeholder="Un service, une ville, un article, une réalisation…" aria-label="Rechercher sur le site" autoFocus={!query} onChange={(e) => onType(e.target.value)} />
            <button type="submit" className="sr-only focus:not-sr-only focus:flex-none focus:bg-[color:var(--asp-accent)] focus:text-white focus:p-[12px_20px] focus:font-heading focus:font-bold">Rechercher</button>
            <Link href="/" className="flex-none bg-navy text-white w-[42px] h-[42px] text-[length:1.2rem] no-underline flex items-center justify-center hover:bg-[color:#2b2b2b]" aria-label="Fermer la recherche">×</Link>
          </form>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[8px] mt-[18px]" role="group" aria-label="Filtrer les résultats">
              <span className="text-[length:.82rem] text-[color:rgba(255,255,255,.75)] self-center mr-[4px]">Afficher :</span>
              {[{ t: null as SearchType | null, label: `Tout (${results.length})` }, ...tags.map((x) => ({ t: x.t as SearchType | null, label: `${LABELS[x.t]} (${x.n})` }))].map(({ t, label }) => {
                const on = tag === t;
                return <button key={label} type="button" onClick={() => setTag(t)} aria-pressed={on} className="min-h-[40px] [border:1.5px_solid_rgba(255,255,255,.5)] p-[9px_16px] font-heading font-bold text-[length:.85rem] cursor-pointer" style={{ background: on ? '#fff' : 'transparent', color: on ? '#06226D' : '#fff' }}>{label}</button>;
              })}
            </div>
          )}
        </div>
      </section>
      <section className="p-[clamp(40px,6vw,64px)_0_clamp(56px,8vw,96px)] bg-white">
        <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
          <p className="text-[length:.95rem] text-[color:#8a97a8] m-[0_0_24px] font-semibold" role="status">{count}</p>
          {tag && hidden > 0 && (
            <div className="flex flex-wrap items-center gap-[10px_16px] bg-[color:#EAF1FB] p-[12px_16px] m-[0_0_20px] text-[length:.92rem] text-navy" role="status">
              <span>Filtre actif : {LABELS[tag]} uniquement. {hidden} autre{hidden > 1 ? 's' : ''} résultat{hidden > 1 ? 's' : ''} masqué{hidden > 1 ? 's' : ''}.</span>
              <button type="button" onClick={() => setTag(null)} className="bg-transparent border-0 p-[6px_0] text-[color:#C74700] font-bold cursor-pointer text-[length:.92rem] underline">Tout afficher</button>
            </div>
          )}
          {query && results.length === 0 && (
            <div className="text-center p-[64px_20px] [border:1px_dashed_#cdd6e0]">
              <p className="font-heading font-bold text-[length:1.15rem] text-navy m-[0_0_8px]">Aucun résultat pour cette recherche</p>
              <p className="text-[length:.95rem] text-[color:#8a97a8] m-[0_0_20px]">Essayez un autre mot, vérifiez l&apos;orthographe, ou décrivez-nous simplement votre besoin : nous vous orientons.</p>
              <div className="flex flex-wrap gap-[12px] justify-center mt-[6px]">
                <Link href="/contact" className="inline-flex items-center gap-[8px] bg-[color:var(--asp-accent)] text-white p-[14px_24px] font-heading font-bold text-[length:.92rem] no-underline">Demander un devis <span aria-hidden="true">→</span></Link>
                <a className="inline-flex items-center min-h-[48px] p-[0_22px] [border:1.5px_solid_#06226D] text-navy no-underline font-heading font-bold text-[length:.95rem]" href={`tel:${phoneIntl}`}>Appeler le {phone}</a>
                <Link href="/proprete-services" className="text-navy font-bold p-[12px_6px] underline">Voir toutes nos prestations</Link>
              </div>
            </div>
          )}
          <ul aria-busy={pending} className="list-none p-0 m-0 [transition:opacity_.2s] aria-busy:opacity-60 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[20px]">
            {shown.map((item) => (
              <li key={item.href + item.title}>
                <Link href={item.href} className="h-full text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] overflow-hidden flex flex-col no-underline [transition:transform_.2s_ease,box-shadow_.2s_ease] hover:[transform:translateY(-4px)] hover:shadow-[0_22px_46px_-22px_rgba(6,34,109,.28)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-navy">{item.img && <Image src={item.img} alt="" fill sizes="(max-width: 700px) 100vw, 25vw" className="object-cover" />}</div>
                  <div className="p-[18px_20px_20px] flex flex-col gap-[6px]">
                    <span className="self-start inline-block bg-navy text-white p-[3px_8px] text-[length:.72rem] tracking-[.08em] uppercase font-bold">{item.cat}</span>
                    <h2 className="font-heading font-bold text-[length:1.05rem] leading-[1.25] text-navy m-0">{item.title}</h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
