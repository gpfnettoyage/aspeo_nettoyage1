import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Mail, Facebook, Twitter, Linkedin, HelpCircle, ArrowRight } from 'lucide-react';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import Sidebar from '@/components/common/Sidebar';
import { getActualites, getActualiteBySlug } from '@/lib/actualites';
import { generateSEOTitle, truncateMetaDescription } from '@/utils/seo';
import { generateArticleSchema, generateFAQSchema } from '@/utils/structured-data';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SCHEMA_IDS } from '@/types/jsonld';
import JsonLdScript from '@/components/common/JsonLdScript';

export interface ActualiteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ActualiteProps): Promise<Metadata> {
  const { slug } = await params;
  const actualite = await getActualiteBySlug(slug);

  if (!actualite) {
    return {
      title: 'Actualité non trouvée',
    };
  }

  const articleUrl = `${COMPANY.website}/medias/actualites/${slug}`;

  // Utiliser l'image de l'actualité si disponible, sinon le logo en fallback
  const ogImage = actualite.image
    ? `${COMPANY.website}${actualite.image}`
    : `${COMPANY.website}/img/logo/logo.png`;

  const articleTitle = generateSEOTitle(actualite.title);
  const articleDescription = truncateMetaDescription(actualite.excerpt);

  return {
    title: articleTitle,
    description: articleDescription,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: articleTitle,
      description: articleDescription,
      type: 'article',
      url: articleUrl,
      siteName: COMPANY.name,
      locale: 'fr_FR',
      publishedTime: actualite.date,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const actualites = await getActualites();
  return actualites.map((actualite) => ({
    slug: actualite.slug,
  }));
}

const ActualitePage = async ({ params }: ActualiteProps) => {
  const { slug } = await params;
  const actualite = await getActualiteBySlug(slug);

  if (!actualite) {
    notFound();
  }

  // Charger dynamiquement le composant MDX
  const { default: MDXContent } = await import(`@/content/actualites/${slug}.mdx`);

  const breadcrumbItems = [
    { label: 'Médias', href: '/medias' },
    { label: 'Actualités', href: '/medias/actualites' },
    { label: actualite.title }
  ];

  // Auteur : "Équipe Aspeo" partout (cohérent avec le JSON-LD)
  const authorName = `Équipe ${COMPANY.name}`;

  const articleUrl = `${COMPANY.website}/medias/actualites/${actualite.slug}`;

  // Schema markup Article (déjà sans @context)
  const articleJsonLd = generateArticleSchema({
    headline: actualite.title,
    description: actualite.excerpt,
    image: actualite.image,
    datePublished: actualite.date,
    dateModified: actualite.dateModified || actualite.date,
    url: articleUrl,
    authorName: authorName,
    authorUrl: COMPANY.website,
  });

  // WebPage schema pour cette page d'article
  const webPageJsonLd = {
    '@type': 'WebPage',
    '@id': `${articleUrl}/#webpage`,
    name: actualite.title,
    description: actualite.excerpt,
    url: articleUrl,
    isPartOf: {
      '@id': SCHEMA_IDS.WEBSITE,
    },
  };

  // Schema markup FAQ pour Google (si FAQ présente, déjà sans @context)
  const faqJsonLd = generateFAQSchema(actualite.faq || []);

  // Auteur pour l'affichage
  const author = {
    name: authorName,
    role: authorName,
    initials: 'EA'
  };

  // Tags de l'article
  const tags = actualite.tags || ['Actualité', 'Aspeo'];

  // URL de partage
  const shareUrl = `${COMPANY.website}/medias/actualites/${actualite.slug}`;

  // Préparation des schémas pour JsonLdScript
  const pageSchemas = [
    webPageJsonLd,
    articleJsonLd,
    faqJsonLd,
  ].filter((item): item is JsonLdObject => Boolean(item));

  return (
    <div className="pt-12">
      <JsonLdScript id="json-ld-actualite-faq" pageSchemas={pageSchemas} />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
          {/* Breadcrumb - Top Left */}
          <div className="absolute top-4 left-2 sm:top-5 sm:left-3 md:top-6 md:left-4 z-10 max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-1.5rem)] md:max-w-[calc(100%-2rem)] lg:max-w-none">
            <PageBreadcrumb items={breadcrumbItems} />
          </div>

        <div className="container mx-auto px-4 md:px-6">
          <div>
            {/* Grille contenu + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2">
                <article>
                  {/* Catégorie */}
                  {actualite.category && (
                    <Badge variant="default" className="mb-4">
                      {actualite.category}
                    </Badge>
                  )}

                  {/* Titre */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-5 text-foreground leading-tight">
                    {actualite.title}
                  </h1>

                  {/* Métadonnées */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>
                        {new Date(actualite.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{author.name}</span>
                    </div>
                  </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-8">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Excerpt */}
                <div className="prose prose-sm sm:prose-base max-w-none mb-4 sm:mb-6">
                  <p className="text-[13px] sm:text-[15px] md:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                    {actualite.excerpt}
                  </p>
                </div>

                {/* Contenu MDX */}
                <div className="prose prose-sm sm:prose-base max-w-none mb-4 sm:mb-6">
                  <MDXContent />
                </div>

                {/* FAQ Section - Optionnelle */}
                {actualite.faq && actualite.faq.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Questions fréquentes</h3>
                      </div>
                      <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
                        {actualite.faq.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-primary/10 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm"
                          >
                            <AccordionTrigger className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left font-semibold text-foreground hover:text-primary transition-colors hover:no-underline">
                              <div className="flex items-center space-x-2 sm:space-x-2.5 w-full">
                                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full text-primary font-bold text-[10px] sm:text-xs flex-shrink-0">
                                  {index + 1}
                                </div>
                                <span className="text-xs sm:text-sm md:text-base leading-tight flex-1">{item.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 sm:px-4 md:px-5 pb-2.5 sm:pb-3">
                              <div className="pl-7 sm:pl-8">
                                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </>
                )}

                {/* CTA Section - Optionnelle */}
                {actualite.cta && (
                  <>
                    <Separator className="my-8" />
                    <Card className="mb-8 border-primary bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-2xl">{actualite.cta.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {actualite.cta.description}
                        </p>
                        <Button asChild size="lg" className="group">
                          <Link href={actualite.cta.buttonLink}>
                            {actualite.cta.buttonText}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                <Separator className="my-8" />

                {/* Partage social */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Partager cet article</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(actualite.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4 text-sky-500" />
                        Twitter
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <a
                        href={`mailto:?subject=${encodeURIComponent(actualite.title)}&body=${encodeURIComponent(shareUrl)}`}
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Sidebar hideRelatedServices={true} />
            </aside>
          </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default ActualitePage;
