import { Stars } from '@/components/site/ui/primitives';

export interface TestimonialItem { id: string; author: string; initials: string | null; context: string | null; quote: string }

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

function Card({ t, hidden }: { t: TestimonialItem; hidden?: boolean }) {
  return (
    <figure className="m-0 bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[26px_24px] flex flex-col gap-[14px] relative" aria-hidden={hidden || undefined}>
      <span className="absolute top-[14px] right-[20px] [font-family:Georgia,serif] text-[length:2.6rem] text-[color:var(--asp-accent-ink)] opacity-[.14] leading-none" aria-hidden="true">”</span>
      <Stars className="text-[length:.95rem]" />
      <blockquote className="text-[length:.96rem] leading-[1.65] text-[color:#334155] m-0">“{t.quote}”</blockquote>
      <figcaption className="flex items-center gap-[12px] pt-[12px] [border-top:1px_solid_#eef1f5]">
        <span className="w-[42px] h-[42px] flex-none bg-navy text-white flex items-center justify-center font-heading font-bold text-[length:.9rem]" aria-hidden="true">{t.initials || initialsOf(t.author)}</span>
        <span>
          <span className="block font-heading font-bold text-[length:.96rem] text-navy">{t.author}</span>
          {t.context && <span className="block text-[length:.8rem] text-[color:#94a3b8]">{t.context}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Mur d'avis défilant verticalement (3 colonnes sur ordinateur, 2 sur tablette, 1 sur mobile),
 * mis en pause au survol. Les avis sont dupliqués pour une boucle continue ; la copie est masquée
 * aux lecteurs d'écran.
 */
export default function TestimonialWall({ items }: { items: TestimonialItem[] }) {
  const columns = (n: number) => Array.from({ length: n }, (_, ci) => items.filter((_, i) => i % n === ci));
  const render = (n: number, cls: string) => (
    <div className={`asp-vwall relative gap-[20px] h-[560px] mt-[36px] overflow-hidden [mask-image:linear-gradient(180deg,transparent_0,#000_70px,#000_calc(100%_-_70px),transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,transparent_0,#000_70px,#000_calc(100%_-_70px),transparent_100%)] ${cls}`}>
      {columns(n).map((col, ci) => (
        <div key={ci} className="flex-1 min-w-0">
          <div className="asp-vtrack flex flex-col gap-[20px]" style={{ animationDuration: `${col.length * 7 + 18}s` }}>
            {col.map((t) => <Card key={t.id} t={t} />)}
            {col.map((t) => <Card key={`${t.id}-copie`} t={t} hidden />)}
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <>
      {render(3, 'flex max-[1000px]:hidden')}
      {render(2, 'hidden min-[641px]:max-[1000px]:flex')}
      {render(1, 'hidden max-[640px]:flex')}
    </>
  );
}
