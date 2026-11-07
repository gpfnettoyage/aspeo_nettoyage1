import Image from 'next/image';
import type { PageAccessor } from '@/lib/site/page-content';
import { ButtonLink } from '@/components/site/ui/primitives';
import HeroSearch from './HeroSearch';

export default function HomeHero({ c, phone, phoneIntl }: { c: PageAccessor; phone: string; phoneIntl: string }) {
  const images = c.list('hero.images').slice(0, 4);
  return (
    <section className="bg-white text-navy pt-[clamp(146px,18vh,166px)]" data-hero-home="">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[clamp(28px,5vw,64px)] items-center" data-r2="">
        <div className="p-[clamp(24px,5vw,56px)_0]" data-hero-text="">
          <p className="m-0 font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase text-[color:var(--asp-accent-ink)]">{c.t('hero.eyebrow')}</p>
          <h1 className="font-heading font-normal text-[length:clamp(2rem,3.8vw,3.2rem)] leading-[1.08] tracking-[.005em] uppercase m-[18px_0_0] text-navy">{c.t('hero.title')}</h1>
          <p className="m-[22px_0_0] text-[length:1.04rem] leading-[1.7] text-[color:#42505f] max-w-[560px]">
            <strong className="text-navy">{c.t('hero.leadStrong')}</strong> {c.t('hero.lead')}
          </p>
          <HeroSearch placeholder={c.t('hero.searchPlaceholder')} />
          <div className="flex flex-wrap gap-[14px] m-[24px_0_0]" data-hero-cta="">
            <ButtonLink href="/contact">Demander un devis gratuit</ButtonLink>
            <a className="hidden items-center justify-center gap-[8px] [border:1.5px_solid_#06226D] text-navy no-underline p-[13px_22px] font-heading font-bold text-[length:.95rem]" data-xs-only="" href={`tel:${phoneIntl}`}>
              Appeler le {phone}
            </a>
            <ButtonLink href="/a-propos" variant="ghost">Découvrir ASPEO</ButtonLink>
          </div>
        </div>
        <div className="relative grid grid-cols-[1fr_1fr] grid-rows-[1.35fr_1fr] gap-[8px] h-[clamp(360px,52vw,600px)]" data-hero-mosaic="">
          <span className="absolute left-[-22px] top-[26%] w-[44px] h-[26px] bg-[color:var(--asp-accent)] z-[2]" data-hero-accent="" aria-hidden="true" />
          {images.map((img, i) => (
            <div key={i} className="relative min-h-0 overflow-hidden bg-[color:#dfe7f2]">
              {img.src && <Image src={img.src} alt={img.alt ?? ''} fill priority={i < 2} sizes="(max-width: 1040px) 50vw, 30vw" className="object-cover" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
