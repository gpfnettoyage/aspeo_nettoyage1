/** Bandeau affiché en mode prévisualisation (brouillons visibles, réservé aux administrateurs). */
export default function PreviewBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-3 bg-navy text-white text-sm font-body px-4 py-2.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]" role="status">
      <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--asp-accent)]" aria-hidden="true" />
      Prévisualisation : brouillons et modifications non publiées visibles
      <form action="/api/preview/disable" method="post">
        <button type="submit" className="ml-2 underline underline-offset-2 bg-transparent border-0 text-white cursor-pointer">Quitter</button>
      </form>
    </div>
  );
}
