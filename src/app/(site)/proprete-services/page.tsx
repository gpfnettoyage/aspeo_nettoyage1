import type { Metadata } from 'next';
import PageHero from '@/components/site/shared/PageHero';
import NavyCtaPanel from '@/components/site/shared/NavyCtaPanel';
import ServicesExplorer from '@/components/site/services/ServicesExplorer';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getCatalog, getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { absoluteUrl, urls } from '@/lib/site/urls';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('proprete-services');
}

export default async function ServicesPage() {
  const [{ c }, catalog, settings] = await Promise.all([getPageContent('proprete-services'), getCatalog(), getSettings()]);
  const base = settings.company.website;
  const groups = catalog.categories.map((cat) => ({
    slug: cat.slug, href: cat.href, label: cat.name, intro: cat.description ?? '', pole: cat.pole,
    items: cat.services.map((s) => ({ href: s.href, title: s.title, tagline: s.tagline, short: s.short, image: s.image, pole: s.pole })),
  }));

  return (
    <main>
      <JsonLd graph={[
        breadcrumb([{ name: 'Propreté & Services', path: urls.services() }], base),
        { '@type': 'ItemList', name: 'Prestations ASPEO', itemListElement: catalog.services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: absoluteUrl(s.href, base) })) },
      ]} />
      <PageHero
        eyebrow={c.t('hero.eyebrow')}
        title={c.t('hero.title')}
        text={c.t('hero.text')}
        image={c.t('hero.image')}
        actions={<ButtonLink href="/contact" className="p-[16px_28px] text-[length:.98rem]">Demander un devis</ButtonLink>}
      />

      <section className="p-[clamp(72px,10vw,128px)_0_clamp(48px,6vw,72px)] bg-white">
        <Container className="grid grid-cols-[minmax(min(100%,240px),3fr)_minmax(min(100%,300px),7fr)] gap-[clamp(28px,5vw,80px)] items-start" data-r2="">
          <div>
            <span className="block w-[4px] h-[30px] bg-[color:var(--asp-accent)] mb-[14px]" aria-hidden="true" />
            <p className="text-[length:.98rem] leading-[1.75] text-[color:#42505f] m-[16px_0_0]">{c.t('intro.aside')}</p>
          </div>
          <div>
            <p className="font-heading font-semibold text-[length:clamp(1.25rem,2.2vw,1.7rem)] leading-[1.45] tracking-[-.01em] text-navy m-[0_0_18px]">{c.t('intro.lead')}</p>
            <p className="text-[length:1.04rem] leading-[1.85] text-[color:#42505f] m-0">{c.t('intro.body')}</p>
          </div>
        </Container>
      </section>

      <section className="p-[clamp(24px,4vw,48px)_0_clamp(72px,10vw,120px)] bg-white">
        <Container>
          <ServicesExplorer groups={groups} />
        </Container>
      </section>

      <section className="p-[0_0_clamp(72px,10vw,120px)] bg-white">
        <Container>
          <NavyCtaPanel eyebrow={c.t('cta.eyebrow')} title={c.t('cta.title')} text={c.t('cta.text')} image={c.t('cta.image')} phone={settings.company.phone} phoneIntl={settings.company.phoneIntl} />
        </Container>
      </section>
    </main>
  );
}
