'use client';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContactForm from './ContactForm';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
} from 'lucide-react';
import contactFaqData from '@/data/contact-faq.json';
import zonesData from '@/data/zones.json';
import statsData from '@/data/stats.json';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { COMPANY } from '@/constants/company';

const Contact = () => {
  const breadcrumbItems = [{ label: 'Contact' }];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-white text-foreground h-[500px] sm:h-[500px] lg:h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/img/contact/bureaux-aspeo.webp"
            alt="Bureaux Aspeo"
            fill
            className="object-cover"
            priority={true}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/70"></div>

        {/* Breadcrumb - Top Left */}
        <div className="absolute top-6 left-6 z-10">
          <PageBreadcrumb items={breadcrumbItems} variant="hero" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Header Badge */}
          {/* <div className="flex items-center justify-center mb-6">
            <Badge variant="secondary">
              Service Premium
            </Badge>
          </div> */}

          {/* Main Title */}
          <div className="text-center mb-2 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-6 leading-tight">
              Contactez-nous dès aujourd&apos;hui pour obtenir votre{' '}
              <span className="text-primary">devis gratuit</span> !
            </h1>

            <p className="text-sm sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Chez Aspeo, nous sommes dédiés à fournir des services
              exceptionnels pour garantir un environnement propre et sain.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-4 md:gap-8 mb-2 sm:mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm text-foreground">
                Devis gratuit sous {statsData.response.time}
              </span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm text-foreground">
                Qualité contrôlée
              </span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm text-foreground">
                Intervention rapide
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base group"
              asChild
            >
              <a href="#contact-form">
                Demander un devis gratuit
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base"
              asChild
            >
              <a href={`tel:${COMPANY.phoneValue}`}>
                <Phone className="w-4 h-4 mr-2" />
                {COMPANY.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20" id="contact-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:items-center">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        Demande de Devis Gratuit
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Remplissez ce formulaire et recevez votre devis
                        personnalisé sous {statsData.response.time}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Cards */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Nous contacter
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Téléphone
                          </p>
                          <a
                            href={`tel:${COMPANY.phoneValue}`}
                            className="text-primary font-semibold hover:text-primary/80 transition-colors"
                          >
                            {COMPANY.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${COMPANY.email}`}
                            className="text-primary font-semibold hover:text-primary/80 transition-colors"
                          >
                            {COMPANY.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Notre adresse
                    </h3>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                    <p className="text-foreground font-medium">
                      {COMPANY.address.street}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {COMPANY.address.zipCode} {COMPANY.address.city}, France
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Nos horaires
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-foreground font-medium">
                        Lundi - Jeudi
                      </span>
                      <span className="text-blue-800 text-sm font-medium">
                        {COMPANY.hours.week}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-foreground font-medium">
                        Vendredi
                      </span>
                      <span className="text-blue-800 text-sm font-medium">
                        {COMPANY.hours.friday}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-foreground font-medium">
                        Samedi - Dimanche
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-700 text-white shadow-sm dark:bg-red-900 dark:text-red-100">
                        {COMPANY.hours.weekend}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Cards Below All Content */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {/* CTA Card */}
            <Card className="bg-primary text-primary-foreground shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary-foreground/20 rounded-lg mr-3">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    Besoin d&apos;une réponse immédiate ?
                  </h3>
                </div>

                <p className="text-primary-foreground/90 text-sm mb-4 leading-relaxed">
                  Appelez-nous directement pour un devis express ou une
                  intervention d&apos;urgence.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary-foreground/80 mr-2" />
                    <span>Devis express sous 2h</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ShieldCheck className="w-4 h-4 text-primary-foreground/80 mr-2" />
                    <span>
                      Intervention d&apos;urgence{' '}
                      {statsData.emergency.availability}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-primary-foreground/80 mr-2" />
                    <span>Disponible même le week-end</span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-lg"
                >
                  <a href={`tel:${COMPANY.phoneValue}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    {COMPANY.phone}
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Zones Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-lg">
                    Zones d&apos;intervention
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {zonesData.map((zone) => (
                    <span
                      key={zone.id}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {zone.city} ({zone.department})
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  Autres zones sur demande. Frais de déplacement possibles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" />
              <Badge
                variant="outline"
                className="border-primary/30 text-primary text-xs sm:text-sm"
              >
                FAQ
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Trouvez rapidement les réponses à vos questions les plus courantes
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3 sm:space-y-4"
          >
            {contactFaqData.map((faq, index) => (
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
                    <span className="text-sm sm:text-base lg:text-lg leading-tight flex-1">
                      {faq.question}
                    </span>
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
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">
                  Vous ne trouvez pas votre réponse ?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Contactez-nous directement pour une réponse personnalisée
                </p>
              </div>
              <Button
                size="sm"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                asChild
              >
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center justify-center"
                >
                  Nous contacter
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
