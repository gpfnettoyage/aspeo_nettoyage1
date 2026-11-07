import HomePage from '@/components/home/Home';
import { COMPANY } from '@/constants/company';
import { SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';
import reviewsData from '@/data/reviews.json';
import { Metadata } from 'next';
import { pageOpenGraph } from '@/utils/seo';
import { getServices } from '@/lib/services';

// Descriptions optimisées pour le SEO (max 158 chars, pas de troncature)
const homeTitle = 'Nettoyage professionnel en Loire (42) & Rhône (69) | ASPEO';
const homeDescription =
  'ASPEO, entreprise de nettoyage en Loire et Rhône pour particuliers et pros. Bureaux, logements, remises en état. Devis gratuit, réponse rapide.';

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: {
    canonical: COMPANY.website,
  },
  openGraph: pageOpenGraph(homeTitle, homeDescription, '/'),
};

// Type pour les reviews avec rating
type Review = {
  id: number;
  nom: string;
  date: string;
  rating: number;
  commentaire: string;
};

export default async function Home() {
  const services = await getServices();

  const reviews = reviewsData.reviews as Review[];
  const reviewsCount = reviews.length;

  // Calcul dynamique de la moyenne des notes
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount;

  // Schéma WebPage pour la homepage
  const webPageSchema = {
    '@type': 'WebPage',
    '@id': `${COMPANY.website}/#webpage`,
    name: homeTitle,
    description: homeDescription,
    url: COMPANY.website,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    about: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${COMPANY.website}/img/logo/logo.png`,
    },
  };

  // Reviews individuels pour le schéma (limité aux 5 derniers)
  const reviewSchemas = reviews.slice(0, 5).map((review) => ({
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

  // AggregateRating avec note calculée dynamiquement
  const aggregateRatingSchema = {
    '@type': 'AggregateRating',
    '@id': `${COMPANY.website}/#aggregaterating`,
    itemReviewed: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
    ratingValue: Number(avgRating.toFixed(1)),
    reviewCount: reviewsCount,
    bestRating: 5,
    worstRating: 1,
  };

  return (
    <>
      <JsonLdScript
        id="json-ld-homepage"
        pageSchemas={[webPageSchema, aggregateRatingSchema, ...reviewSchemas]}
      />
      <HomePage services={services} />
    </>
  );
}
