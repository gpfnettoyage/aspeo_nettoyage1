'use client';

import { useEffect, useState } from 'react';

/** Champs anti-spam : piège invisible pour les robots + jeton horodaté obtenu à l'affichage. */
export default function AntiSpamFields() {
  const [token, setToken] = useState('');
  useEffect(() => {
    fetch('/api/form-token', { cache: 'no-store' }).then((r) => r.json()).then((j: { token: string }) => setToken(j.token)).catch(() => undefined);
  }, []);
  return (
    <>
      <input type="hidden" name="form_ts" value={token} readOnly />
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Ne pas remplir ce champ<input type="text" name="site_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
    </>
  );
}
