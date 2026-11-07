import Image from 'next/image';
import Link from 'next/link';
import DevisCard from '@/components/site/shared/DevisCard';
import PageHero from '@/components/site/shared/PageHero';
import Breadcrumbs from '@/components/site/shared/Breadcrumbs';
import ServiceTile from '@/components/site/shared/ServiceTile';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import type { CategoryWithServices } from '@/lib/site/types';

const Bullet = ({ children }: { children: string }) => (
  <li className="flex gap-[12px] items-start">
    <span className="flex-none w-[8px] h-[8px] rounded-full bg-[color:var(--asp-accent)] mt-[8px]" aria-hidden="true" />
    <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-0">{children}</p>
  </li>
);

/** Page « activité » (ex. Nettoyage Professionnel) : prestations de la catégorie, méthode, appel. */
export default function CategoryView({ category }: { category: CategoryWithServices }) {
  const c = category.content;
  const ed = c.editorial;
  const method = c.method;
  return (
    <main>
      <PageHero
        eyebrow={c.kicker || category.name}
        title={c.headline || category.name}
        titleClassName="font-heading font-extrabold text-[length:clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-.02em] m-[16px_0_0] max-w-[600px]"
        text={c.subtitle}
        image={c.heroImage}
        imageAlt={c.headline || category.name}
        actions={<ButtonLink href="/contact" arrow={false} className="p-[15px_26px] text-[length:.94rem]">Une question, un projet ? Contactez-nous !</ButtonLink>}
        aside={<DevisCard />}
      />
      <Container className="pt-[14px]">
        <Breadcrumbs items={[{ name: 'Propreté & services', href: '/proprete-services' }, { name: category.name }]} />
      </Container>

      {c.intro && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
          <Container className="grid grid-cols-[minmax(min(100%,240px),3fr)_minmax(min(100%,300px),7fr)] gap-[clamp(28px,5vw,60px)] items-start" data-r2="">
            <div className="flex items-center gap-[14px]">
              <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
              <h2 className="font-heading font-extrabold text-[length:1.3rem] leading-[1.2] text-navy m-0">En bref</h2>
            </div>
            <p className="font-heading font-medium text-[length:clamp(1.08rem,1.6vw,1.3rem)] leading-[1.65] text-navy m-0">{c.intro}</p>
          </Container>
        </section>
      )}

      {ed && (
        <section className="p-[clamp(48px,7vw,80px)_0] bg-white">
          <Container className="grid grid-cols-[minmax(0,7fr)_minmax(min(100%,260px),3fr)] gap-[clamp(32px,5vw,64px)] items-start" data-r2="">
            <div>
              <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2rem)] tracking-[-.015em] text-navy m-[0_0_16px]">{ed.title}</h2>
              <p className="text-[length:1.02rem] leading-[1.8] text-[color:#42505f] m-[0_0_32px]">{ed.text}</p>
              <h3 className="font-heading font-bold text-[length:1.2rem] text-navy m-[0_0_12px]">{ed.subtitle1}</h3>
              <p className="text-[length:1.02rem] leading-[1.8] text-[color:#42505f] m-[0_0_14px]">{ed.text1}</p>
              <ul className="list-none p-0 m-[0_0_32px] flex flex-col gap-[10px]">{ed.bullets.map((b) => <Bullet key={b}>{b}</Bullet>)}</ul>
              <h3 className="font-heading font-bold text-[length:1.2rem] text-navy m-[0_0_12px]">{ed.subtitle2}</h3>
              <p className={`text-[length:1.02rem] leading-[1.8] text-[color:#42505f] ${ed.text3 ? 'm-[0_0_14px]' : 'm-0'}`}>{ed.text2}</p>
              {ed.text3 && <p className="text-[length:1.02rem] leading-[1.8] text-[color:#42505f] m-0">{ed.text3}</p>}
            </div>
            <aside className="bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[clamp(24px,3vw,32px)] sticky top-[140px]">
              <div className="font-heading font-bold text-[length:.92rem] text-[color:#42505f] m-[0_0_6px]">{ed.statLabel}</div>
              <div className="font-heading font-extrabold text-[length:clamp(2.6rem,4vw,3.4rem)] text-[color:var(--asp-accent-ink)] leading-none m-[0_0_10px]">{ed.statValue}</div>
              <p className="text-[length:1rem] leading-[1.5] text-navy font-bold m-[0_0_4px]">{ed.statStrong}</p>
              <p className="text-[length:.98rem] leading-[1.6] text-[color:#42505f] m-[0_0_14px]">{ed.statText}</p>
              <p className="text-[length:.8rem] text-[color:#9aa5b1] m-[0_0_22px]">{ed.statNote}</p>
              <Link href="/contact" className="block text-center w-full bg-[color:var(--asp-accent)] text-white p-[14px_18px] font-heading font-bold text-[length:.9rem] no-underline hover:[background:color-mix(in_srgb,var(--asp-accent)_84%,#000)]">Échanger avec nos experts sur vos enjeux</Link>
            </aside>
          </Container>
        </section>
      )}

      <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#EAF1FB]">
        <Container>
          <div className="flex items-center gap-[14px] mb-[14px]">
            <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.3rem)] leading-[1.12] tracking-[-.015em] m-0 text-navy">{c.listTitle || `Nos prestations — ${category.name}`}</h2>
          </div>
          <p className="text-[length:1rem] leading-[1.65] text-[color:#42505f] m-[0_0_30px_18px] max-w-[640px]">Choisissez la prestation qui correspond à votre situation pour découvrir le déroulement, ce qui est inclus et les questions fréquentes.</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] [grid-auto-rows:minmax(280px,auto)] gap-[16px]">
            {category.services.map((s) => <ServiceTile key={s.href} href={s.href} title={s.title} text={s.tagline} image={s.image} />)}
          </div>
        </Container>
      </section>

      {method && (
        <section className="p-0 bg-white grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))]">
          <div className="p-[clamp(48px,7vw,88px)_clamp(24px,5vw,56px)] flex flex-col justify-center">
            <div className="flex items-center gap-[14px] m-[0_0_18px]">
              <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
              <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2.1rem)] leading-[1.15] text-navy m-0">{method.title}</h2>
            </div>
            <p className="font-heading font-semibold text-[length:1.05rem] leading-[1.55] text-navy m-[0_0_26px]">{method.intro}</p>
            <ol className="list-none p-0 grid grid-cols-[1fr_1fr] gap-[22px_24px] m-[0_0_30px]" data-r2s="">
              {method.steps.map((step, i) => (
                <li key={i} className="[border-top:2px_solid_#06226D] pt-[16px]">
                  <span className="block font-heading font-normal text-[length:2.4rem] leading-none text-[color:var(--asp-accent-ink)] mb-[10px]" aria-hidden="true">{i + 1}</span>
                  <p className="text-[length:.95rem] leading-[1.6] text-[color:#42505f] m-0">{step}</p>
                </li>
              ))}
            </ol>
            <div className="bg-navy text-white p-[26px_28px]" data-dark="">
              <h3 className="font-heading font-extrabold text-[length:1.15rem] m-[0_0_10px]">{method.calloutTitle}</h3>
              <p className="text-[length:.92rem] leading-[1.6] m-[0_0_18px] text-[color:rgba(255,255,255,.85)]">{method.calloutText}</p>
              <ButtonLink href="/contact" arrow={false} className="p-[13px_22px] text-[length:.92rem]">Contactez-nous</ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[360px] bg-[color:#dfe7f2]">
            {c.methodImage && <Image src={c.methodImage} alt="Les équipes ASPEO" fill sizes="(max-width: 760px) 100vw, 50vw" className="object-cover" />}
          </div>
        </section>
      )}

      {c.cta && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white text-navy text-center">
          <div className="max-w-[820px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
            <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.8vw,2.2rem)] leading-[1.25] text-navy m-[0_0_18px]">{c.cta.title}</h2>
            <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-[0_0_28px]">{c.cta.text}</p>
            <ButtonLink href="/contact" arrow={false} className="p-[16px_28px] text-[length:.98rem]">Contactez-nous</ButtonLink>
          </div>
        </section>
      )}
    </main>
  );
}
