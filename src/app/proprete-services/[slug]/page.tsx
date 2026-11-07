import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSEOTitle, truncateMetaDescription, truncateSeoTitle } from '@/utils/seo';
import Service from '@/components/services/Service';
import { COMPANY } from '@/constants/company';
import { generateFAQSchema } from '@/utils/structured-data';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';
import { getServiceBySlug, getServices } from '@/lib/services';

export interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ServicePageProps
): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: 'Service non trouvé',
      description: "Aucun service trouvé pour l'URL donnée",
    };
  }

  const serviceUrl = `${COMPANY.website}/proprete-services/${slug}`;

  // Use SEO fields if available, otherwise fallback to service data
  const seoTitle = truncateSeoTitle(
    service.seoTitle || generateSEOTitle(service.title)
  );
  const seoDescription = truncateMetaDescription(
    service.seoDesc || service.descriptions[0]
  );

  // Utiliser les images du service si disponibles, sinon le logo en fallback
  const ogImages = service.images && service.images.length > 0
    ? service.images.map((img) => `${COMPANY.website}${img}`)
    : [`${COMPANY.website}/img/logo/logo.png`];

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `${COMPANY.website}/proprete-services/${slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      url: serviceUrl,
      images: ogImages,
    },
  };
}

const ServicePage = async ({ params }: ServicePageProps) => {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Get related services (excluding current one)
  const allServices = await getServices();
  const relatedServices = allServices.filter(s => s.slug !== slug);

  const serviceUrl = `${COMPANY.website}/proprete-services/${slug}`;

  // Image du service
  const serviceImage = service.images && service.images.length > 0
    ? service.images.map((img) => `${COMPANY.website}${img}`)
    : [`${COMPANY.website}/img/logo/logo.png`];

  // Schéma WebPage pour cette page de service
  const webPageJsonLd = {
    '@type': 'WebPage',
    '@id': `${serviceUrl}/#webpage`,
    name: service.title,
    description: service.seoDesc || service.descriptions[0],
    url: serviceUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
  };

  // Schéma Service avec référence au provider via @id
  const serviceJsonLd = {
    '@type': 'Service',
    '@id': `${serviceUrl}/#service`,
    name: service.title,
    description: service.seoDesc || service.descriptions[0],
    serviceType: service.category?.name || 'Nettoyage professionnel',
    provider: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
    areaServed: COMPANY.areaServed,
    image: serviceImage,
    url: serviceUrl,
  };

  // Schema markup FAQ pour Google (si FAQ présente)
  const faqData = generateFAQSchema(service.faq || []);
  // Supprimer le @context du FAQ car il est au niveau @graph
  const faqJsonLd = faqData ? (() => {
    const { '@context': _context, ...rest } = faqData as { '@context'?: string; [key: string]: unknown };
    return rest;
  })() : null;

  // Préparation des schémas pour JsonLdScript
  const pageSchemas = [
    webPageJsonLd,
    serviceJsonLd,
    faqJsonLd,
  ].filter((item): item is JsonLdObject => Boolean(item));

  return (
    <div className="pt-12">
      <JsonLdScript id="json-ld-service-faq" pageSchemas={pageSchemas} />
      <Service service={service} relatedServices={relatedServices} />
    </div>
  );
};

export default ServicePage;
