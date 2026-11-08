'use client';

/* eslint-disable @next/next/no-img-element -- icône SVG officielle */
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface Props {
  phase: 'sending' | 'done';
  firstName: string;
  recap: { k: string; v: string }[];
  phone: string;
  phoneIntl: string;
  onClose: () => void;
}

/** Plein écran d'envoi puis de confirmation (maquette Contact). */
export default function SendOverlay({ phase, firstName, recap, phone, phoneIntl, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && phase === 'done') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [phase, onClose]);

  return (
    <div ref={ref} tabIndex={-1} className="fixed inset-0 z-[200] bg-[color:rgba(6,34,109,.96)] flex items-start justify-center p-[clamp(12px,4vw,24px)] overflow-y-auto outline-none" role="dialog" aria-modal="true" aria-live="polite" aria-label={phase === 'sending' ? 'Envoi en cours' : 'Demande envoyée'}>
      {phase === 'sending' ? (
        <div className="m-[auto_0] flex flex-col items-center gap-[28px] text-center text-white">
          <div className="relative w-[132px] h-[132px] flex items-center justify-center">
            <div className="absolute inset-0 [border:3px_solid_rgba(255,255,255,.15)] [border-top-color:#FF5C00] rounded-full [animation:aspSpin_1s_linear_infinite]" />
            <div className="w-[96px] h-[96px] bg-white rounded-full flex items-center justify-center"><img src="/img/brand/aspeo-icone.svg" alt="" className="w-[64px] h-[64px] block [animation:aspPulse_1.2s_ease-in-out_infinite]" /></div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-[length:clamp(1.3rem,2.4vw,1.7rem)]">Envoi de votre demande…</div>
            <div className="text-[length:.98rem] text-[color:rgba(255,255,255,.75)] mt-[8px]">Nous transmettons votre demande à notre équipe.</div>
          </div>
          <div className="w-[220px] h-[3px] bg-[color:rgba(255,255,255,.15)] overflow-hidden"><div className="w-full h-full bg-[color:#FF5C00] [transform-origin:left] [animation:aspBar_2.3s_ease-out_forwards]" /></div>
        </div>
      ) : (
        <div className="m-[auto_0] w-full max-w-[620px] bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,.5)]">
          <div className="flex justify-center p-[clamp(24px,5vw,40px)_0_18px]">
            <div className="relative w-[104px] h-[104px] [animation:aspPop_.55s_cubic-bezier(.2,.9,.3,1.2)_both]">
              <div className="w-[104px] h-[104px] rounded-full bg-[color:#f3f6fb] flex items-center justify-center"><img src="/img/brand/aspeo-icone.svg" alt="ASPEO" className="w-[58px] h-[58px] block" /></div>
              <div className="absolute right-[-2px] bottom-[-2px] w-[38px] h-[38px] rounded-full bg-[color:#0a7d3c] [border:3px_solid_#fff] text-white flex items-center justify-center font-extrabold text-[18px] [animation:aspPop_.45s_.35s_cubic-bezier(.2,.9,.3,1.2)_both]" aria-hidden="true">✓</div>
            </div>
          </div>
          <div className="p-[0_clamp(24px,4vw,40px)_clamp(28px,4vw,40px)] text-center">
            <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.8vw,2rem)] leading-[1.2] text-navy m-[0_0_10px]">Votre demande a bien été envoyée</h2>
            <p className="text-[length:1rem] leading-[1.65] text-[color:#42505f] m-[0_auto_24px] max-w-[460px]">Merci {firstName}, votre demande est enregistrée et prise en charge par notre équipe. Un conseiller ASPEO vous recontacte rapidement.</p>
            {recap.length > 0 && (
              <dl className="text-left [border:1px_solid_#eef2f7] bg-[color:#f7f9fb] p-[6px_20px] m-[0_0_24px]">
                {recap.map((r) => (
                  <div key={r.k} className="flex justify-between gap-[16px] p-[12px_0] [border-bottom:1px_solid_#eef2f7] last:border-b-0 text-[length:.9rem]">
                    <dt className="text-[color:#8a97a8]">{r.k}</dt><dd className="m-0 font-bold text-navy text-right">{r.v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="text-left mb-[28px]">
              <div className="font-heading font-extrabold text-[length:.76rem] tracking-[.1em] uppercase text-[color:var(--asp-accent-ink)] mb-[12px]">Et maintenant ?</div>
              <ol className="list-none p-0 m-0 flex flex-col gap-[12px]">
                {[['Étude de votre demande', 'un conseiller analyse votre besoin et vos photos.'], ['Prise de contact rapide', 'par téléphone ou par e-mail, pour préciser les détails.'], ['Votre devis personnalisé', 'gratuit et sans engagement, avec une visite si nécessaire.']].map(([t, d], i) => (
                  <li key={t} className="flex gap-[14px] items-start">
                    <span className="flex-none inline-flex items-center justify-center w-[42px] h-[42px] bg-[color:var(--asp-accent)] text-white font-heading font-extrabold text-[length:.95rem] leading-none tracking-[.02em]" aria-hidden="true">0{i + 1}</span>
                    <span className="text-[length:.92rem] leading-[1.55] text-[color:#42505f]"><strong className="text-navy">{t}</strong> — {d}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-wrap gap-[10px] justify-center">
              <Link href="/" className="inline-flex items-center gap-[10px] bg-navy text-white p-[15px_24px] font-heading font-bold text-[length:.92rem] no-underline">Retour à l&apos;accueil</Link>
              <button type="button" className="bg-white [border:1px_solid_#dfe5ec] text-navy p-[15px_22px] font-heading font-bold text-[length:.92rem] cursor-pointer" onClick={onClose}>Fermer</button>
            </div>
            <p className="text-[length:.82rem] text-[color:#8a97a8] m-[18px_0_0]">Une question d&apos;ici là ? <a className="text-navy font-bold no-underline" href={`tel:${phoneIntl}`}>{phone}</a></p>
          </div>
        </div>
      )}
    </div>
  );
}
