import Link from 'next/link';

export interface Crumb { name: string; href?: string }

/**
 * Fil d'Ariane de la maquette, en deux variantes :
 * - `light` sur les bandeaux photo (texte blanc atténué) ;
 * - par défaut sur fond clair (liens orange, page courante en bleu).
 */
export default function Breadcrumbs({ items, light = false, className }: { items: Crumb[]; light?: boolean; className?: string }) {
  const all: Crumb[] = [{ name: 'Accueil', href: '/' }, ...items];
  return (
    <nav aria-label="Fil d'Ariane" className={className ?? (light ? 'mb-[18px]' : '')}>
      <ol className={`list-none p-0 m-0 flex flex-wrap items-center gap-[6px] ${light ? 'text-[length:.84rem] text-[color:rgba(255,255,255,.8)]' : 'text-[length:.82rem] text-[color:#6b7684]'}`}>
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-[6px]">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href && !last ? (
                <Link href={c.href} className={`no-underline ${light ? 'text-inherit hover:text-white' : 'text-[color:var(--asp-accent-ink)] hover:underline'}`}>{c.name}</Link>
              ) : (
                <span aria-current="page" className={light ? 'text-white' : 'text-navy font-semibold'}>{c.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
