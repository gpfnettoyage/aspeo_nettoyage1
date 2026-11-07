'use client';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Phone, ArrowRight, Zap, Star, Clock, MapPin, ShieldCheck, Building2, HelpCircle, FileText, Award, Users, Heart, Sparkles, LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import Sidebar from '@/components/common/Sidebar';
import { COMPANY } from '@/constants/company';
import { ServiceWithContent, DEFAULT_HERO_BADGES, DEFAULT_CTA_SECTION } from '@/types/services';

// Icon mapping for hero badges
const ICON_MAP: Record<string, LucideIcon> = {
  CheckCircle,
  ShieldCheck,
  Zap,
  Clock,
  Star,
  Award,
  Users,
  MapPin,
  Heart,
  Sparkles,
};

export interface ServiceProps {
  service: ServiceWithContent;
  relatedServices: ServiceWithContent[];
}

const Service: React.FC<ServiceProps> = ({ service, relatedServices }) => {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000 })
  );

  const breadcrumbItems = [
    { label: 'Propreté & Services', href: '/proprete-services' },
    { label: service.title }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Keep Full Width */}
      <section className="relative bg-white text-foreground min-h-[500px] lg:min-h-[600px] flex items-start md:items-center overflow-hidden py-16 md:py-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={service.images[0]}
            alt={service.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/75"></div>

        {/* Breadcrumb - Top Left (Visible on all) */}
        <div className="absolute left-4 top-6  z-20 md:block">
          <PageBreadcrumb items={breadcrumbItems} variant="hero" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 mt-20 md:mt-0">
          <div className="max-w-4xl mx-auto text-center">

            {/* Service Badge */}
            <Badge variant="outline" className="mb-4 sm:mb-6 bg-white border-gray-200 shadow-sm">
              <Star className="w-4 h-4 mr-2 text-primary" />
              Service Expert
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              {service.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed font-medium whitespace-pre-line">
              {service.introText || service.descriptions[0]}
            </p>

            {/* Features - Dynamic Hero Badges */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-4 mb-8">
              {(service.heroBadges || DEFAULT_HERO_BADGES).map((badge, index) => {
                const IconComponent = ICON_MAP[badge.icon] || CheckCircle;
                return (
                  <div key={index} className="flex items-center bg-white backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                    <IconComponent className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm font-semibold text-gray-800">{badge.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href={service.cta?.anchor || '/contact#contact-form'} className="inline-flex items-center">
                  {service.cta?.text || 'Demander un devis gratuit'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/80 hover:bg-white border-gray-300"
                asChild
              >
                <Link href={`tel:${COMPANY.phoneValue}`} className="inline-flex items-center">
                  <Phone className="mr-2 w-5 h-5" />
                  {COMPANY.phone}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sidebar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Context Text if available */}
            {service.contextText && (
               <div className="prose prose-lg max-w-none">
                 <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                   {service.contextText}
                 </p>
               </div>
            )}

            {/* Expertise Section */}
            {service.expertise && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="mb-8">
                  <Badge variant="outline" className="mb-3">Expertise</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {service.expertise.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="prose prose-lg max-w-none text-gray-600">
                    {service.expertise.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {service.expertise.highlights && service.expertise.highlights.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                      {service.expertise.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 font-medium text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {service.images[1] && (
                    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-md mt-6">
                      <Image
                        src={service.images[1]}
                        alt={`${service.title} - Expertise`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Spaces Section */}
            {service.targetSpaces && service.targetSpaces.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Building2 className="w-6 h-6 mr-3 text-primary" />
                  Espaces concernés
                </h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                  {service.targetSpaces.map((space, index) => (
                    <Badge key={index} variant="secondary" className="px-4 py-2.5 text-sm bg-white hover:bg-white shadow-sm border border-gray-100 text-gray-700 w-full sm:w-auto text-left justify-start whitespace-normal h-auto">
                      {space}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Prestations Categories Section */}
            {service.prestationsCategories && service.prestationsCategories.length > 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3 text-primary" />
                    Prestations Incluses
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {service.prestationsCategories.map((category, index) => (
                    <Card key={index} className="bg-white shadow-sm border hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-gray-900">
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2 flex-shrink-0"></span>
                              <span className="text-gray-600 text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

             {/* Service Details Section */}
             {service.subServices && service.subServices.length > 0 && (
              <div>
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 mr-3 text-primary" />
                    Détails des services
                 </h2>

                 <Accordion type="single" collapsible className="w-full space-y-4">
                  {service.subServices.map((serviceDetail, index) => (
                    <AccordionItem
                      key={index}
                      value={`service-detail-${index}`}
                      className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">{serviceDetail.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-2">
                        <div className="pl-12">
                          <p className="text-gray-600 text-sm leading-relaxed">{serviceDetail.description}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                 </Accordion>
              </div>
            )}

            {/* Process Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center relative z-10">
                  <Clock className="w-6 h-6 mr-3 text-primary" />
                  Notre processus
               </h3>
               <div className="space-y-0 relative z-10">
                {(service.process || [
                  { step: 1, title: 'Diagnostic', description: 'Évaluation de vos besoins spécifiques', duration: '1h' },
                  { step: 2, title: 'Planification', description: 'Plan d\'intervention personnalisé', duration: '2-3 jours' },
                  { step: 3, title: 'Exécution', description: 'Intervention avec équipements pros', duration: 'Variable' },
                  { step: 4, title: 'Contrôle', description: 'Vérification qualité et suivi', duration: 'Continu' }
                ]).map((step, index, arr) => (
                  <div key={index} className="flex relative pb-8 last:pb-0">
                    {/* Timeline Line */}
                    {index !== arr.length - 1 && (
                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200 -ml-px"></div>
                    )}

                    <div className="flex-shrink-0 mr-6 relative">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-white z-10 relative">
                        {step.step}
                      </div>
                    </div>

                    <div className="pt-1 flex-grow">
                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
                            {step.duration && (
                                <Badge variant="secondary" className="bg-white border-gray-200 text-gray-600 shadow-sm w-fit">
                                <Clock className="w-3 h-3 mr-1" />
                                {step.duration}
                                </Badge>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
               </div>
            </div>

            {/* Guarantees Section */}
            {service.guarantees && service.guarantees.length > 0 && (
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
                  Vos Garanties
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {service.guarantees.map((guarantee, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center gap-3 hover:shadow-md transition-shadow">
                      <CheckCircle className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium text-gray-700">{guarantee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Sectors Section */}
            {service.applicationSectors && service.applicationSectors.length > 0 && (
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Secteurs d&apos;Application</h3>
                <div className="flex flex-wrap gap-3">
                  {service.applicationSectors.map((sector, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1.5 text-sm bg-white border-gray-200 text-gray-700 max-w-full whitespace-normal text-left h-auto">
                      <FileText className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{sector}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Why Choose Section */}
            {service.whyChoose && service.whyChoose.length > 0 && (
              <div className="bg-primary/5 rounded-2xl p-6 sm:p-8">
                <div className={`grid gap-8 ${service.images[2] ? 'lg:grid-cols-2 items-center' : ''}`}>
                   <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                        Pourquoi nous choisir ?
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                        {service.whyChoose.map((reason, index) => (
                            <div key={index} className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-gray-700 text-sm font-medium">{reason}</p>
                            </div>
                        ))}
                        </div>
                   </div>
                   {service.images[2] && (
                        <div className="relative h-[250px] lg:h-[300px] rounded-xl overflow-hidden shadow-md">
                             <Image
                                src={service.images[2]}
                                alt={`${service.title} - Pourquoi nous choisir`}
                                fill
                                className="object-cover"
                             />
                        </div>
                   )}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {service.faq && service.faq.length > 0 && (
              <div>
                <div className="mb-6">
                   <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <HelpCircle className="w-6 h-6 mr-3 text-primary" />
                      Questions Fréquentes
                   </h3>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {service.faq.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                    >
                      <AccordionTrigger className="px-6 py-4 text-left font-semibold text-gray-900 hover:text-primary hover:no-underline">
                        <span className="text-base">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {faq.answer}
                          </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Vous ne trouvez pas votre réponse ?</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Contactez-nous directement pour une réponse personnalisée
                      </p>
                    </div>
                    <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90" asChild>
                      <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center justify-center">
                        Nous contacter
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
             <Sidebar currentServiceSlug={service.slug} services={relatedServices} />
          </div>

        </div>
      </div>

      {/* Related Services Carousel - Full Width Bottom */}
      {relatedServices.length > 0 && (
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                <Star className="w-4 h-4 mr-2 text-primary" />
                Plus de services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ces services pourraient vous intéresser
              </h2>
            </div>

            <Carousel
              className="w-full max-w-6xl mx-auto"
              plugins={[autoplayPlugin.current]}
            >
              <CarouselContent className="-ml-4">
                {relatedServices.map((relatedService) => (
                  <CarouselItem key={relatedService.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-[28.57%]">
                    <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm overflow-hidden">
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={relatedService.images[0]}
                          alt={relatedService.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader className="pb-4 flex-grow">
                        <CardTitle className="text-xl mb-3">{relatedService.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-3">
                          {relatedService.descriptions[0]}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/proprete-services/${relatedService.slug}`}>
                            En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden xl:flex -left-12" />
              <CarouselNext className="hidden xl:flex -right-12" />
            </Carousel>
          </div>
        </section>
      )}

      {/* CTA Section - Dynamic */}
       <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {service.ctaSection?.title || DEFAULT_CTA_SECTION.title}
            </h2>
            <p className="text-xl mb-8 text-white/90">
              {service.ctaSection?.subtitle || DEFAULT_CTA_SECTION.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" variant="secondary" className="group" asChild>
                <Link href={service.cta?.anchor || '/contact#contact-form'} className="inline-flex items-center">
                  {service.cta?.text || 'Demander un devis gratuit'}
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

            {/* CTA Section Badges - Dynamic */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-white/80">
              {(service.ctaSection?.badges || DEFAULT_CTA_SECTION.badges).map((badge, index) => {
                const IconComponent = ICON_MAP[badge.icon] || CheckCircle;
                return (
                  <div key={index} className="flex items-center">
                    <IconComponent className="w-5 h-5 mr-2" />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Service;
