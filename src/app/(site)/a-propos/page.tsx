import About from '@/components/about/About';
import { Metadata } from 'next';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const aboutTitle = 'À propos – ASPEO, nettoyage en Loire & Rhône';
const aboutDescription =
  'Découvrez ASPEO, entreprise de nettoyage en Loire (42) et Rhône (69) pour particuliers et professionnels. Engagement, réactivité et qualité.';

export const metadata: Metadata = {
  title: aboutTitle,
  description: aboutDescription,
  alternates: {
    canonical: `${COMPANY.website}/a-propos`,
  },
  openGraph: pageOpenGraph(aboutTitle, aboutDescription, '/a-propos'),
};

const AboutPage = () => {
  const aboutUrl = `${COMPANY.website}/a-propos`;

  const aboutPageSchema = {
    '@type': 'AboutPage',
    '@id': `${aboutUrl}/#webpage`,
    name: aboutTitle,
    description: metadata.description,
    url: aboutUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    mainEntity: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };

  return (
    <div className="pt-12">
      <JsonLdScript id="json-ld-about" pageSchemas={[aboutPageSchema]} />
      <About />
    </div>
  );
};

export default AboutPage;
