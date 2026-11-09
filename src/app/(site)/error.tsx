'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/** Erreur inattendue sur une page publique : même gabarit que la 404, avec possibilité de réessayer. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className="relative overflow-hidden bg-navy text-white" data-dark="">
        <div className="max-w-[1280px] m-[0_auto] p-[clamp(170px,22vh,210px)_clamp(20px,5vw,40px)_clamp(56px,8vh,88px)]">
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.82rem] tracking-[.16em] uppercase">Erreur</span>
          </div>
          <h1 className="font-heading font-extrabold text-[length:clamp(2.2rem,4.6vw,3.8rem)] leading-[1.05] tracking-[-.02em] m-[16px_0_0] max-w-[760px]">Cette page n&apos;a pas pu s&apos;afficher</h1>
          <p className="m-[20px_0_0] text-[length:clamp(1.02rem,1.4vw,1.18rem)] leading-[1.6] text-[color:rgba(255,255,255,.9)] max-w-[620px]">
            Un incident temporaire nous empêche d&apos;afficher ce contenu. Réessayez dans un instant ou contactez-nous directement.
          </p>
          {error.digest && <p className="m-[12px_0_0] text-[length:.8rem] text-[color:rgba(255,255,255,.6)]">Référence : {error.digest}</p>}
          <div className="mt-[28px] flex flex-wrap gap-[14px]">
            <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-[10px] bg-[color:var(--asp-accent)] text-white border-none p-[15px_26px] font-heading font-bold text-[length:.95rem] cursor-pointer hover:bg-[color:color-mix(in_srgb,var(--asp-accent)_84%,#000)]">
              Réessayer
            </button>
            <Link href="/" className="inline-flex items-center justify-center [border:1.5px_solid_rgba(255,255,255,.6)] text-white p-[15px_26px] font-heading font-bold text-[length:.95rem] no-underline hover:bg-[color:rgba(255,255,255,.1)]">
              Retour à l&apos;accueil
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center [border:1.5px_solid_rgba(255,255,255,.6)] text-white p-[15px_26px] font-heading font-bold text-[length:.95rem] no-underline hover:bg-[color:rgba(255,255,255,.1)]">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
