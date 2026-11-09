import type { Metadata } from 'next';
import ServiceView from '@/components/site/services/ServiceView';
import CategoryView from '@/components/site/services/CategoryView';
import JsonLd from '@/components/site/JsonLd';
import { getArticles, getCatalog, getCategory, getPageContent, getService, getTestimonials } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { buildMetadata } from '@/lib/site/seo';
import { breadcrumb, faqPage, serviceSchema } from '@/lib/site/jsonld';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { normalize } from '@/lib/site/search';
import { urls } from '@/lib/site/urls';
import type { ArticleSummary, ServiceDetail } from '@/lib/site/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const catalog = await getCatalog();
    return [...catalog.services.map((s) => ({ slug: s.slug })), ...catalog.categories.map((c) => ({ slug: c.slug }))];
  } catch {
    return [];
  }
}

/** Titre/description par défaut repris de la fonction applySEO de la maquette. */
function serviceSeo(s: ServiceDetail) {
  const title = s.seoTitle || `${s.title.length > 36 ? s.title : `${s.title} — Loire & Rhône`} | ASPEO`;
  const desc = s.seoDesc || `${(s.short || s.tagline || '').replace(/\.$/, '')}. Loire et Rhône, devis gratuit sous 24h après la visite.`.slice(0, 158);
  return { title, desc };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (service) {
    const { title, desc } = serviceSeo(service);
    return buildMetadata({ title, description: desc, path: urls.service(slug), image: service.image });
  }
  const category = await getCategory(slug);
  if (category) {
    return buildMetadata({
      title: category.seoTitle || `${category.name} | ASPEO`,
      description: category.seoDesc || category.content.subtitle || category.description || '',
      path: urls.category(slug),
      image: category.content.heroImage,
    });
  }
  return { title: 'Page introuvable | ASPEO', robots: { index: false } };
}

/** Articles liés : mots du titre du service présents dans l'article, sinon les plus récents. */
function relatedArticles(service: ServiceDetail, articles: ArticleSummary[]) {
  const words = normalize(service.title).split(/[^a-z0-9]+/).filter((w) => w.length > 4 && !['nettoyage', 'traitement'].includes(w));
  const scored = articles.map((a) => ({ a, s: words.filter((w) => normalize(`${a.title} ${a.excerpt ?? ''} ${a.category ?? ''}`).includes(w)).length }));
  return [...scored.filter((x) => x.s > 0).sort((x, y) => y.s - x.s), ...scored.filter((x) => x.s === 0)].slice(0, 2).map((x) => x.a);
}

export default async function ServiceOrCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getService(slug), getSettings()]);
  const base = settings.company.website;

  if (!service) {
    const category = await getCategory(slug);
    if (!category) return redirectOrNotFound(urls.service(slug));
    return (
      <>
        <JsonLd graph={[breadcrumb([{ name: 'Propreté & Services', path: urls.services() }, { name: category.name, path: category.href }], base)]} />
        <CategoryView category={category} />
      </>
    );
  }

  const [catalog, articles, testimonials, common] = await Promise.all([getCatalog(), getArticles(), getTestimonials(), getPageContent('blocs-communs')]);
  const others = catalog.services.filter((s) => s.slug !== slug);
  const related = [...others.filter((s) => s.categorySlug === service.categorySlug), ...others.filter((s) => s.categorySlug !== service.categorySlug)].slice(0, 4);
  const author = service.content.testimonialAuthor;
  const t = author ? testimonials.find((x) => x.author === author) : undefined;
  const { desc } = serviceSeo(service);

  return (
    <>
      <JsonLd graph={[
        serviceSchema(settings, { title: service.title, description: desc, path: service.href, image: service.image }),
        ...(service.content.faq?.length ? [faqPage(service.content.faq)] : []),
        breadcrumb([{ name: 'Propreté & Services', path: urls.services() }, ...(service.categorySlug && service.categoryName ? [{ name: service.categoryName, path: urls.category(service.categorySlug) }] : []), { name: service.title, path: service.href }], base),
      ]} />
      <ServiceView
        service={service}
        related={related}
        articles={relatedArticles(service, articles)}
        testimonial={t ? { quote: t.quote, author: t.author, context: t.context } : null}
        commitments={common.c.list('commitments').map((x) => ({ t: x.t ?? '', d: x.d ?? '' }))}
      />
    </>
  );
}
