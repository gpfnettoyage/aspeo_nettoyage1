import Image from 'next/image';
import Link from 'next/link';
import type { PageAccessor } from '@/lib/site/page-content';
import { BarHeading, ButtonLink } from '@/components/site/ui/primitives';

const chipCls = 'bg-white [border:1px_solid_#e2e8f0] text-navy font-semibold text-[length:.88rem] p-[9px_16px] no-underline';

export default function HomeZones({ c }: { c: PageAccessor }) {
  return (
    <section className="p-[clamp(56px,8vw,104px)_0] bg-[color:#EAF1FB]">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,64px)] items-center">
        <div>
          <BarHeading className="mb-[14px]">{c.t('zones.title')}</BarHeading>
          <p className="text-[length:1.02rem] leading-[1.75] text-[color:#42505f] m-[0_0_22px] max-w-[520px]">{c.t('zones.text')}</p>
          <ul className="list-none p-0 m-[0_0_26px] flex flex-wrap gap-[10px]">
            {c.list('zones.chips').map((chip) => (
              <li key={chip.label}>
                {chip.href ? <Link href={chip.href} className={`${chipCls} inline-block hover:[border-color:#06226D]`}>{chip.label}</Link> : <span className={`${chipCls} inline-block`}>{chip.label}</span>}
              </li>
            ))}
          </ul>
          <ButtonLink href="/zones-intervention">Voir toutes nos zones</ButtonLink>
        </div>
        <div className="relative w-full h-[clamp(260px,30vw,360px)] overflow-hidden bg-[color:#dfe7f2]">
          <Image src={c.t('zones.image')} alt={c.t('zones.imageAlt')} fill sizes="(max-width: 860px) 100vw, 50vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
