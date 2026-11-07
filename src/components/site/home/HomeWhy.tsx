import Image from 'next/image';
import type { PageAccessor } from '@/lib/site/page-content';
import { ButtonLink, Eyebrow } from '@/components/site/ui/primitives';

const ICONS = [
  <svg key="shield" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5z" /><path d="m9 12 2 2 4-4" /></svg>,
  <svg key="doc" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>,
];

export default function HomeWhy({ c }: { c: PageAccessor }) {
  return (
    <section className="p-[clamp(56px,8vw,104px)_0] bg-[color:#EAF1FB]">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-[clamp(32px,6vw,88px)] items-center" data-r2="">
        <div className="flex flex-col gap-[18px]">
          <div className="mb-[8px]">
            <Eyebrow className="mb-[14px]">{c.t('why.eyebrow')}</Eyebrow>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_16px] text-navy">{c.t('why.title')}</h2>
            <p className="text-[length:1.08rem] leading-[1.75] text-[color:#42505f] m-0">{c.t('why.text')}</p>
          </div>
          {c.list('why.items').map((item, i) => (
            <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-[18px] bg-white p-[24px_24px_24px_22px] shadow-[0_18px_40px_-24px_rgba(6,34,109,.35)]">
              <span className="flex-none w-[48px] h-[48px] bg-navy flex items-center justify-center relative" aria-hidden="true">
                {ICONS[i % ICONS.length]}
                <span className="absolute right-[-5px] bottom-[-5px] w-[12px] h-[12px] bg-[color:var(--asp-accent)]" />
              </span>
              <div>
                <h3 className="font-heading font-extrabold text-[length:1.12rem] leading-[1.3] text-navy m-[0_0_8px]">{item.title}</h3>
                <p className="text-[length:.98rem] leading-[1.7] text-[color:#42505f] m-0">{item.text}</p>
              </div>
            </div>
          ))}
          <ButtonLink href="/contact" className="mt-[10px] self-start">Demander un devis gratuit</ButtonLink>
        </div>
        <div className="relative grid grid-cols-[1fr_1fr] gap-[8px]">
          <span className="absolute left-[-22px] top-[26%] w-[44px] h-[26px] bg-[color:var(--asp-accent)] z-[2]" data-hero-accent="" aria-hidden="true" />
          {c.list('why.images').slice(0, 4).map((img, i) => (
            <div key={i} className="relative aspect-[1/1] overflow-hidden bg-[color:#dfe7f2]">
              {img.src && <Image src={img.src} alt={img.alt ?? ''} fill sizes="(max-width: 1040px) 50vw, 22vw" className="object-cover" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
