import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/site/shared/PageHero';
import Disclosure from '@/components/site/ui/Disclosure';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getFaq, getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb, faqPage } from '@/lib/site/jsonld';
import { toParagraphs } from '@/lib/site/text';
import { urls } from '@/lib/site/urls';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('grands-comptes');
}

const pad = (n: number) => String(n + 1).padStart(2, '0');
const Bar = () => <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />;
const DocIcon = () => (
  <svg className="flex-none mt-[2px]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--asp-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="m9 14 2 2 4-4" />
  </svg>
);

export default async function AccountsPage() {
  const [{ c }, faq, settings] = await Promise.all([getPageContent('grands-comptes'), getFaq('grands-comptes'), getSettings()]);
  const { company } = settings;
  const setup = c.list('setup.items');
  const steps = c.list('method.steps');

  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Grands Comptes & Marchés Publics', path: urls.accounts() }], company.website), ...(faq.length ? [faqPage(faq)] : [])]} />
      <PageHero
        eyebrow={c.t('hero.eyebrow')}
        title={c.t('hero.title')}
        text={c.t('hero.text')}
        image={c.t('hero.image')}
        imageAlt="Base de vie de chantier autoroutier"
        actions={<>
          <ButtonLink href={urls.contact()} className="p-[16px_28px] text-[length:.98rem]">Demander un devis gratuit</ButtonLink>
          <ButtonLink href={`tel:${company.phoneIntl}`} variant="outlineLight" arrow={false}>Ligne directe : {company.phone}</ButtonLink>
        </>}
      />

      <section className="bg-[color:#EAF1FB] p-[clamp(28px,4vw,40px)_0]">
        <Container>
          <h2 className="font-heading font-bold text-[length:.78rem] tracking-[.14em] uppercase text-navy m-[0_0_14px]">{c.t('brief.title')}</h2>
          <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-[1px] bg-[color:#c9d6ea] [border:1px_solid_#c9d6ea]" data-sepgrid="">
            {c.list('brief.items').map((b) => (
              <li key={b.title} className="bg-white p-[22px_22px_20px]">
                <div className="font-heading font-extrabold text-[length:1.15rem] leading-[1.25] text-navy">{b.title}</div>
                <div className="text-[length:.9rem] leading-[1.5] text-[color:#42505f] mt-[6px]">{b.text}</div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          {toParagraphs(c.t('intro')).map((p, i, a) => <p key={i} className={`text-[length:1.05rem] leading-[1.85] text-[color:#42505f] ${i < a.length - 1 ? 'm-[0_0_20px]' : 'm-0'}`}>{p}</p>)}
        </Container>
      </section>

      <section className="p-[0_0_clamp(56px,8vw,96px)] bg-white">
        <Container>
          <div className="flex items-center gap-[14px] mb-[28px]"><Bar /><h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2.1rem)] tracking-[-.015em] text-navy m-0">{c.t('setup.title')}</h2></div>
          <ol className="list-none p-0 m-0 flex flex-col">
            {setup.map((s, i) => (
              <li key={s.title} className={`flex gap-[28px] items-start p-[26px_0] [border-top:1px_solid_#e2e8f0] ${i === setup.length - 1 ? '[border-bottom:1px_solid_#e2e8f0]' : ''}`}>
                <span className="flex-none inline-flex items-center justify-center w-[42px] h-[42px] bg-[color:var(--asp-accent)] text-white font-heading font-extrabold text-[length:.95rem] leading-none tracking-[.02em]" aria-hidden="true">{pad(i)}</span>
                <div>
                  <h3 className="font-heading font-bold text-[length:1.1rem] text-navy m-[0_0_6px]">{s.title}</h3>
                  <p className="text-[length:.96rem] leading-[1.7] text-[color:#42505f] m-0 max-w-[640px]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] gap-[clamp(28px,5vw,64px)] items-start" data-r2="">
          <div>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('commit.title')}</h2>
            <p className="text-[length:1.05rem] leading-[1.7] text-[color:#42505f] m-[0_0_20px]">{c.t('commit.text')}</p>
            <ButtonLink href={urls.contact()}>Demander un devis gratuit</ButtonLink>
          </div>
          <div className="[border:1px_solid_#dbe5f4] overflow-x-auto">
            <table className="w-full [border-collapse:collapse]">
              <tbody>
                {c.list('commit.rows').map((r) => (
                  <tr key={r.title}>
                    <th scope="row" className="text-left [vertical-align:top] p-[16px_20px] [border-bottom:1px_solid_#dbe5f4] font-heading font-bold text-[length:.98rem] text-navy w-[38%]">{r.title}</th>
                    <td className="p-[16px_20px] [border-bottom:1px_solid_#dbe5f4] text-[length:.96rem] leading-[1.6] text-[color:#42505f]">{r.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="p-[0_0_clamp(56px,8vw,96px)] bg-white">
        <Container>
          <div className="flex items-center gap-[14px] mb-[28px]"><Bar /><h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2.1rem)] tracking-[-.015em] text-navy m-0">{c.t('sectors.title')}</h2></div>
          <div className="max-w-[900px] flex flex-col gap-[18px]">
            <p className="text-[length:1.05rem] leading-[1.8] text-[color:#42505f] m-0">{c.t('sectors.intro')}</p>
            {c.list('sectors.items').map((s) => <p key={s.title} className="text-[length:1.02rem] leading-[1.8] text-[color:#42505f] m-0"><strong className="text-navy">{s.title}</strong> {s.text}</p>)}
          </div>
        </Container>
      </section>

      <section className="p-[0_0_clamp(56px,8vw,96px)] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          <h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.4vw,1.9rem)] tracking-[-.015em] text-navy m-[0_0_16px]">{c.t('ref.title')}</h2>
          {toParagraphs(c.t('ref.text')).map((p, i, a) => <p key={i} className={`text-[length:1.02rem] leading-[1.8] text-[color:#42505f] ${i < a.length - 1 ? 'm-[0_0_20px]' : 'm-0'}`}>{p}</p>)}
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,104px)_0] bg-navy text-white" data-dark="">
        <Container>
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase text-[color:rgba(255,255,255,.85)]">Notre méthode</span>
          </div>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.45rem,2.6vw,2.05rem)] tracking-[-.015em] m-[14px_0_32px]" data-light="">{c.t('method.title')}</h2>
          <ol className="list-none p-0 m-0 flex flex-col">
            {steps.map((st, i) => (
              <li key={st.title} className={`[border-top:1px_solid_rgba(255,255,255,.12)] ${i === steps.length - 1 ? '[border-bottom:1px_solid_rgba(255,255,255,.12)]' : ''} p-[22px_0] flex gap-[clamp(16px,3vw,32px)] items-start flex-wrap`}>
                <div className="flex-none w-[42px] h-[42px] bg-[color:var(--asp-accent)] text-white flex items-center justify-center font-heading font-extrabold text-[length:.95rem]" aria-hidden="true">{pad(i)}</div>
                <div className="flex-[1_1_300px] min-w-[min(100%,240px)]">
                  <h3 className="font-heading font-bold text-[length:1.12rem] m-[2px_0_6px]">{st.title}</h3>
                  <p className="text-[length:.97rem] leading-[1.65] text-[color:rgba(255,255,255,.8)] m-0">{st.text}</p>
                </div>
                {st.duration && <div className="flex-none bg-[color:rgba(255,255,255,.08)] [border:1px_solid_rgba(255,255,255,.16)] p-[8px_14px] font-heading font-bold text-[length:.8rem] tracking-[.05em]">{st.duration}</div>}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#EAF1FB]">
        <Container>
          <div className="max-w-[700px] mb-[32px]">
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('docs.title')}</h2>
            <p className="text-[length:1.05rem] leading-[1.7] text-[color:#42505f] m-0">{c.t('docs.text')}</p>
          </div>
          <ul className="list-none m-0 p-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[1px] bg-[color:#c9d6ea] [border:1px_solid_#c9d6ea]" data-sepgrid="">
            {c.list('docs.items').map((d) => (
              <li key={d.title} className="bg-white p-[18px_20px] flex gap-[14px] items-start">
                <DocIcon />
                <span>
                  <span className="block font-heading font-bold text-[length:1rem] text-navy">{d.title}</span>
                  <span className="block text-[length:.9rem] leading-[1.5] text-[color:#42505f] mt-[3px]">{d.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {faq.length > 0 && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
          <Container className="grid grid-cols-[minmax(0,1fr)]">
            <div className="flex items-center gap-[14px] mb-[24px]"><Bar /><h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.4vw,1.9rem)] tracking-[-.015em] text-navy m-0">Questions fréquentes</h2></div>
            <Disclosure variant="list" items={faq.map((f) => ({ title: f.question, content: <p className="m-0">{f.answer}</p> }))} />
          </Container>
        </section>
      )}

      <section className="p-[0_0_clamp(56px,8vw,96px)] bg-white">
        <Container>
          <div className="relative overflow-hidden bg-navy text-white p-[clamp(32px,5vw,56px)_clamp(24px,4vw,48px)] flex flex-wrap gap-[24px] items-center justify-between" data-dark="" data-cta-band="">
            <Image src={c.t('cta.image')} alt="" fill sizes="1200px" className="object-cover opacity-[.24]" />
            <div className="absolute inset-0 [background:linear-gradient(120deg,rgba(0,0,0,.72),rgba(0,0,0,.45))]" aria-hidden="true" />
            <div className="relative flex-[1_1_420px] min-w-[min(100%,260px)]">
              <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.8vw,2.1rem)] leading-[1.12] m-[0_0_8px]" data-light="">{c.t('cta.title')}</h2>
              <p className="text-[length:1.02rem] leading-[1.65] text-[color:rgba(255,255,255,.85)] m-0 max-w-[520px]">{c.t('cta.text')}</p>
            </div>
            <div className="relative flex flex-wrap gap-[14px]"><ButtonLink href={urls.contact()} className="p-[16px_28px] text-[length:.98rem]">Nous contacter</ButtonLink></div>
          </div>
        </Container>
      </section>
    </main>
  );
}
