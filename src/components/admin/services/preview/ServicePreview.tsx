'use client';

import React from 'react';
import Image from 'next/image';
import { CreateServiceInput } from '@/actions/services/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle,
  Phone,
  ArrowRight,
  Star,
  ShieldCheck,
  Zap,
  Clock,
  Building2,
  HelpCircle,
  FileText,
  Award,
  Users,
  MapPin,
  Heart,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { DEFAULT_HERO_BADGES, DEFAULT_CTA_SECTION } from '@/types/services';

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

interface ServicePreviewProps {
  data: CreateServiceInput;
}

/**
 * Live preview of the service page based on form data
 * Matches the order and structure of the public Service component
 */
export default function ServicePreview({ data }: ServicePreviewProps) {
  const { title, content } = data;
  const descriptions = content?.descriptions || [];
  const images = content?.images || [];
  const introText = content?.introText || descriptions[0] || '';
  const contextText = content?.contextText || '';
  const expertise = content?.expertise;
  const targetSpaces = content?.targetSpaces || [];
  const prestationsCategories = content?.prestationsCategories || [];
  const subServices = content?.subServices || [];
  const process = content?.process || [];
  const guarantees = content?.guarantees || [];
  const applicationSectors = content?.applicationSectors || [];
  const faq = content?.faq || [];
  const whyChoose = content?.whyChoose || [];

  // CTA
  const cta = content?.cta;
  const ctaText = cta?.text || 'Demander un devis gratuit';

  // Hero badges
  const heroBadges = content?.heroBadges || DEFAULT_HERO_BADGES;

  // CTA Section (final section)
  const ctaSection = content?.ctaSection;
  const ctaSectionTitle = ctaSection?.title || DEFAULT_CTA_SECTION.title;
  const ctaSectionSubtitle = ctaSection?.subtitle || DEFAULT_CTA_SECTION.subtitle;
  const ctaSectionBadges = ctaSection?.badges || DEFAULT_CTA_SECTION.badges;

  const heroImage = images[0] || '';

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Hero Section */}
      <section className="relative bg-white min-h-[300px] flex items-center overflow-hidden py-8">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gray-200">
          {heroImage && (
            <Image
              src={heroImage}
              alt={title || 'Service'}
              fill
              className="object-cover opacity-30"
            />
          )}
        </div>

        <div className="absolute inset-0 bg-white/75"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-white">
              <Star className="w-3 h-3 mr-1 text-primary" />
              Service Expert
            </Badge>

            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              {title || 'Titre du service'}
            </h1>

            <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">
              {introText || 'Description du service...'}
            </p>

            {/* Features badges - Dynamic */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {heroBadges.map((badge, index) => {
                const IconComponent = ICON_MAP[badge.icon] || CheckCircle;
                return (
                  <div key={index} className="flex items-center bg-white px-3 py-1.5 rounded-full border text-xs">
                    <IconComponent className="w-3 h-3 text-primary mr-1" />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons - uses custom CTA text */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="sm" className="group">
                {ctaText}
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="sm" variant="outline">
                <Phone className="mr-1 w-4 h-4" />
                Appeler
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections - ordered to match public page */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Context Text (after hero, before expertise) */}
        {contextText && (
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
              {contextText}
            </p>
          </div>
        )}

        {/* Expertise */}
        {expertise?.title && (
          <div className="bg-white rounded-xl p-6 border">
            <Badge variant="outline" className="mb-2">
              Expertise
            </Badge>
            <h2 className="text-xl font-bold mb-3">{expertise.title}</h2>
            {expertise.description && (
              <div className="text-gray-600 text-sm mb-4">
                {expertise.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            {expertise.highlights && expertise.highlights.length > 0 && (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {expertise.highlights.map((h, i) => (
                  <div key={i} className="flex items-start bg-gray-50 p-2 rounded">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{h}</span>
                  </div>
                ))}
              </div>
            )}
            {images[1] && (
              <div className="relative h-48 rounded-lg overflow-hidden mt-4">
                <Image
                  src={images[1]}
                  alt="Expertise"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Target Spaces */}
        {targetSpaces.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary" />
              Espaces concernés
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              {targetSpaces.map((space, i) => (
                <Badge key={i} variant="secondary" className="text-xs w-full sm:w-auto text-left justify-start whitespace-normal h-auto py-2">
                  {space}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Prestations */}
        {prestationsCategories.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Prestations Incluses
            </h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {prestationsCategories.map((cat, i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">{cat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 pb-3">
                    <ul className="space-y-1">
                      {cat.items?.map((item, j) => (
                        <li key={j} className="flex items-start text-xs text-gray-600">
                          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sub-services (before process, matching public page) */}
        {subServices.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Détails des services
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {subServices.map((service, i) => (
                <AccordionItem
                  key={i}
                  value={`sub-${i}`}
                  className="border rounded-lg bg-white"
                >
                  <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {service.name || 'Nom du sous-service'}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3 text-xs text-gray-600">
                    {service.description || 'Description...'}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Process */}
        {process.length > 0 && (
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Notre processus
            </h3>
            <div className="space-y-3">
              {process.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.step || i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {step.title || 'Étape'}
                      </h4>
                      {step.duration && (
                        <Badge variant="secondary" className="text-xs">
                          {step.duration}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guarantees */}
        {guarantees.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
              Vos Garanties
            </h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
              {guarantees.map((g, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded-lg border flex flex-col items-center text-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Sectors (after guarantees) */}
        {applicationSectors.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Secteurs d&apos;Application</h3>
            <div className="flex flex-wrap gap-3">
              {applicationSectors.map((sector, i) => (
                <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm bg-white border-gray-200 text-gray-700 max-w-full whitespace-normal text-left h-auto">
                  <FileText className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                  <span>{sector}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose */}
        {whyChoose.length > 0 && (
          <div className="bg-primary/5 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Pourquoi nous choisir ?</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                  {whyChoose.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-xs text-gray-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
              {images[2] && (
                <div className="flex-1 min-w-[200px]">
                  <div className="relative h-40 rounded-lg overflow-hidden">
                    <Image
                      src={images[2]}
                      alt="Pourquoi nous choisir"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-primary" />
              Questions Fréquentes
            </h3>
            <Accordion type="single" collapsible className="space-y-2">
              {faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border rounded-lg bg-white"
                >
                  <AccordionTrigger className="px-4 py-3 text-sm font-medium text-left hover:no-underline">
                    {item.question || 'Question ?'}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3 text-xs text-gray-600">
                    {item.answer || 'Réponse...'}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

      {/* CTA Section - Dynamic */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-3">
            {ctaSectionTitle}
          </h2>
          <p className="text-white/90 mb-6 text-sm">
            {ctaSectionSubtitle}
          </p>
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button size="sm" variant="secondary" className="group whitespace-nowrap">
              {ctaText}
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="sm" variant="outline" className="text-foreground whitespace-nowrap">
              <Phone className="mr-1 w-4 h-4" />
              Appeler
            </Button>
          </div>
          {/* CTA Section Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-xs">
            {ctaSectionBadges.map((badge, index) => {
              const IconComponent = ICON_MAP[badge.icon] || CheckCircle;
              return (
                <div key={index} className="flex items-center">
                  <IconComponent className="w-4 h-4 mr-1" />
                  <span>{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
