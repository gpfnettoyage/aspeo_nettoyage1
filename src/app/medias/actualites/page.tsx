import { Metadata } from 'next';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import ActualitesList from '@/components/medias/ActualitesList';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, Phone, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getActualites } from '@/lib/actualites';
// SEO utilities removed - using optimized descriptions directly
import { formatDateForSchema } from '@/utils/structured-data';
import { COMPANY } from '@/constants/company';
import statsData from '@/data/stats.json';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';

// Descriptions optimisées pour le SEO (max 158 chars)
const actualitesTitle = 'Actualités & Tendances Nettoyage | ASPEO Loire & Rhône';
const actualitesDescription =
  "Restez informé des actualités d'ASPEO : innovations en nettoyage, engagements écologiques et vie de notre entreprise en Loire et Rhône.";

export const metadata: Metadata = {
  title: actualitesTitle,
  description: actualitesDescription,
  keywords: 'blog nettoyage, actualités propreté, innovation hygiène, entreprise nettoyage Lyon, recrutement propreté, tendances nettoyage 2026',
  alternates: {
    canonical: `${COMPANY.website}/medias/actualites`,
  },
  openGraph: {
    title: actualitesTitle,
    description: actualitesDescription,
    type: 'website',
    url: `${COMPANY.website}/medias/actualites`,
    siteName: COMPANY.name,
    locale: 'fr_FR',
    images: [
      {
        url: `${COMPANY.website}/img/logo/logo.png`,
        alt: `${COMPANY.name} - Actualités`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const ActualitesPage = async () => {
  const breadcrumbItems = [
    { label: 'Médias', href: '/medias' },
    { label: 'Actualités' }
  ];

  // Récupérer les actualités (déjà triées par date décroissante)
  const sortedActualites = await getActualites();

  const actualitesUrl = `${COMPANY.website}/medias/actualites`;

  const collectionPageJsonLd = {
    '@type': 'CollectionPage',
    '@id': `${actualitesUrl}/#webpage`,
    name: `Actualités ${COMPANY.name}`,
    description: actualitesDescription,
    url: actualitesUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    about: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };

  const itemListJsonLd = {
    '@type': 'ItemList',
    numberOfItems: sortedActualites.length,
    itemListElement: sortedActualites.map((actualite, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: actualite.title,
        description: actualite.excerpt,
        datePublished: formatDateForSchema(actualite.date),
        image: `${COMPANY.website}${actualite.image}`,
        url: `${COMPANY.website}/medias/actualites/${actualite.slug}`,
      },
    })),
  };

  const pageSchemas = [
    collectionPageJsonLd,
    itemListJsonLd as unknown as JsonLdObject,
  ] as JsonLdObject[];

  return (
    <div className="pt-12">
      <JsonLdScript id="json-ld-actualites" pageSchemas={pageSchemas} />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-white">
          {/* Breadcrumb - Top Left */}
          <div className="absolute top-6 left-6 z-10">
            <PageBreadcrumb items={breadcrumbItems} />
          </div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="mt-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Actualités <span className="text-primary">ASPEO</span> Propreté & Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Retrouvez ici toutes les actualités, projets et évolutions d&apos;Aspeo Propreté & Services, entreprise spécialisée dans les services de propreté pour les professionnels.
              </p>
            </div>

            <ActualitesList initialActualites={sortedActualites} />

            {/* L'Impact Aspeo en Chiffres Section */}
            <div className="">
              <div className="text-center mb-16 mt-24">
                <Badge variant="outline" className="mb-4 bg-background border-border">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  Performance & Croissance
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  L&apos;Impact Aspeo en <span className="text-primary">Chiffres</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Une croissance constante et un engagement qualité sans faille au service de nos clients.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center space-y-2 p-8 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-5xl font-bold text-foreground">
                    <NumberTicker value={statsData.clients.count} />
                    <span className="text-primary text-2xl ml-1">+</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{statsData.clients.label}</p>
                </div>

                <div className="text-center space-y-2 p-8 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-5xl font-bold text-foreground">
                    <NumberTicker value={statsData.satisfaction.rate} />
                    <span className="text-primary text-2xl ml-1">%</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{statsData.satisfaction.label}</p>
                </div>

                <div className="text-center space-y-2 p-8 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-5xl font-bold text-foreground">
                    <NumberTicker value={statsData.experience.years} />
                    <span className="text-primary text-2xl ml-1">+</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{statsData.experience.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à découvrir la différence Aspeo ?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez plus de {statsData.clients.count} clients qui nous font confiance pour maintenir
              leurs espaces dans un état parfait.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" variant="secondary" className="group" asChild>
                <Link href="/contact#contact-form" className="inline-flex items-center">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-foreground">
                <Link href={`tel:${COMPANY.phoneValue}`} className="inline-flex items-center">
                  <Phone className="mr-2 w-5 h-5" />
                  Nous appeler
                </Link>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-white/80">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Intervention en Loire et Rhône</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>Réponse sous {statsData.response.time} garantie</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                <span>Devis gratuit et sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default ActualitesPage;

