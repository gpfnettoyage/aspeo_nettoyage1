import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/site/shared/PageHero';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import { Multiline } from '@/components/site/ui/Multiline';
import JsonLd from '@/components/site/JsonLd';
import { getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('a-propos');
}

const Bar = () => <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />;
const paragraphs = (t: string) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export default async function AboutPage() {
  const [{ c }, common, settings] = await Promise.all([getPageContent('a-propos'), getPageContent('blocs-communs'), getSettings()]);
  const { stats } = settings;
  const team = c.list('team.members').filter((m) => m.name?.trim());

  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Notre Histoire', path: '/a-propos' }], settings.company.website)]} />
      <PageHero
        eyebrow={c.t('hero.eyebrow')}
        title={<Multiline text={c.t('hero.title')} />}
        text={c.t('hero.text')}
        image={c.t('hero.image')}
        imageAlt="Les équipes ASPEO"
        actions={<>
          <ButtonLink href="/contact" className="p-[16px_28px] text-[length:.98rem]">Demander un devis</ButtonLink>
          <ButtonLink href="/proprete-services" arrow={false} variant="outlineLight" className="bg-[color:rgba(255,255,255,.1)] [border-color:rgba(255,255,255,.5)] p-[16px_26px] hover:bg-[color:rgba(255,255,255,.2)]">Nos services</ButtonLink>
        </>}
      />

      <section className="p-[clamp(72px,10vw,128px)_0_clamp(48px,6vw,72px)] bg-white">
        <Container className="grid grid-cols-[minmax(min(100%,240px),3fr)_minmax(min(100%,300px),7fr)] gap-[clamp(28px,5vw,80px)] items-start" data-r2="">
          <p className="text-[length:.98rem] leading-[1.75] text-[color:#42505f] m-[16px_0_0]">{c.t('intro.aside')}</p>
          <div>
            <p className="font-heading font-semibold text-[length:clamp(1.25rem,2.2vw,1.7rem)] leading-[1.45] tracking-[-.01em] text-navy m-[0_0_18px]">{c.t('intro.lead')}</p>
            <p className="text-[length:1.04rem] leading-[1.85] text-[color:#42505f] m-0">{c.t('intro.body')}</p>
          </div>
        </Container>
      </section>

      <section className="p-[clamp(48px,7vw,88px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.3rem)] leading-[1.15] tracking-[-.015em] m-[0_0_20px] text-navy">{c.t('story.title')}</h2>
          <p className="text-[length:1.04rem] leading-[1.85] text-[color:#42505f] m-[0_0_18px]">{c.t('story.intro')}</p>
          {c.list('story.blocks').map((b) => (
            <div key={b.title}>
              <h3 className="font-heading font-bold text-[length:1.25rem] text-navy m-[36px_0_12px]">{b.title}</h3>
              {paragraphs(b.text ?? '').map((p, i) => <p key={i} className="text-[length:1.04rem] leading-[1.85] text-[color:#42505f] m-[0_0_18px]">{p}</p>)}
            </div>
          ))}
          <div className="flex flex-wrap gap-[12px] mt-[28px]">
            <ButtonLink href="/contact" arrow={false} className="p-[15px_26px] text-[length:.95rem]">Parlons de votre besoin →</ButtonLink>
            <ButtonLink href="/proprete-services" variant="outline" arrow={false} className="p-[15px_24px] text-[length:.95rem]">Découvrir nos prestations</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="p-[clamp(48px,7vw,88px)_0] bg-[color:#f5f7fa]">
        <Container className="grid grid-cols-[minmax(min(100%,220px),1fr)_minmax(0,2.1fr)] gap-[clamp(32px,5vw,64px)] items-start" data-r2="">
          <div>
            <div className="flex items-center gap-[14px] mb-[16px]"><Bar /><h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.8vw,2.1rem)] leading-[1.16] tracking-[-.015em] m-0 text-navy">{c.t('values.title')}</h2></div>
            <p className="text-[length:.98rem] leading-[1.7] text-[color:#4a5568] m-0">{c.t('values.text')}</p>
          </div>
          <ol className="list-none p-0 m-0 flex flex-col">
            {c.list('values.items').map((v, i, arr) => (
              <li key={v.title} className={`flex gap-[24px] items-start p-[22px_0] ${i < arr.length - 1 ? '[border-bottom:1px_solid_#e8edf3]' : ''}`}>
                <span className="flex-none inline-flex items-center justify-center w-[42px] h-[42px] bg-[color:var(--asp-accent)] text-white font-heading font-extrabold text-[length:.95rem] leading-none tracking-[.02em]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_8px]">{v.title}</h3>
                  <p className="text-[length:.94rem] leading-[1.65] text-[color:#4a5568] m-0">{v.text}{v.proof && <> <strong>La preuve :</strong> {v.proof}</>}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="p-[clamp(48px,6vw,72px)_0_clamp(56px,8vw,104px)] bg-white">
        <Container className="flex flex-wrap gap-[clamp(32px,5vw,56px)] items-center">
          <div className="flex-[1_1_420px] min-w-[min(100%,290px)]">
            <div className="flex items-center gap-[14px]"><Bar /><h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.14] tracking-[-.015em] m-0 text-navy">{c.t('partner.title')}</h2></div>
            <p className="m-[16px_0_0] text-[length:1.02rem] leading-[1.75] text-[color:#4a5568]">{c.t('partner.text')}</p>
            <ul className="list-none p-0 flex flex-col gap-[18px] m-[26px_0_0]">
              {common.c.list('commitments').map((item) => (
                <li key={item.t} className="flex gap-[14px] items-start">
                  <span className="flex-none w-[28px] h-[28px] bg-[color:var(--asp-accent)] text-white flex items-center justify-center text-[length:.85rem] mt-[2px]" aria-hidden="true">✓</span>
                  <div>
                    <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_4px]">{item.t}</h3>
                    <p className="text-[length:.95rem] leading-[1.6] text-[color:#4a5568] m-0">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-[1_1_320px] min-w-[min(100%,270px)] [order:-1]">
            <div className="relative overflow-hidden aspect-[4/5] [border:1px_solid_#eef2f7] bg-[color:#dfe7f2]" data-img-stack="">
              <Image src={c.t('partner.image')} alt="Les équipes ASPEO" fill sizes="(max-width: 760px) 100vw, 40vw" className="object-cover" />
            </div>
          </div>
        </Container>
      </section>

      <section className="p-[clamp(48px,7vw,88px)_0] bg-[color:#f5f7fa]">
        <Container>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2.1rem)] tracking-[-.015em] m-[0_0_12px] text-navy">{c.t('vision.title')}</h2>
          <p className="text-[length:1.02rem] leading-[1.75] text-[color:#4a5568] m-[0_0_32px] max-w-[680px]">{c.t('vision.text')}</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-y-[28px]">
            {c.list('vision.items').map((it) => (
              <div key={it.title} className="p-[0_24px_0_0] [border-right:1px_solid_#e2e7ee] last:border-r-0">
                <span className="block w-[26px] h-[3px] bg-[color:var(--asp-accent)] mb-[16px]" aria-hidden="true" />
                <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_10px]">{it.title}</h3>
                <p className="text-[length:.94rem] leading-[1.65] text-[color:#4a5568] m-0">{it.text}</p>
              </div>
            ))}
          </div>
          {stats.showCounters && (
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[20px] m-[44px_0_0]">
              {[[`${stats.clients}+`, stats.clientsLabel], [`${stats.satisfaction}%`, 'Satisfaction'], [`${stats.years}+`, stats.yearsLabel]].map(([v, l]) => (
                <div key={l}>
                  <dd className="m-0 font-heading font-extrabold text-[length:2.2rem] text-[color:var(--asp-accent-ink)]">{v}</dd>
                  <dt className="text-[length:.88rem] text-[color:#4a5568]">{l}</dt>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,104px)_0] bg-white">
        <div className="max-w-[1000px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase text-navy">{c.t('timeline.eyebrow')}</span>
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
          </div>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.7rem,3.2vw,2.6rem)] leading-[1.12] tracking-[-.015em] m-[16px_0_10px] text-navy">{c.t('timeline.title')}</h2>
          <p className="text-[length:1.05rem] leading-[1.7] text-[color:#4a5568] m-0 max-w-[640px]">{c.t('timeline.text')}</p>
        </div>
        <div className="max-w-[1000px] m-[56px_auto_0] p-[0_clamp(20px,5vw,40px)] relative">
          <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-[color:#e0e6ee] [transform:translateX(-1px)] max-[640px]:left-[calc(clamp(20px,5vw,40px)_+_8px)]" aria-hidden="true" />
          <ol className="list-none p-0 m-0 flex flex-col">
            {c.list('timeline.items').map((ev, i) => {
              const left = i % 2 === 0;
              const textBlock = (
                <div className={`${left ? '[grid-column:1] text-right pr-[36px]' : '[grid-column:3] text-left pl-[36px]'} max-[640px]:[grid-column:2] max-[640px]:text-left max-[640px]:p-[0_0_0_20px]`}>
                  <div className="font-heading font-extrabold text-[length:1.3rem] text-[color:var(--asp-accent-ink)] leading-none mb-[8px]">{ev.year}</div>
                  <h3 className="font-heading font-bold text-[length:1.1rem] text-navy m-[0_0_8px]">{ev.title}</h3>
                  <p className="text-[length:.94rem] leading-[1.7] text-[color:#42505f] m-0">{ev.text}</p>
                </div>
              );
              const tagBlock = (
                <div className={`${left ? '[grid-column:3] pl-[36px]' : '[grid-column:1] pr-[36px]'} flex flex-col items-center text-center gap-[8px] max-[640px]:hidden`} aria-hidden="true">
                  <span className="w-[52px] h-[52px] rounded-full bg-[color:#f7f9fb] [border:1px_solid_#eef2f7] flex items-center justify-center text-[color:var(--asp-accent-ink)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {left ? <path d="M12 2l2.4 7.2H22l-6 4.6L18.4 22 12 17.3 5.6 22 8 13.8 2 9.2h7.6z" /> : <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />}
                    </svg>
                  </span>
                  <span className="font-heading font-bold text-[length:.82rem] text-[color:var(--asp-accent-ink)]">{ev.tag}</span>
                </div>
              );
              return (
                <li key={i} className="relative grid grid-cols-[1fr_48px_1fr] items-center p-[22px_0] max-[640px]:grid-cols-[16px_1fr]">
                  <div className="absolute left-[50%] top-[50%] [transform:translate(-50%,-50%)] w-[16px] h-[16px] rounded-full bg-[color:var(--asp-accent)] [border:4px_solid_#fff] shadow-[0_0_0_2px_var(--asp-accent)] z-[2] max-[640px]:left-[8px]" aria-hidden="true" />
                  {left ? <>{textBlock}{tagBlock}</> : <>{tagBlock}{textBlock}</>}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="max-w-[960px] m-[40px_auto_0] p-[0_clamp(20px,5vw,40px)]">
          <div className="[border-top:1px_solid_#eef2f7] pt-[40px] mb-[40px]">
            <div className="flex items-center gap-[14px] mb-[12px]"><Bar /><h3 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.4vw,1.9rem)] tracking-[-.015em] text-navy m-0">{c.t('future.title')}</h3></div>
            <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-0">{c.t('future.text')}</p>
          </div>
          <div className="relative overflow-hidden bg-navy text-white p-[clamp(32px,5vw,56px)_clamp(24px,4vw,48px)] flex flex-wrap gap-[24px] items-center justify-between" data-dark="">
            <Image src={c.t('cta.image')} alt="" fill sizes="960px" className="object-cover opacity-[.24]" />
            <div className="absolute inset-0 [background:linear-gradient(120deg,rgba(0,0,0,.72),rgba(0,0,0,.45))]" aria-hidden="true" />
            <div className="relative flex-[1_1_420px] min-w-[min(100%,260px)]">
              <h3 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.8vw,2.1rem)] leading-[1.12] m-[0_0_8px]">{c.t('cta.title')}</h3>
              <p className="text-[length:1.02rem] leading-[1.65] text-[color:rgba(255,255,255,.85)] m-0 max-w-[520px]">{c.t('cta.text')}</p>
            </div>
            <div className="relative flex flex-wrap gap-[14px]"><ButtonLink href="/contact" className="p-[16px_28px] text-[length:.98rem]">Nous contacter</ButtonLink></div>
          </div>
        </div>
      </section>

      {team.length > 0 && (
        <section className="p-[clamp(56px,8vw,104px)_0] bg-[color:#EAF1FB]">
          <Container>
            <div className="max-w-[680px] mb-[36px]">
              <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_12px] text-navy">{c.t('team.title')}</h2>
              <p className="text-[length:1.05rem] leading-[1.7] text-[color:#42505f] m-0">{c.t('team.text')}</p>
            </div>
            <ul className="list-none m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-[clamp(20px,3vw,32px)] bg-white p-[clamp(20px,3vw,32px)]">
              {team.map((m) => (
                <li key={m.name} className="flex flex-col gap-[12px]">
                  <div className="relative aspect-[4/5] bg-[color:#EAF1FB] overflow-hidden" data-portrait="">
                    {m.photo && <Image src={m.photo} alt={m.photoAlt || m.name} fill sizes="300px" className="object-cover" />}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-[length:1.08rem] text-navy">{m.name}</div>
                    <div className="text-[length:.9rem] text-[color:var(--asp-accent-ink)] font-semibold mt-[2px]">{m.role}</div>
                    {m.bio && <p className="text-[length:.92rem] leading-[1.6] text-[color:#42505f] m-[8px_0_0]">{m.bio}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </main>
  );
}
