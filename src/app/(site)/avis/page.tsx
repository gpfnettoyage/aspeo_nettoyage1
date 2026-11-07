import AllReviews from '@/components/reviews/AllReviews';
import { Metadata } from 'next';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';
import reviewsData from '@/data/reviews.json';

// Type pour les reviews avec rating
type Review = {
  id: number;
  nom: string;
  date: string;
  rating: number;
  commentaire: string;
};

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const avisTitle = 'Avis Clients | ASPEO Nettoyage Loire & Rhône';
const avisDescription =
  "Témoignages clients ASPEO : découvrez les avis de nos clients satisfaits par nos services de nettoyage professionnel en Loire (42) et Rhône (69).";

export const metadata: Metadata = {
  title: avisTitle,
  description: avisDescription,
  alternates: {
    canonical: `${COMPANY.website}/avis`,
  },
  openGraph: pageOpenGraph(avisTitle, avisDescription, '/avis'),
};

const AvisPage = () => {
  const avisUrl = `${COMPANY.website}/avis`;
  const reviews = reviewsData.reviews as Review[];

  // Calcul de la moyenne des notes
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const reviewPageSchema = {
    '@type': 'WebPage',
    '@id': `${avisUrl}/#webpage`,
    name: `Avis Clients ${COMPANY.name}`,
    description: metadata.description,
    url: avisUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    about: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };

  // Reviews individuels visibles sur la page
  const reviewSchemas = reviews.map((review) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.nom,
    },
    datePublished: review.date,
    reviewBody: review.commentaire,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  }));

  // AggregateRating basé sur les vrais avis visibles sur cette page
  const aggregateRatingSchema = {
    '@type': 'AggregateRating',
    '@id': `${avisUrl}/#aggregaterating`,
    itemReviewed: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
    ratingValue: Number(avgRating.toFixed(1)),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };

  return (
    <div className="py-12">
      <JsonLdScript
        id="json-ld-reviews"
        pageSchemas={[reviewPageSchema, aggregateRatingSchema, ...reviewSchemas]}
      />
      <AllReviews />
    </div>
  );
};

export default AvisPage;
