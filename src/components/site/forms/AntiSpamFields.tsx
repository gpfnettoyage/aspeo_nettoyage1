'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; language?: string; theme?: string }) => string; remove: (id: string) => void } }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Champs anti-spam : piège invisible pour les robots + jeton horodaté obtenu à l'affichage.
 * Si NEXT_PUBLIC_TURNSTILE_SITE_KEY est défini, le widget Cloudflare Turnstile est ajouté
 * (il insère lui-même le champ « cf-turnstile-response » vérifié côté serveur).
 */
export default function AntiSpamFields() {
  const [token, setToken] = useState('');
  const [scriptReady, setScriptReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/form-token', { cache: 'no-store' }).then((r) => r.json()).then((j: { token: string }) => setToken(j.token)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!SITE_KEY || !box.current || !(scriptReady || window.turnstile)) return;
    const id = window.turnstile!.render(box.current, { sitekey: SITE_KEY, language: 'fr', theme: 'light' });
    return () => window.turnstile?.remove(id);
  }, [scriptReady]);

  return (
    <>
      <input type="hidden" name="form_ts" value={token} readOnly />
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Ne pas remplir ce champ<input type="text" name="site_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
      {SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
          <div ref={box} className="min-h-[65px]" />
        </>
      )}
    </>
  );
}
