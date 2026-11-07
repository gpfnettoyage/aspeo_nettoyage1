import Image from 'next/image';
import type { PageAccessor } from '@/lib/site/page-content';
import { Multiline } from '@/components/site/ui/Multiline';

export default function HomeEnvironment({ c }: { c: PageAccessor }) {
  return (
    <section className="relative bg-navy text-white overflow-hidden" data-dark="" data-env="">
      <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-stretch" data-r2="">
        <div className="p-[clamp(56px,8vw,104px)_clamp(20px,5vw,72px)_clamp(56px,8vw,104px)_max(clamp(20px,5vw,40px),calc((100vw_-_1280px)/2_+_40px))]">
          <p className="m-0 font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase text-[color:var(--asp-accent)] mb-[14px]">{c.t('env.eyebrow')}</p>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.8rem,3.4vw,2.8rem)] leading-[1.08] tracking-[-.01em] uppercase m-[0_0_18px] text-white" data-light="">
            <Multiline text={c.t('env.title')} />
          </h2>
          <p className="text-[length:1.06rem] leading-[1.75] text-[color:rgba(255,255,255,.85)] m-[0_0_30px] max-w-[560px]">{c.t('env.text')}</p>
          <div className="[border-bottom:1px_solid_rgba(255,255,255,.18)]">
            {c.list('env.items').map((item, i) => (
              <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-[22px] p-[26px_0] [border-top:1px_solid_rgba(255,255,255,.18)]">
                <span className="font-heading font-light text-[length:clamp(2.4rem,4vw,3.2rem)] leading-[.9] text-[color:var(--asp-accent)] min-w-[64px]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-heading font-extrabold text-[length:1.2rem] leading-[1.25] text-white m-[0_0_8px]">{item.title}</h3>
                  <p className="text-[length:.98rem] leading-[1.7] text-[color:rgba(255,255,255,.82)] m-[0_0_14px]">{item.text}</p>
                  {item.proof && (
                    <p className="flex gap-[10px] items-start text-[length:.88rem] leading-[1.55] text-white m-0">
                      <span className="flex-none w-[20px] h-[20px] bg-[color:var(--asp-accent)] flex items-center justify-center mt-[1px]" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
                      </span>
                      <span>{item.proof}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] bg-[color:#1b2a55]" data-img-stack="">
          <Image src={c.t('env.image')} alt={c.t('env.imageAlt')} fill sizes="(max-width: 1040px) 100vw, 45vw" className="object-cover" />
          <span className="absolute left-0 top-[clamp(40px,8vw,90px)] w-[44px] h-[26px] bg-[color:var(--asp-accent)]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
