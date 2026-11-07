import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import Image from 'next/image';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import MediasList from '@/components/medias/MediasList';
// import PresseList from '@/components/medias/PresseList';
import { ArrowRight, Phone, Newspaper, MapPin, ShieldCheck, Clock, Leaf, Users, CheckCircle, Star } from 'lucide-react';
import { getActualites } from '@/lib/actualites';
// SEO utilities removed - using optimized descriptions directly
// import presseData from '@/data/presse.json';
// import { getFileSize } from '@/utils/fileSize';
import { COMPANY } from '@/constants/company';
import statsData from '@/data/stats.json';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';

// Descriptions optimisées pour le SEO (max 158 chars)
const mediasTitle = 'Médias & Actualités | ASPEO Nettoyage Loire & Rhône';
const mediasDescription =
  "Suivez l'actualité d'ASPEO : innovations, certifications et développements dans le nettoyage professionnel éco-responsable en Loire et Rhône.";

export const metadata: Metadata = {
  title: mediasTitle,
  description: mediasDescription,
  keywords: 'actualités nettoyage, innovation propreté, nettoyage éco-responsable, services hygiène Loire et Rhône',
  alternates: {
    canonical: `${COMPANY.website}/medias`,
  },
  openGraph: {
    title: mediasTitle,
    description: mediasDescription,
    type: 'website',
    url: `${COMPANY.website}/medias`,
    siteName: COMPANY.name,
    locale: 'fr_FR',
    images: [
      {
        url: `${COMPANY.website}/img/logo/logo.png`,
        alt: `${COMPANY.name} - Médias`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const MediasPage = async () => {
  const breadcrumbItems = [
    { label: 'Médias' }
  ];

  const actualites = await getActualites();

  // Trier les documents de presse par date décroissante et ajouter la taille des fichiers
  // const sortedPresse = [...presseData]
  //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //   .map((presse) => ({
  //     ...presse,
  //     fileSize: getFileSize(presse.pdfUrl),
  //   }));

  const mediasUrl = `${COMPANY.website}/medias`;

  const mediasJsonLd = {
    '@type': 'CollectionPage',
    '@id': `${mediasUrl}/#webpage`,
    name: `Médias ${COMPANY.name}`,
    description: mediasDescription,
    url: mediasUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
    about: {
      '@id': SCHEMA_IDS.BUSINESS,
    },
  };

  const faqItems = [
    {
      question: "Quels types de secteurs d'activité couvrez-vous ?",
      answer: "Aspeo intervient dans de nombreux secteurs : bureaux tertiaires, commerces, industries, milieu hospitalier, hôtellerie, transports et événementiel. Nous adaptons nos protocoles sanitaires aux exigences spécifiques de chaque domaine."
    },
    {
      question: "Où intervient Aspeo précisément ?",
      answer: "Notre zone d'intervention principale recouvre les départements de la Loire (42) et du Rhône (69) afin d'assurer une grande réactivité."
    },
    {
      question: "Quels sont vos engagements écologiques ?",
      answer: "Nous privilégions l'utilisation de produits certifiés Écolabel et de techniques réduisant la consommation d'eau et de produits chimiques. Notre objectif est de garantir un environnement sain pour vos équipes tout en préservant la nature."
    },
    {
      question: "Quelle est votre zone d'intervention principale ?",
      answer: "ASPEO concentre ses interventions sur la région Auvergne-Rhône-Alpes, et plus spécifiquement dans la Loire (42) et le Rhône (69), afin de maintenir une relation de proximité et une réactivité optimale avec ses clients."
    },
    {
      question: "Proposez-vous des services d'urgence ?",
      answer: `Absolument. Nous comprenons les impératifs de nos clients et proposons des interventions d'urgence ${statsData.emergency.availability} pour les sinistres, les besoins sanitaires immédiats ou les situations imprévues.`
    }
  ];

  const faqJsonLd = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  const pageSchemas = [
    mediasJsonLd,
    faqJsonLd,
  ] as JsonLdObject[];

  return (
    <div className="pt-12">
      <JsonLdScript id="json-ld-medias-faq" pageSchemas={pageSchemas} />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-white">
          {/* Breadcrumb - Top Left */}
          <div className="absolute top-6 left-6 z-10">
            <PageBreadcrumb items={breadcrumbItems} />
          </div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="mt-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Actualités et Presse <span className="text-primary">Aspeo</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Suivez notre actualité : innovations, partenariats, certifications et développements de l&apos;entreprise.
              </p>

              {/* Boutons de navigation */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/medias/actualites" className="inline-flex items-center">
                    <Newspaper className="mr-2 w-5 h-5" />
                    Toutes les actualités
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                {/* <Button size="lg" variant="outline" asChild>
                  <Link href="/medias/presse" className="inline-flex items-center">
                    <FileText className="mr-2 w-5 h-5" />
                    Dossiers de presse
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button> */}
              </div>
            </div>

            {/* Section Actualités - Masquée s'il n'y a pas d'actualités */}
            {actualites.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Nos dernières <span className="text-primary">Actualités</span>
                </h2>
                <p className="text-muted-foreground">
                  Suivez les dernières nouvelles et développements d&apos;Aspeo
                </p>
              </div>
            )}

            {/* Liste des actualités avec recherche et filtres */}
            <MediasList initialActualites={actualites} />

            {/* Section Documents de Presse */}
            {/* <div className="mt-24 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Documents de <span className="text-primary">Presse</span>
              </h2>
              <p className="text-muted-foreground">
                Téléchargez nos communiqués et dossiers de presse
              </p>
            </div> */}

            {/* Liste des documents de presse */}
            {/* <PresseList initialPresse={sortedPresse} /> */}

            {/* Nos Valeurs & Engagements Section */}
            <div className="mt-24 mb-24">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-4 bg-background border-border">
                  <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                  L&apos;ADN Aspeo
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Nos Valeurs & <span className="text-primary">Engagements</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Plus qu&apos;une entreprise de nettoyage, Aspeo est un partenaire engagé pour la propreté, la santé et l&apos;environnement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-card rounded-full mx-auto mb-6 flex items-center justify-center border border-border shadow-sm">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-primary mb-4 text-xl">Excellence & Rigueur</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Nous appliquons des protocoles de nettoyage stricts et innovants pour garantir un résultat irréprochable et une hygiène parfaite dans tous vos espaces.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-card rounded-full mx-auto mb-6 flex items-center justify-center border border-border shadow-sm">
                      <Leaf className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-primary mb-4 text-xl">Engagement Éco-responsable</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      L&apos;utilisation de produits écolabel et de techniques durables est au cœur de notre démarche pour protéger la santé de vos collaborateurs et la planète.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-card rounded-full mx-auto mb-6 flex items-center justify-center border border-border shadow-sm">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-primary mb-4 text-xl">Proximité & Écoute</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Présents en Loire et Rhône, nous privilégions une relation de confiance et une réactivité totale pour répondre à vos besoins spécifiques.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section Expertise Sectorielle (SEO) */}
            <div className="mb-24">
               <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="relative rounded-3xl overflow-hidden h-96">
                    <Image
                      src="/img/home/aspeo-proprete_1.webp"
                      alt="Expertise Aspeo Propreté"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-6">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Nos Domaines d&apos;Expertise</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">Un Savoir-faire au service des <span className="text-primary">Professionnels</span></h2>
                    <p className="text-muted-foreground">
                      Depuis plus de {statsData.experience.years} ans, Aspeo accompagne les entreprises et collectivités dans le maintien de standards d&apos;hygiène élevés. Notre approche combine innovation technologique et respect de l&apos;environnement.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Bureaux & Tertiaire</span>
                       </li>
                       <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Santé & Hygiène</span>
                       </li>
                       <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Industrie & Logistique</span>
                       </li>
                       <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Hôtellerie & Restauration</span>
                       </li>
                    </ul>
                    <Button asChild>
                       <Link href="/proprete-services">Découvrir nos services</Link>
                    </Button>
                  </div>
               </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-24 mb-12">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" />
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs sm:text-sm">
                    FAQ
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  Questions <span className="text-primary">Fréquentes</span>
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                  Trouvez rapidement les réponses à vos questions sur nos services et notre expertise.
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
                {[
                  {
                    id: 1,
                    question: "Quels types de secteurs d'activité couvrez-vous ?",
                    answer: "Aspeo intervient dans de nombreux secteurs : bureaux tertiaires, commerces, industries, milieu hospitalier, hôtellerie, transports et événementiel. Nous adaptons nos protocoles sanitaires aux exigences spécifiques de chaque domaine."
                  },
                  {
                    id: 2,
                    question: "Où intervient Aspeo précisément ?",
                    answer: "Notre zone d'intervention principale recouvre les départements de la Loire (42) et du Rhône (69) afin d'assurer une grande réactivité."
                  },
                  {
                    id: 3,
                    question: "Quels sont vos engagements écologiques ?",
                    answer: "Nous privilégions l'utilisation de produits certifiés Écolabel et de techniques réduisant la consommation d'eau et de produits chimiques. Notre objectif est de garantir un environnement sain pour vos équipes tout en préservant la nature."
                  },
                  {
                    id: 4,
                    question: "Quelle est votre zone d'intervention principale ?",
                    answer: "ASPEO concentre ses interventions sur la région Auvergne-Rhône-Alpes, et plus spécifiquement dans la Loire (42) et le Rhône (69), afin de maintenir une relation de proximité et une réactivité optimale avec ses clients."
                  },
                  {
                    id: 5,
                    question: "Proposez-vous des services d'urgence ?",
                    answer: `Absolument. Nous comprenons les impératifs de nos clients et proposons des interventions d'urgence ${statsData.emergency.availability} pour les sinistres, les besoins sanitaires immédiats ou les situations imprévues.`
                  }
                ].map((faq, index) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={`item-${faq.id}`}
                    className="border border-primary/10 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left font-semibold text-foreground hover:text-primary transition-colors hover:no-underline">
                      <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg leading-tight flex-1">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
                      <div className="pl-8 sm:pl-11">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Vous ne trouvez pas votre réponse ?</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Contactez-nous directement pour une réponse personnalisée
                    </p>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90" asChild>
                    <Link href="/contact#contact-form" className="inline-flex items-center justify-center">
                      Nous contacter
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </Link>
                  </Button>
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

export default MediasPage;

