'use client';

import { useId, useState, type ReactNode } from 'react';

interface Item { title: string; content: ReactNode }

/**
 * Liste dépliable accessible (FAQ, « Détails des services »).
 * `variant="faq"` : cartes séparées avec pictogramme carré bleu ; `variant="list"` : lignes jointives.
 */
export default function Disclosure({ items, variant = 'faq', defaultOpen = null }: { items: Item[]; variant?: 'faq' | 'list' | 'qa'; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();
  if (variant === 'list' || variant === 'qa') {
    // « list » : détail des prestations ; « qa » : FAQ Grands Comptes et villes (rembourrage et taille de la maquette).
    const qa = variant === 'qa';
    return (
      <div className="flex flex-col gap-[1px] bg-[color:#eef2f7] [border:1px_solid_#eef2f7]">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="bg-white">
              <h3 className="m-0">
                <button type="button" aria-expanded={isOpen} aria-controls={`${uid}-${i}`} onClick={() => setOpen(isOpen ? null : i)} className={`w-full text-left bg-transparent border-none flex items-center justify-between gap-[12px] cursor-pointer font-heading font-bold text-navy ${qa ? 'p-[18px_20px] text-[length:.96rem]' : 'p-[16px_18px] text-[length:.94rem]'}`}>
                  <span>{it.title}</span>
                  <span className="flex-none text-[color:var(--asp-accent-ink)] text-[length:1.1rem] font-bold" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </h3>
              <div id={`${uid}-${i}`} hidden={!isOpen} className={`m-0 text-[length:.92rem] text-[color:#42505f] ${qa ? 'p-[0_20px_18px] leading-[1.65]' : 'p-[0_18px_18px] leading-[1.6]'}`}>{it.content}</div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] bg-white overflow-hidden">
            <h3 className="m-0">
              <button type="button" aria-expanded={isOpen} aria-controls={`${uid}-${i}`} onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left bg-transparent border-none p-[18px_20px] cursor-pointer flex justify-between items-center gap-[14px]">
                <span className="font-heading font-bold text-[length:1rem] text-navy leading-[1.4]">{it.title}</span>
                <span className="flex-none w-[28px] h-[28px] bg-navy text-white flex items-center justify-center font-heading font-bold" aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            <div id={`${uid}-${i}`} hidden={!isOpen} className="p-[0_20px_20px]">
              <div className="text-[length:.97rem] leading-[1.75] text-[color:#42505f] m-0">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
