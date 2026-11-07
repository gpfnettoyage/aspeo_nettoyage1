import Image from 'next/image';
import Link from 'next/link';
import type { PageAccessor } from '@/lib/site/page-content';
import { ButtonLink } from '@/components/site/ui/primitives';

export default function HomeMissions({ c }: { c: PageAccessor }) {
  return (
    <section className="[background:linear-gradient(180deg,#EAF1FB_0,#EAF1FB_58%,#fff_58%)] p-[clamp(48px,6vw,80px)_0_clamp(48px,6vw,72px)]">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[clamp(24px,5vw,72px)] items-start mb-[clamp(32px,5vw,56px)]" data-r2="">
          <h2 className="font-heading font-extrabold text-[length:clamp(1.8rem,3.4vw,2.6rem)] leading-[1.1] m-0 text-navy">{c.t('missions.title')}</h2>
          <div>
            <p className="text-[length:1.05rem] leading-[1.75] text-[color:#42505f] m-[0_0_20px]">{c.t('missions.text')}</p>
            <ButtonLink href="/proprete-services" variant="white" arrow={false}>Nos services</ButtonLink>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-0">
          {c.list('missions.cards').map((card) => (
            <Link key={card.href + card.title} href={card.href || '/proprete-services'} className="relative block p-0 text-left aspect-[3/4] bg-[color:#1b1f24] overflow-hidden no-underline [transition:filter_.2s] hover:[filter:brightness(1.06)]" data-mob-card="">
              {card.image && <Image src={card.image} alt="" fill sizes="(max-width: 860px) 100vw, 33vw" className="object-cover" />}
              <span className="absolute inset-0 [background:linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,.7)_100%)]" aria-hidden="true" />
              <span className="absolute left-0 right-0 bottom-0 flex items-end justify-between gap-[12px] p-[22px_20px]">
                <span className="flex items-start gap-[12px]">
                  <span className="flex-none w-[22px] h-[10px] bg-[color:var(--asp-accent)] mt-[6px] ml-[-20px]" aria-hidden="true" />
                  <span className="font-heading font-extrabold text-[length:1.02rem] leading-[1.25] tracking-[.02em] uppercase text-white">{card.title}</span>
                </span>
                <span className="flex-none w-[32px] h-[32px] [border:1.5px_solid_#fff] text-white flex items-center justify-center text-[length:1rem]" aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
