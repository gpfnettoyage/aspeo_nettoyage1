import Image from 'next/image';
import type { PageAccessor } from '@/lib/site/page-content';
import { ButtonLink, Eyebrow } from '@/components/site/ui/primitives';

export default function HomeProcess({ c }: { c: PageAccessor }) {
  return (
    <section className="p-[clamp(56px,8vw,104px)_0] bg-white">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[clamp(32px,6vw,88px)] items-center" data-r2="">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-[color:#dfe7f2]" data-img-stack="">
            <Image src={c.t('process.image')} alt={c.t('process.imageAlt')} fill sizes="(max-width: 1040px) 100vw, 45vw" className="object-cover" />
          </div>
          <span className="absolute left-[-14px] top-[18%] w-[28px] h-[56px] bg-[color:var(--asp-accent)]" aria-hidden="true" />
          <div className="absolute right-0 bottom-0 bg-navy text-white p-[18px_22px] max-w-[70%]">
            <div className="font-heading font-extrabold text-[length:1.6rem] leading-none">{c.t('process.badgeValue')}</div>
            <div className="text-[length:.88rem] leading-[1.4] mt-[6px] text-[color:rgba(255,255,255,.85)]">{c.t('process.badgeText')}</div>
          </div>
        </div>
        <div className="flex flex-col gap-[22px]">
          <div>
            <Eyebrow className="mb-[14px]">{c.t('process.eyebrow')}</Eyebrow>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_16px] text-navy">{c.t('process.title')}</h2>
            <p className="text-[length:1.08rem] leading-[1.75] text-[color:#42505f] m-0">{c.t('process.text')}</p>
          </div>
          {c.list('process.steps').map((s, i) => (
            <div key={i} className="[border-top:1px_solid_#d3deef] pt-[18px]">
              <h3 className="font-heading font-bold text-[length:1.1rem] leading-[1.3] text-navy m-[0_0_8px]">{s.title}</h3>
              <p className="text-[length:1rem] leading-[1.75] text-[color:#42505f] m-0">{s.text}</p>
            </div>
          ))}
          <ButtonLink href="/contact" className="self-start">Demander un devis gratuit</ButtonLink>
        </div>
      </div>
    </section>
  );
}
