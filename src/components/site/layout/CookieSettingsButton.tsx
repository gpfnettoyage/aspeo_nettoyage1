'use client';

/** Permet de revenir sur son choix de cookies à tout moment (le bandeau est réaffiché). */
export default function CookieSettingsButton({ className }: { className: string }) {
  return (
    <button type="button" className={`${className} bg-transparent border-0 cursor-pointer`}
      onClick={() => { document.cookie = 'cookieConsent=; Max-Age=0; path=/'; window.location.reload(); }}>
      Gérer les cookies
    </button>
  );
}
