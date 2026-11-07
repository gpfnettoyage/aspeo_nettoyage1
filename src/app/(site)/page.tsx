import type { Metadata } from 'next';
import HomeHero from '@/components/site/home/HomeHero';
import HomeMissions from '@/components/site/home/HomeMissions';
import HomeEnvironment from '@/components/site/home/HomeEnvironment';
import HomeProcess from '@/components/site/home/HomeProcess';
import HomeWhy from '@/components/site/home/HomeWhy';
import HomeFeatured from '@/components/site/home/HomeFeatured';
import HomeZones from '@/components/site/home/HomeZones';
import HomeReviewsLogos from '@/components/site/home/HomeReviewsLogos';
import TestimonialWall from '@/components/site/shared/TestimonialWall';
import StatsCounters from '@/components/site/shared/StatsCounters';
import { CardSection } from '@/components/site/shared/CardGrid';
import { BarHeading, ButtonLink, Container, CtaBand } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getArticles, getPageContent, getPressArticles, getRealisations, getTestimonials } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { localBusiness } from '@/lib/site/jsonld';
import { urls } from '@/lib/site/urls';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('accueil');
}

export default async function HomePage() {
  const [{ c }, settings, testimonials, realisations, articles, press] = await Promise.all([
    getPageContent('accueil'), getSettings(), getTestimonials(), getRealisations(), getArticles(), getPressArticles(),
  ]);
  const { company, stats } = settings;
  const featuredSlug = c.t('featured.slug');
  const featured = (featuredSlug && realisations.find((r) => r.slug === featuredSlug)) || realisations.find((r) => r.featured) || realisations[0];

  return (
    <main data-home="">
      <JsonLd graph={[localBusiness(settings), { '@type': 'WebSite', '@id': `${company.website}/#site`, url: company.website, name: settings.seo.siteName, potentialAction: { '@type': 'SearchAction', target: `${company.website}/recherche?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }]} />
      <HomeHero c={c} phone={company.phone} phoneIntl={company.phoneIntl} />
      <HomeMissions c={c} />
      <HomeEnvironment c={c} />
      <HomeProcess c={c} />

      {testimonials.length > 0 && (
        <section className="p-[clamp(56px,8vw,104px)_0] bg-white">
          <Container>
            <BarHeading className="mb-[8px]">{c.t('testimonials.title')}</BarHeading>
            <p className="text-[length:1.05rem] leading-[1.7] text-[color:#4a5568] max-w-[640px] m-[0_0_6px]">{c.t('testimonials.text')}</p>
            <TestimonialWall items={testimonials.map((t) => ({ id: t.id, author: t.author, initials: t.initials, context: t.context, quote: t.quote }))} />
            <div className="mt-[40px]">
              <ButtonLink href={urls.reviews()} className="p-[15px_28px] text-[length:.96rem]">Voir tous les avis</ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <HomeWhy c={c} />
      {featured && <HomeFeatured eyebrow={c.t('featured.eyebrow')} r={featured} />}
      <HomeZones c={c} />

      <section className="p-[clamp(40px,6vw,72px)_0] bg-white">
        <Container>
          <CtaBand title={c.t('cta.title')} text={c.t('cta.text')} image={c.t('cta.image')} phone={company.phone} phoneIntl={company.phoneIntl} />
        </Container>
      </section>

      {stats.showCounters && (
        <StatsCounters stats={[
          { value: stats.clients, suffix: '+', label: stats.clientsLabel },
          { value: stats.satisfaction, suffix: '%', label: stats.satisfactionLabel },
          { value: stats.years, suffix: '+', label: stats.yearsLabel },
        ]} />
      )}

      <HomeReviewsLogos label={c.t('reviews.label')} rating={stats.googleRating} reviewCount={stats.googleReviewCount} reviewUrl={company.googleReviewUrl} logos={c.list('reviews.logos')} />

      <CardSection
        eyebrow={c.t('news.eyebrow')}
        title={c.t('news.title')}
        href={urls.medias()}
        linkLabel="Tous les articles"
        items={articles.slice(0, 3).map((a) => ({ href: a.href, title: a.title, image: a.image, imageAlt: a.imageAlt, badge: a.category ?? 'Actualité', date: a.publishedAt }))}
      />
      <CardSection
        tinted
        eyebrow={c.t('press.eyebrow')}
        title={c.t('press.title')}
        href={urls.press()}
        linkLabel="Toutes les parutions"
        items={press.slice(0, 3).map((p) => ({ href: urls.pressArticle(p.slug), title: p.title, image: p.image, imageAlt: p.imageAlt, badge: p.media ?? 'Presse', date: p.dateLabel ?? p.publishedAt }))}
      />
    </main>
  );
}
