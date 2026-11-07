import Services from '@/components/services/Services';
import { Metadata } from 'next';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';
import { pageOpenGraph } from '@/utils/seo';
import { generateFAQSchema } from '@/utils/structured-data';
import servicesFaqData from '@/data/services-faq.json';
import { getServices } from '@/lib/services';

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const servicesTitle = 'Services de nettoyage | ASPEO Loire (42) & Rhône (69)';
const servicesDescription =
  'Services ASPEO : nettoyage bureaux, logements, fin de chantier, désinfection et remise en état en Loire (42) et Rhône (69). Solutions sur mesure.';

export const metadata: Metadata = {
  title: servicesTitle,
  description: servicesDescription,
  alternates: {
    canonical: `${COMPANY.website}/proprete-services`,
  },
  openGraph: pageOpenGraph(servicesTitle, servicesDescription, '/proprete-services'),
};

const PropreteServicesPage = async () => {
  // Fetch services from database
  const services = await getServices();

  // Liste des services pour le OfferCatalog
  const serviceItems = services.map((service, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.descriptions[0],
        url: `${COMPANY.website}/proprete-services/${service.slug}`,
      },
    },
  }));

  const serviceSchema = {
    '@type': 'Service',
    '@id': `${COMPANY.website}/proprete-services/#service`,
    name: `Services de nettoyage ${COMPANY.name} Loire (42) & Rhône (69)`,
    description: metadata.description,
    serviceType: 'Nettoyage professionnel',
    provider: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
    areaServed: COMPANY.areaServed,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catalogue des services de nettoyage',
      itemListElement: serviceItems,
    },
  };

  const webPageSchema = {
    '@type': 'CollectionPage',
    '@id': `${COMPANY.website}/proprete-services/#webpage`,
    name: 'Services de nettoyage | ASPEO Loire (42) & Rhône (69)',
    description: metadata.description,
    url: `${COMPANY.website}/proprete-services`,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    about: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };

  const faqData = generateFAQSchema(servicesFaqData);
  const faqJsonLd = faqData ? (() => {
    const { '@context': _context, ...rest } = faqData as { '@context'?: string; [key: string]: unknown };
    return rest;
  })() : null;

  const pageSchemas = [
    webPageSchema,
    serviceSchema,
    faqJsonLd,
  ].filter((item): item is JsonLdObject => Boolean(item));

  return (
    <div className="py-12">
      <JsonLdScript
        id="json-ld-services"
        pageSchemas={pageSchemas}
      />
      <Services services={services} />
    </div>
  );
};

export default PropreteServicesPage;
