import Contact from '@/components/contact/Contact';
import { Metadata } from 'next';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';
import { generateFAQSchema } from '@/utils/structured-data';
import contactFaqData from '@/data/contact-faq.json';

// Descriptions optimisées pour le SEO (max 158 chars)
const contactTitle = 'Contactez-nous | ASPEO Nettoyage Loire & Rhône';
const contactDescription =
  'Contactez ASPEO pour un devis gratuit. Nettoyage professionnel en Loire (42) et Rhône (69). Réponse rapide garantie pour tous vos projets.';

export const metadata: Metadata = {
  title: contactTitle,
  description: contactDescription,
  alternates: {
    canonical: `${COMPANY.website}/contact`,
  },
  openGraph: pageOpenGraph(contactTitle, contactDescription, '/contact'),
};

const ContactPage = () => {
  const contactUrl = `${COMPANY.website}/contact`;

  const contactPageJsonLd = {
    '@type': 'ContactPage',
    '@id': `${contactUrl}/#webpage`,
    name: `Contactez ${COMPANY.name}`,
    description: metadata.description,
    url: contactUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    mainEntity: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };

  const faqData = generateFAQSchema(contactFaqData);
  // Supprimer le @context du FAQ car il est au niveau @graph
  const faqJsonLd = faqData
    ? (() => {
        const { '@context': _context, ...rest } = faqData as {
          '@context'?: string;
          [key: string]: unknown;
        };
        return rest;
      })()
    : null;

  const pageSchemas = [contactPageJsonLd, faqJsonLd].filter(
    (item): item is JsonLdObject => Boolean(item),
  );

  return (
    <div className="py-12">
      <JsonLdScript id="json-ld-contact" pageSchemas={pageSchemas} />
      <Contact />
    </div>
  );
};

export default ContactPage;
