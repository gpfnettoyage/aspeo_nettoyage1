import type { Metadata } from 'next';
import PageHero from '@/components/site/shared/PageHero';
import RealisationsGrid from '@/components/site/realisations/RealisationsGrid';
import { Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getPageContent, getRealisations } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { urls } from '@/lib/site/urls';
import type { Fact } from '@/lib/site/types';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('realisations');
}

export default async function RealisationsPage() {
  const [{ c }, realisations, settings] = await Promise.all([getPageContent('realisations'), getRealisations(), getSettings()]);
  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Médias', path: urls.medias() }, { name: 'Nos réalisations', path: urls.realisations() }], settings.company.website)]} />
      <PageHero eyebrow={c.t('hero.eyebrow')} title={c.t('hero.title')} text={c.t('hero.text')} image={c.t('hero.image')} imageAlt="Chantier de nettoyage ASPEO" />
      <section className="p-[clamp(48px,7vw,80px)_0_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          <p className="text-[length:1.04rem] leading-[1.85] text-[color:#42505f] m-0">{c.t('intro')}</p>
        </Container>
      </section>
      <section className="p-[clamp(40px,6vw,64px)_0_clamp(56px,8vw,96px)] bg-white">
        <Container>
          <RealisationsGrid items={realisations.map((r) => ({
            slug: r.slug, href: urls.realisation(r.slug), title: r.title, city: r.city, client: r.client, serviceLabel: r.serviceLabel, image: r.image, imageAlt: r.imageAlt, pole: r.pole,
            facts: (Array.isArray(r.facts) ? r.facts : []) as unknown as Fact[],
          }))} />
        </Container>
      </section>
    </main>
  );
}
