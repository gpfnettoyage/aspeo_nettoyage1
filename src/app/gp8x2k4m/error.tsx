'use client';

import { useEffect } from 'react';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';

/**
 * Erreur dans l'administration, notamment une page refusée à un rôle (requirePermission lève une
 * erreur « Forbidden ») : message clair au lieu de la page d'erreur brute. Aucune donnée n'est affichée.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 text-[14px] leading-[normal] text-[#0a0a0a] [font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]">
      <div className="w-full max-w-[460px] rounded-lg border border-gray-200 p-6">
        <h1 className="m-0 text-[18px] font-semibold leading-[1.3]">Page indisponible</h1>
        <p className="m-[8px_0_0] leading-[1.5] text-gray-500">
          Cette page n’est pas accessible avec votre rôle, ou une erreur est survenue. Si vous pensez devoir y accéder, contactez un super administrateur.
        </p>
        {error.digest && <p className="m-[8px_0_0] text-[12px] text-gray-500">Référence : {error.digest}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={ADMIN_BASE_PATH} className="rounded-md border border-[#06226D] bg-[#06226D] px-3.5 py-2 font-medium text-white no-underline hover:bg-[#0a2f8f]">Retour au tableau de bord</a>
          <button type="button" onClick={reset} className="rounded-md border border-gray-200 bg-white px-3.5 py-2 font-medium hover:bg-[#f4f4f5]">Réessayer</button>
        </div>
      </div>
    </div>
  );
}
