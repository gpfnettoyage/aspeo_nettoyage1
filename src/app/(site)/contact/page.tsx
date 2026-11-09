import type { Metadata } from 'next';
import PageHero from '@/components/site/shared/PageHero';
import QuoteForm, { type Direction } from '@/components/site/forms/QuoteForm';
import { Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getCatalog, getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb, localBusiness } from '@/lib/site/jsonld';
import type { CategoryWithServices } from '@/lib/site/types';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('contact');
}

type Props = { searchParams: Promise<{ prestation?: string; objet?: string }> };
const isSeparate = (c: CategoryWithServices) => (typeof c.content.separateColumn === 'boolean' ? c.content.separateColumn : c.slug === 'services-annexes');

export default async function ContactPage({ searchParams }: Props) {
  const [{ c }, catalog, settings, sp] = await Promise.all([getPageContent('contact'), getCatalog(), getSettings(), searchParams]);
  const { company } = settings;
  const titles = (pred: (cat: CategoryWithServices) => boolean) => catalog.categories.filter(pred).flatMap((cat) => cat.services.map((s) => s.title));
  const directions: Direction[] = [
    { label: 'Nettoyage Professionnel', prestations: titles((cat) => cat.pole === 'professionnel' && !isSeparate(cat)) },
    { label: 'Interventions Spécialisées', prestations: titles((cat) => cat.pole === 'specialise' && !isSeparate(cat)) },
    { label: 'Autres Services', prestations: titles(isSeparate) },
    { label: 'Grands Comptes / Marchés Publics', prestations: [] },
    ...(sp.objet === 'presse' ? [{ label: 'Presse', prestations: [] }] : []),
  ].filter((d) => d.prestations.length > 0 || d.label === 'Grands Comptes / Marchés Publics' || d.label === 'Presse');

  // Préremplissage depuis une fiche service (?prestation=slug)
  const pre = sp.prestation ? catalog.services.find((s) => s.slug === sp.prestation) : undefined;
  const preDirection = pre ? directions.find((d) => d.prestations.includes(pre.title))?.label : sp.objet === 'presse' ? 'Presse' : undefined;

  return (
    <main>
      <JsonLd graph={[localBusiness(settings), breadcrumb([{ name: 'Contact', path: '/contact' }], company.website)]} />
      <PageHero
        eyebrow={c.t('hero.eyebrow')}
        title={c.t('hero.title')}
        text={c.t('hero.text')}
        image={c.t('hero.image')}
        imageAlt="Bureaux ASPEO à Panissières"
        actions={<a className="inline-flex items-center gap-[10px] bg-[color:rgba(255,255,255,.12)] [border:1.5px_solid_rgba(255,255,255,.6)] text-white no-underline p-[16px_26px] font-heading font-bold text-[length:.98rem]" href={`tel:${company.phoneIntl}`}>{company.phone}</a>}
      />

      <section className="p-[clamp(48px,7vw,88px)_0] bg-white" id="devis">
        <Container className="flex flex-wrap gap-[clamp(28px,4vw,48px)] items-start">
          <div className="flex-[1_1_460px] min-w-[min(100%,290px)]">
            <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2rem)] tracking-[-.015em] m-[0_0_8px] text-navy">{c.t('form.title')}</h2>
            <p className="text-[length:1rem] text-[color:#4a5568] m-[0_0_24px]">{c.t('form.text')} <span className="text-[color:var(--asp-accent-ink)]">* Champs requis</span></p>
            <QuoteForm directions={directions} initialDirection={preDirection} initialPrestation={pre?.title} phone={company.phone} phoneIntl={company.phoneIntl} />
            <div className="mt-[28px] [border-top:1px_solid_#dbe5f4] pt-[22px]">
              <h3 className="font-heading font-bold text-[length:1rem] text-navy m-[0_0_14px]">Que se passe-t-il après votre demande ?</h3>
              <ol className="list-none m-0 p-0 flex flex-col gap-[12px]">
                {[['Nous vous rappelons rapidement', 'pour préciser votre besoin.'], ['Nous planifions une visite', 'si nécessaire, à un horaire qui vous convient.'], ['Vous recevez votre devis', 'détaillé, gratuit et sans engagement.']].map(([s, t], i) => (
                  <li key={s} className="flex gap-[12px] items-start text-[length:.95rem] leading-[1.5] text-[color:#42505f]">
                    <span className="flex-none w-[26px] h-[26px] bg-[color:var(--asp-accent)] text-white font-bold text-[length:.82rem] flex items-center justify-center" aria-hidden="true">{i + 1}</span>
                    <span><strong className="text-navy">{s}</strong> {t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <aside className="flex-[1_1_300px] min-w-[min(100%,270px)] flex flex-col gap-[18px]">
            <div className="bg-navy text-white p-[28px_26px]" data-dark="">
              <h2 className="font-heading font-bold text-[length:1.15rem] m-[0_0_18px]">Nous contacter</h2>
              <dl className="m-0 flex flex-col gap-[16px]">
                <div><dt className="text-[length:.78rem] text-[color:rgba(255,255,255,.6)] uppercase tracking-[.08em] mb-[4px]">Téléphone</dt><dd className="m-0"><a className="text-white no-underline font-heading font-bold text-[length:1.05rem]" href={`tel:${company.phoneIntl}`}>{company.phone}</a></dd></div>
                <div><dt className="text-[length:.78rem] text-[color:rgba(255,255,255,.6)] uppercase tracking-[.08em] mb-[4px]">Email</dt><dd className="m-0"><a className="text-white no-underline font-semibold" href={`mailto:${company.email}`}>{company.email}</a></dd></div>
                <div><dt className="text-[length:.78rem] text-[color:rgba(255,255,255,.6)] uppercase tracking-[.08em] mb-[4px]">Adresse</dt><dd className="m-0 text-[color:rgba(255,255,255,.9)] leading-[1.5]">{company.street}<br />{company.postalCode} {company.city}, France</dd></div>
              </dl>
            </div>
            <div className="shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[28px_26px]">
              <h2 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_14px]">Nos horaires</h2>
              <dl className="m-0 flex flex-col gap-[8px] text-[length:.92rem] text-[color:#42505f]">
                {company.hours.map((h) => <div key={h.days} className="flex justify-between gap-[12px]"><dt>{h.days}</dt><dd className="m-0 text-navy font-semibold text-right">{h.value}</dd></div>)}
              </dl>
            </div>
            <div className="bg-[color:var(--asp-accent)] text-white p-[26px]">
              <h2 className="font-heading font-bold text-[length:1.05rem] m-[0_0_8px]">{c.t('aside.ctaTitle')}</h2>
              <p className="text-[length:.9rem] text-[color:rgba(255,255,255,.92)] leading-[1.55] m-[0_0_16px]">{c.t('aside.ctaText')}</p>
              <a className="block text-center bg-white text-[color:var(--asp-accent-ink)] no-underline p-[14px] font-heading font-bold" href={`tel:${company.phoneIntl}`}>{company.phone}</a>
            </div>
          </aside>
        </Container>
      </section>
    </main>
  );
}
