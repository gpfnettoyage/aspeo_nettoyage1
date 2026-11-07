'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

/** Encart « Les + ASPEO » : une carte à la fois, navigation précédent / suivant. */
export default function PlusCarousel({ items, image }: { items: { title: string; text: string }[]; image: string | null }) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const n = items.length;
  const cur = items[((i % n) + n) % n]!;
  const btn = 'bg-transparent [border:1px_solid_#e2e8f0] text-navy w-[30px] h-[30px] cursor-pointer flex items-center justify-center hover:[border-color:var(--asp-accent-ink)] hover:text-[color:var(--asp-accent-ink)]';
  return (
    <div className="relative">
      <div className="relative w-full h-[clamp(200px,24vw,260px)] overflow-hidden bg-[color:#dfe7f2]">
        {image && <Image src={image} alt="" fill sizes="500px" className="object-cover" />}
      </div>
      <div className="relative m-[-36px_16px_0] bg-white shadow-[0_24px_50px_-20px_rgba(6,34,109,.32)] p-[24px_22px_20px]" aria-live="polite">
        <div className="flex items-center gap-[10px] mb-[14px]">
          <button type="button" className={btn} onClick={() => setI(i - 1)} aria-label="Avantage précédent">←</button>
          <button type="button" className={btn} onClick={() => setI(i + 1)} aria-label="Avantage suivant">→</button>
        </div>
        <h3 className="font-heading font-extrabold text-[length:1.15rem] leading-[1.25] text-navy m-[0_0_10px]">{cur.title}</h3>
        <p className="text-[length:.93rem] leading-[1.6] text-[color:#42505f] m-[0_0_16px]">{cur.text}</p>
        <Link href="/contact" className="p-0 font-heading font-bold text-[length:.87rem] text-[color:var(--asp-accent-ink)] inline-flex items-center gap-[8px] no-underline">En savoir plus <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
