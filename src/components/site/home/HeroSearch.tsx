'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { SearchIcon } from '@/components/site/ui/icons';

interface Result { cat: string; title: string; href: string; img: string | null }

/** Barre de recherche de l'accueil : suggestions instantanées + page de résultats complète. */
export default function HeroSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLFormElement>(null);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults(null); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) { setResults((await res.json()).results); setOpen(true); }
      } catch { /* requête annulée */ }
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/recherche?q=${encodeURIComponent(query.trim())}` : '/recherche');
  };

  return (
    <form ref={boxRef} role="search" onSubmit={submit} className="flex items-center gap-[10px] m-[28px_0_0] bg-white [border:1px_solid_#c9d6ea] p-[6px_6px_6px_18px] max-w-[560px] relative" data-hero-search="">
      <span className="text-[color:#8a97a8] inline-flex flex-none"><SearchIcon size={18} /></span>
      <label htmlFor={`${listId}-q`} className="sr-only">Rechercher une prestation, une ville, une réalisation</label>
      <input
        id={`${listId}-q`}
        className="flex-1 min-w-0 border-none outline-none text-[length:1rem] text-navy p-[12px_0] bg-transparent"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        placeholder={placeholder}
        autoComplete="off"
        aria-controls={listId}
        aria-expanded={open && !!results}
        role="combobox"
      />
      <button type="submit" className="flex-none bg-[color:var(--asp-accent)] text-white border-none p-[14px_24px] font-heading font-bold text-[length:.94rem] cursor-pointer hover:[background:color-mix(in_srgb,var(--asp-accent)_84%,#000)]" aria-label="Rechercher" data-search-btn="">
        <span data-xs-hide="">Rechercher</span>
        <span className="hidden" data-xs-only="">→</span>
      </button>

      {open && results && results.length > 0 && (
        <div id={listId} role="listbox" className="absolute top-[calc(100%_+_8px)] left-0 right-0 bg-white shadow-[0_20px_40px_-12px_rgba(6,34,109,.25)] z-[5] overflow-hidden">
          {results.map((r) => (
            <Link key={r.href} href={r.href} role="option" aria-selected="false" className="flex items-center gap-[12px] w-full text-left [border-bottom:1px_solid_#eef2f7] p-[10px_18px] no-underline hover:bg-[color:var(--asp-tint)]">
              <span className="flex-none w-[40px] h-[40px] [background-size:cover] [background-position:center] bg-[color:#eef2f7]" aria-hidden="true" style={r.img ? { backgroundImage: `url('${r.img}')` } : undefined} />
              <span className="flex flex-col gap-[2px] min-w-0">
                <span className="font-heading font-extrabold text-[length:.68rem] tracking-[.06em] uppercase text-navy">{r.cat}</span>
                <span className="font-heading font-semibold text-[length:.94rem] text-navy whitespace-nowrap overflow-hidden [text-overflow:ellipsis]">{r.title}</span>
              </span>
            </Link>
          ))}
          <Link href={`/recherche?q=${encodeURIComponent(query.trim())}`} className="block w-full text-left bg-[color:#f6f8fa] p-[12px_18px] font-heading font-bold text-[length:.86rem] text-[color:var(--asp-accent-ink)] no-underline hover:bg-[color:var(--asp-tint)]">
            Voir tous les résultats pour « {query.trim()} » →
          </Link>
        </div>
      )}
      {open && results && results.length === 0 && (
        <div id={listId} className="absolute top-[calc(100%_+_8px)] left-0 right-0 bg-white shadow-[0_20px_40px_-12px_rgba(6,34,109,.25)] z-[5] p-[18px]">
          <p className="m-[0_0_12px] text-[length:.92rem] text-[color:#42505f]">Aucun résultat pour cette recherche, mais nous pouvons sûrement vous aider.</p>
          <Link href="/contact" className="inline-block bg-[color:var(--asp-accent)] text-white p-[10px_18px] font-heading font-bold text-[length:.88rem] no-underline">Demander un devis <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </form>
  );
}
