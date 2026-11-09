'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { HeaderData, MenuService } from './header-types';

type Sub = 'professionnel' | 'specialise' | 'autres' | 'apropos' | null;

const rowCls = 'text-left [border-bottom:1px_solid_rgba(255,255,255,.3)] text-white font-heading font-bold no-underline flex justify-between items-center';
const closeBtn = 'bg-transparent border-none text-white text-[length:1.5rem] cursor-pointer p-[8px] m-[-8px]';

export default function MobileMenu({ data, onClose }: { data: HeaderData; onClose: () => void }) {
  const [sub, setSub] = useState<Sub>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Verrouille le défilement de la page et place le focus dans le panneau
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Menu principal réglé dans l'administration : libellés, ordre et visibilité repris dans la structure mobile de la maquette.
  const history = data.main.find((m) => m.href === '/a-propos');
  const medias = data.main.find((m) => m.key === 'medias');
  const pro = data.poles.find((p) => p.key === 'professionnel');
  const spe = data.poles.find((p) => p.key === 'specialise');
  const subs: Record<Exclude<Sub, null>, { hub?: { label: string; href: string }; items: MenuService[] }> = {
    professionnel: { hub: { label: 'Tout le nettoyage professionnel', href: pro?.groups[0]?.href ?? '/proprete-services' }, items: pro ? pro.groups.flatMap((g) => g.allItems) : [] },
    specialise: { hub: { label: 'Tous les services spécialisés', href: spe?.groups[0]?.href ?? '/proprete-services' }, items: spe ? spe.groups.flatMap((g) => g.allItems) : [] },
    autres: { hub: { label: 'Tous les autres services', href: data.others?.href ?? '/proprete-services' }, items: data.others?.allItems ?? [] },
    apropos: {
      items: [
        ...(history ? [{ title: history.label, short: '', href: history.href }] : []),
        { title: 'Nous rejoindre', short: '', href: '/nous-rejoindre' },
        { title: 'Grands Comptes & Marchés Publics', short: '', href: '/grands-comptes' },
        ...(medias ? [{ title: medias.label, short: '', href: medias.href }] : []),
        { title: 'Nos réalisations', short: '', href: '/realisations' },
        { title: 'Presse', short: '', href: '/medias/presse' },
      ],
    },
  };

  return (
    <div className="fixed inset-0 z-[100] min-[1041px]:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-[color:rgba(6,34,109,.5)] [animation:aspFade_.2s_ease]" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} tabIndex={-1} className="absolute top-0 right-0 bottom-0 w-[min(480px,92vw)] bg-[color:var(--asp-accent)] text-white flex flex-col p-[22px_clamp(20px,6vw,32px)] overflow-auto shadow-[-20px_0_60px_-20px_rgba(0,0,0,.35)] [animation:aspSlideIn_.25s_ease] outline-none">
        {sub ? (
          <>
            <div className="flex items-center justify-between mb-[28px]">
              <button type="button" className={closeBtn} onClick={() => setSub(null)} aria-label="Retour">←</button>
              <button type="button" className={closeBtn} onClick={onClose} aria-label="Fermer le menu">×</button>
            </div>
            {subs[sub].hub && (
              <Link href={subs[sub].hub!.href} onClick={onClose} className={`${rowCls} text-[length:1rem] p-[16px_0] opacity-[.85]`}>
                {subs[sub].hub!.label}<span aria-hidden="true">→</span>
              </Link>
            )}
            {subs[sub].items.map((item) => (
              <Link key={item.href} href={item.href} onClick={onClose} className="text-left [border-bottom:1px_solid_rgba(255,255,255,.3)] text-white font-heading font-bold text-[length:1.15rem] p-[18px_0] block w-full no-underline">
                {item.title}
              </Link>
            ))}
          </>
        ) : (
          <>
            <div className="flex items-center justify-end mb-[24px]">
              <button type="button" className={closeBtn} onClick={onClose} aria-label="Fermer le menu">×</button>
            </div>
            {data.main.map((item) => {
              if (item.key === 'services') {
                return (['professionnel', 'specialise', 'autres'] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setSub(k)} className={`${rowCls} bg-transparent border-x-0 border-t-0 cursor-pointer text-[length:1.3rem] leading-[1.15] p-[18px_0] gap-[12px] w-full`}>
                    {k === 'professionnel' ? 'Nettoyage professionnel' : k === 'specialise' ? 'Nettoyage spécialisé' : 'Autres services'}
                    <span className="flex-none" aria-hidden="true">→</span>
                  </button>
                ));
              }
              // « Notre Histoire » et « Médias » sont regroupés dans « À propos », comme dans la maquette mobile.
              if (item.key === 'medias' || item.href === '/a-propos') return null;
              return (
                <Link key={item.href + item.label} href={item.href} onClick={onClose} className={`${rowCls} text-[length:1.3rem] p-[18px_0]`}>{item.label}<span aria-hidden="true">→</span></Link>
              );
            })}
            <button type="button" onClick={() => setSub('apropos')} className={`${rowCls} bg-transparent border-x-0 border-t-0 cursor-pointer text-[length:1.3rem] p-[18px_0] w-full`}>
              À propos<span aria-hidden="true">→</span>
            </button>
            <Link href="/contact" onClick={onClose} className="text-left text-white font-heading font-bold text-[length:1.3rem] p-[22px_0_8px] no-underline">Nous joindre</Link>
          </>
        )}
      </div>
    </div>
  );
}
