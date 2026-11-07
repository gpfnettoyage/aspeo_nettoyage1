import type { Metadata } from 'next';
import PageHero from '@/components/site/shared/PageHero';
import ArticlesGrid from '@/components/site/medias/ArticlesGrid';
import { Container } from '@/components/site/ui/primitives';
import { Multiline } from '@/components/site/ui/Multiline';
import JsonLd from '@/components/site/JsonLd';
import { getArticles, getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { formatDate } from '@/lib/site/format';
import { urls } from '@/lib/site/urls';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('medias');
}

export default async function MediasPage() {
  const [{ c }, articles, settings] = await Promise.all([getPageContent('medias'), getArticles(), getSettings()]);
  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Médias', path: urls.medias() }], settings.company.website)]} />
      <PageHero eyebrow={c.t('hero.eyebrow')} title={<Multiline text={c.t('hero.title')} />} text={c.t('hero.text')} image={c.t('hero.image')} imageAlt="Base de vie de chantier entretenue par ASPEO" />
      <section className="p-[clamp(48px,7vw,88px)_0] bg-[color:#f5f7fa]">
        <Container>
          <ArticlesGrid items={articles.map((a) => ({ href: a.href, title: a.title, category: a.category, date: formatDate(a.publishedAt), excerpt: a.excerpt, image: a.image, imageAlt: a.imageAlt }))} />
        </Container>
      </section>
    </main>
  );
}
