'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface ArticleCardData { href: string; title: string; category: string | null; date: string; excerpt: string | null; image: string | null; imageAlt: string | null }

/**
 * Liste des articles (Médias). Onglets de la maquette : « Tous les médias » et « Actualités »
 * (articles dont la catégorie est « Actualités », réglable dans l'éditeur d'article).
 */
export default function ArticlesGrid({ items }: { items: ArticleCardData[] }) {
  const [filter, setFilter] = useState<string>('Tous');
  const tabs = [{ f: 'Tous', label: 'Tous les médias' }, { f: 'Actualités', label: 'Actualités' }];
  const list = filter === 'Tous' ? items : items.filter((a) => a.category === filter);
  return (
    <>
      {(
        <div className="flex gap-[10px] mb-[28px] flex-wrap" role="group" aria-label="Filtrer les articles">
          {tabs.map((t) => {
            const sel = filter === t.f;
            return (
              <button key={t.f} type="button" aria-pressed={sel} onClick={() => setFilter(t.f)} className="p-[11px_20px] font-heading font-bold text-[length:.9rem] cursor-pointer"
                style={{ border: `1px solid ${sel ? 'var(--asp-accent)' : '#dce3ec'}`, background: sel ? 'var(--asp-accent)' : '#fff', color: sel ? '#fff' : '#4a5568' }}>
                {t.label}
              </button>
            );
          })}
        </div>
      )}
      {list.length === 0 && <p className="m-0 text-[length:.98rem] text-[color:#5b6878]">Aucune actualité publiée pour le moment.</p>}
      <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[20px]">
        {list.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="h-full text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] overflow-hidden flex flex-col no-underline [transition:transform_.2s_ease,box-shadow_.2s_ease] hover:[transform:translateY(-5px)] hover:shadow-[0_22px_46px_-22px_rgba(6,34,109,.3)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                {item.image && <Image src={item.image} alt={item.imageAlt || ''} fill sizes="(max-width: 700px) 100vw, 33vw" className="object-cover" />}
              </div>
              <div className="p-[22px_22px_24px] flex flex-col gap-[10px] flex-1">
                <div className="flex items-center gap-[12px]">
                  {item.category && <span className="text-[length:.72rem] font-bold tracking-[.06em] uppercase text-navy">{item.category}</span>}
                  <span className="text-[length:.8rem] text-[color:#94a3b8]">{item.date}</span>
                </div>
                <h2 className="font-heading font-bold text-[length:1.14rem] leading-[1.25] text-navy m-0">{item.title}</h2>
                {item.excerpt && <p className="text-[length:.92rem] leading-[1.6] text-[color:#4a5568] m-0 flex-1">{item.excerpt}</p>}
                <span className="inline-flex items-center gap-[8px] font-heading font-bold text-[length:.88rem] text-navy">Lire l&apos;article <span className="text-[color:var(--asp-accent-ink)]" aria-hidden="true">→</span></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p role="status" className="text-[color:#5b6878]">Aucun article publié pour le moment.</p>}
    </>
  );
}
