'use client';
import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import Link from 'next/link';

export default function CookieConsent({
  demo = false,
  onAcceptCallback = () => { },
  onDeclineCallback = () => { },
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { giveConsent, revokeConsent } = useCookieConsent();

  useEffect(() => {
    const showConsent = () => {
      // Pas de bandeau dans l'aperçu intégré à l'administration (page affichée en cadre).
      if (window.self !== window.top) return;
      const cookieConsent = /(?:^|;\s*)cookieConsent=(true|false)/.test(document.cookie);
      if (!cookieConsent || demo) {
        setIsVisible(true);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        showConsent();
      });
    } else {
      setTimeout(showConsent, 1500);
    }
  }, [demo]);

  const accept = () => {
    setIsVisible(false);
    giveConsent();
    onAcceptCallback();
    window.dispatchEvent(new Event('activateHotjar'));
  };

  const decline = () => {
    setIsVisible(false);
    revokeConsent();
    onDeclineCallback();
  };

  if (!isVisible) return null;

  // Bandeau au style du site (maquette « Refonte Aspeo ») : refuser est aussi simple qu'accepter.
  const btn = 'flex-1 min-h-[46px] px-[18px] font-heading font-bold text-[length:.9rem] cursor-pointer border';
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-text"
      className="fixed z-[60] bottom-0 inset-x-0 sm:bottom-[16px] sm:left-[16px] sm:right-auto sm:max-w-[420px] bg-white [border-top:3px_solid_var(--asp-accent)] shadow-[0_18px_50px_-12px_rgba(6,34,109,.35)] p-[20px_20px_18px] text-navy font-body">
      <p id="cookie-title" className="m-0 font-heading font-extrabold text-[length:1.02rem]">Votre vie privée</p>
      <p id="cookie-text" className="m-[8px_0_0] text-[length:.88rem] leading-[1.55] text-[color:#4a5568]">
        Nous utilisons des cookies de mesure d’audience pour améliorer le site. Ils ne sont déposés qu’avec votre accord ; vous pouvez changer d’avis à tout moment.{' '}
        <Link href="/politique-des-cookies" className="text-navy underline">En savoir plus</Link>
      </p>
      <div className="flex gap-[10px] mt-[16px]">
        <button type="button" onClick={decline} className={`${btn} bg-white text-navy border-navy hover:bg-[color:#f3f6fb]`}>Refuser</button>
        <button type="button" onClick={accept} className={`${btn} bg-[color:var(--asp-accent)] text-white border-[color:var(--asp-accent)] hover:brightness-95`}>Accepter</button>
      </div>
    </div>
  );
}
