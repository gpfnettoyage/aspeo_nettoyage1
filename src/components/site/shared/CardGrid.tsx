import Image from 'next/image';
import Link from 'next/link';
import { BarLabel, ButtonLink } from '@/components/site/ui/primitives';
import { formatDate } from '@/lib/site/format';

export interface CardItem { href: string; title: string; image: string | null; imageAlt?: string | null; badge: string; date: Date | string | null }

/** Carte « article / parution » : image 4:3, pastille, date, titre, « Lire la suite ». */
export function ArticleCard({ item, headingLevel = 'h3' }: { item: CardItem; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <Link href={item.href} className="text-left p-0 flex flex-col items-start w-full no-underline group">
      <div className="relative w-full aspect-[4/3] mb-[16px] overflow-hidden bg-[color:#dfe7f2]" data-card-img="">
        {item.image && <Image src={item.image} alt={item.imageAlt || ''} fill sizes="(max-width: 700px) 100vw, 33vw" className="object-cover [transition:transform_.4s_ease] group-hover:scale-[1.03]" />}
      </div>
      <div className="flex items-center gap-[12px] mb-[12px] flex-wrap">
        <span className="bg-[color:var(--asp-accent)] text-white font-heading font-extrabold text-[length:.68rem] tracking-[.05em] uppercase p-[5px_10px]">{item.badge}</span>
        {item.date && <span className="text-[length:.84rem] text-[color:#94a3b8]">{typeof item.date === 'string' ? item.date : formatDate(item.date)}</span>}
      </div>
      <H className="font-heading font-bold text-[length:1.15rem] leading-[1.35] text-navy m-[0_0_12px]">{item.title}</H>
      <span className="text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.9rem] inline-flex items-center gap-[8px]">Lire la suite <span aria-hidden="true">→</span></span>
    </Link>
  );
}

/** Section « Nos dernières actualités » / « Ils parlent de nous ». */
export function CardSection({ eyebrow, title, items, href, linkLabel, tinted = false }: { eyebrow: string; title: string; items: CardItem[]; href: string; linkLabel: string; tinted?: boolean }) {
  if (!items.length) return null;
  return (
    <section className={`p-[clamp(56px,8vw,104px)_0] ${tinted ? 'bg-[color:#EAF1FB]' : 'bg-white'}`}>
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] flex items-end justify-between gap-[20px] flex-wrap mb-[36px]">
        <div>
          <BarLabel className="mb-[14px]">{eyebrow}</BarLabel>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.7rem,3.2vw,2.6rem)] leading-[1.12] tracking-[-.015em] m-0 text-navy">{title}</h2>
        </div>
        <ButtonLink href={href} variant="link">{linkLabel}</ButtonLink>
      </div>
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[28px] mb-[36px]">
          {items.map((it) => <ArticleCard key={it.href} item={it} />)}
        </div>
        <ButtonLink href={href} variant="navy">{linkLabel}</ButtonLink>
      </div>
    </section>
  );
}
