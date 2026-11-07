"use client"
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowRight,
  Award,
  Users,
  Leaf,
  CheckCircle,
  Star,
  Mail,
  Phone,
  MapPin,
  Clock,
  Quote,
  ChevronRight,
  Zap,
  ShieldCheck,
  Building,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import reviewsData from '@/data/reviews.json';
import { getInitials } from '@/utils/initials';
import Link from 'next/link';
import Image from 'next/image';
import { Marquee } from '@/components/magicui/marquee';
import ContactForm from '@/components/contact/ContactForm';
import zonesData from '@/data/zones.json';
import statsData from '@/data/stats.json';
import { Badge } from '@/components/ui/badge';
import PartnersSection from './PartnersSection';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { COMPANY } from '@/constants/company';
import { ServiceWithContent } from '@/types/services';

interface Review {
  id: string | number;
  nom: string;
  commentaire: string;
  date: string;
}

const TestimonialCard = ({ review }: { review: Review }) => (
  <Card className="bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border group w-full">
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between mb-4">
        <Quote className="w-8 h-8 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <p className="text-foreground leading-relaxed text-sm">
        &quot;{review.commentaire}&quot;
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="w-12 h-12 mr-4 border-2 border-primary">
            <AvatarFallback className="font-bold bg-primary/10 text-primary">
              {getInitials(review.nom)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">{review.nom}</CardTitle>
            <CardDescription className="text-xs">{review.date}</CardDescription>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface MetierType {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  slug: string;
}

const MetierCard = ({ metier }: { metier: MetierType }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (imageRef.current) imageRef.current.style.transform = 'scale(1.1)';
    if (contentRef.current) contentRef.current.style.transform = 'translateY(-0.5rem)';
    if (descriptionRef.current) descriptionRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (imageRef.current) imageRef.current.style.transform = 'scale(1)';
    if (contentRef.current) contentRef.current.style.transform = 'translateY(0)';
    if (descriptionRef.current) descriptionRef.current.style.opacity = '0';
  };

  return (
    <Link
      ref={cardRef}
      href={`/proprete-services/${metier.slug}`}
      className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 cursor-pointer bg-white w-48 sm:w-56 md:w-64"
      style={{ aspectRatio: '4/5' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={imageRef} className="absolute inset-0 transition-transform duration-500">
        <Image
          src={metier.image}
          alt={metier.title}
          fill
          priority={true}
          className="object-cover"
          sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
        />
      </div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-end text-white">
        <div ref={contentRef} className="transform transition-transform duration-300">
          <h3 className="text-base sm:text-lg font-bold mb-1 leading-tight">
            {metier.title}
          </h3>
          <p className="text-xs sm:text-sm text-blue-200 mb-2 font-medium">
            {metier.subtitle}
          </p>
          <p ref={descriptionRef} className="text-xs sm:text-sm text-gray-200 leading-relaxed opacity-0 transition-opacity duration-300 line-clamp-4">
            {metier.description}
          </p>
        </div>
      </div>

      {/* Hover border effect */}
      <div ref={borderRef} className="absolute inset-0rounded-lg transition-colors duration-300"></div>
    </Link>
  );
};

interface HomePageProps {
  services: ServiceWithContent[];
}

const HomePage = ({ services }: HomePageProps) => {
  const metiers = services.map(service => ({
    image: service.images[0],
    title: service.title,
    subtitle: service.subtitle || "Services spécialisés",
    description: service.descriptions[0],
    slug: service.slug,
  }));

  const features = [
    {
      icon: Award,
      title: "Qualité certifiée",
      description: `Plus de ${statsData.experience.years} ans d'expérience dans le nettoyage professionnel avec certifications qualité`
    },
    {
      icon: Users,
      title: "Équipe formée",
      description: "Personnel qualifié et formé aux dernières techniques de nettoyage et d'hygiène"
    },
    {
      icon: Leaf,
      title: "Produits écologiques",
      description: "Utilisation de produits respectueux de l'environnement et de la santé"
    },
    {
      icon: CheckCircle,
      title: "Satisfaction garantie",
      description: "Engagement qualité avec contrôles réguliers et garantie de satisfaction client"
    }
  ];

  const allReviews = reviewsData.reviews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Diviser les métiers en deux lignes pour les marquees
  const halfLength = Math.ceil(metiers.length / 2);
  const firstRowMetiers = metiers.slice(0, halfLength);
  const secondRowMetiers = metiers.slice(halfLength);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-background text-foreground h-[580px] sm:h-[580px] lg:h-[680px] flex items-center overflow-hidden pt-20 sm:pt-24">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/img/home/header/aspeo-bureaux_1.webp"
            alt="Bureaux Aspeo - Nettoyage professionnel"
            fill
            className="object-cover"
            priority={true}
            fetchPriority="high"
            sizes="100vw"
            decoding="sync"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/70"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
          {/* Main Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Nettoyage professionnel & remise en état en <span className="text-primary">Loire (42)</span> et <span className="text-primary">Rhône (69)</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              Entreprise spécialisée dans le nettoyage professionnel, nous offrons des solutions complètes pour bureaux, commerces, industries et collectivités.
            </p>
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 mb-6 sm:mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm text-foreground">{statsData.clients.count}+ clients satisfaits</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm text-foreground">{statsData.satisfaction.rate}% satisfaction</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm text-foreground">Loire (42) & Rhône (69)</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <Button 
              size="lg" 
              className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base group"
              asChild
            >
              <Link href="/contact#contact-form">
                Demander un devis gratuit
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
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

          {/* Social Proof */}
          <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-foreground font-medium">5/5</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur plus de {reviewsData.reviews.length} avis clients vérifiés
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Award className="w-3 h-3 text-primary" />
                <span>Certifié qualité</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-primary" />
                <span>Équipe formée</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-primary" />
                <span>Intervention rapide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary mr-2" />
                <div className="text-3xl font-bold text-foreground">
                  <NumberTicker value={statsData.clients.count} startValue={0} delay={0.2} />
                  <span className="text-primary">+</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Clients satisfaits</p>
              <p className="text-xs text-muted-foreground">Secteurs variés</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Award className="w-5 h-5 text-primary mr-2" />
                <div className="text-3xl font-bold text-foreground">
                  <NumberTicker value={statsData.satisfaction.rate} startValue={0} delay={0.4} />
                  <span className="text-primary">%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Satisfaction</p>
              <p className="text-xs text-muted-foreground">Taux de recommandation</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary mr-2" />
                <div className="text-3xl font-bold text-foreground">
                  <NumberTicker value={statsData.experience.years} startValue={0} delay={0.6} />
                  <span className="text-primary">+</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Années d&apos;expérience</p>
              <p className="text-xs text-muted-foreground">Expertise reconnue</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary mr-2" />
                <div className="text-3xl font-bold text-foreground">
                  <span className="text-primary">{statsData.emergency.availability}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Urgence</p>
              <p className="text-xs text-muted-foreground">Intervention rapide</p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center text-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Produits écolabel et probiotiques certifiés</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Techniques innovantes et durables</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Qualité professionnelle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos métiers */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 bg-background border-border">
              <Building className="w-4 h-4 mr-2 text-primary" />
              Nos Expertises
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              Services de <span className="text-primary">Nettoyage Professionnel</span> et <span className="text-primary">Solutions d&apos;Hygiène</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Découvrez l&apos;étendue de notre expertise à travers nos différents domaines d&apos;intervention. 
              Chaque métier est porté par des consultants experts reconnus dans leur domaine.
            </p>
          </div>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background py-4 md:py-6">
            <Marquee pauseOnHover className="[--duration:40s]">
              {firstRowMetiers.map((metier, index) => (
                <MetierCard key={`row1-${index}`} metier={metier} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:40s]">
              {secondRowMetiers.map((metier, index) => (
                <MetierCard key={`row2-${index}`} metier={metier} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 sm:w-1/3 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 sm:w-1/3 bg-gradient-to-l from-background"></div>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base" asChild>
              <Link href="/proprete-services">
                Voir tous nos services
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir ASPEO */}
      <section className="pb-16 bg-background">
        <div className="container">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 bg-background border-border">
              <Award className="w-4 h-4 mr-2 text-primary" />
              Nos Avantages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Pourquoi choisir <span className="text-primary">ASPEO</span> ?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Notre expertise reconnue et notre approche méthodologique font de nous le partenaire de confiance pour vos projets stratégiques.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-card rounded-full mx-auto mb-4 flex items-center justify-center border border-border shadow-sm">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-primary mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section "Comment on peut aider" */}
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-6 lg:space-y-8">
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Comment <span className="text-primary">Aspeo</span> vous accompagne dans vos besoins de propreté & d&apos;hygiène ! 

                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                    Nous adaptons nos solutions à vos besoins spécifiques avec une approche personnalisée
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Analyse de vos besoins</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      Nous commençons par une évaluation complète de vos espaces et de vos exigences spécifiques. 
                      Notre équipe technique analyse vos contraintes et propose des solutions adaptées.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Planification stratégique</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      Élaboration d&apos;un plan de nettoyage personnalisé avec planning détaillé, 
                      fréquence d&apos;intervention et ressources nécessaires pour optimiser vos coûts.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Mise en œuvre et suivi</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      Exécution professionnelle avec contrôles qualité réguliers et ajustements 
                      en temps réel selon vos retours et l&apos;évolution de vos besoins.
                    </p>
                  </div>
                </div>
                
                {/* CTA Section */}
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-lg mt-6">
                  <h4 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                    Besoin d&apos;un nettoyage professionnel ?
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-4 leading-relaxed">
                    Découvrez comment notre expertise peut transformer vos espaces et améliorer votre environnement de travail.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link href="/contact#contact-form">
                        Demander un devis gratuit
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" asChild>
                      <Link href="/a-propos">
                        En savoir plus
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                  <div className="w-full h-full bg-card/50 rounded-xl flex items-center justify-center border border-border">
                    <Image
                      src="/img/home/aspeo-proprete_1.webp"
                      alt="Planification du nettoyage"
                      width={400}
                      height={400}
                      className="rounded-lg object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                <div className="absolute -bottom-2 -right-2 sm:-bottom-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 bg-card border border-border rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Section "Aspeo vous accompagne" */}
          <div className="mt-8 bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 max-w-4xl mx-auto">
              <span className="text-primary">Aspeo</span>, un partenaire durable pour vos environnements <span className="text-primary">propres</span> & <span className="text-primary">sains</span> ! 
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                Un partenariat durable basé sur la confiance, la qualité et l&apos;innovation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center border border-border shadow-sm">
                  <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Accompagnement continu</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Notre équipe reste à votre écoute pour toute question ou demande d&apos;adaptation. 
                  Nous évoluons ensemble pour maintenir des standards d&apos;excellence.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center border border-border shadow-sm">
                  <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Communication transparente</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Rapports détaillés, suivi en temps réel et échanges réguliers pour 
                  vous tenir informé de l&apos;état de vos espaces et de nos interventions.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center border border-border shadow-sm">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Innovation et formation</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Nos équipes se forment continuellement aux nouvelles techniques et 
                  équipements pour vous offrir un service toujours plus performant.
                </p>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-12 text-center">
              <div className="inline-flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-border">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  Plus de {statsData.experience.years} ans d&apos;expérience au service de votre satisfaction
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background border-border">
              <MessageCircle className="w-4 h-4 mr-2 text-primary" />
              Témoignages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ce que disent <span className="text-primary">nos clients</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              La satisfaction de nos clients témoigne de notre engagement quotidien
            </p>
          </div>
          
          {/* Marquee Vertical Multi-colonnes avec effet de flou */}
          <div className="relative h-[500px] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {/* Colonne 1 */}
                <div className="h-full">
                  <Marquee 
                    vertical 
                    pauseOnHover 
                    className="h-full"
                    repeat={2}
                  >
                    {allReviews.filter((_, index) => index % 3 === 0).map((review) => (
                      <div key={review.id} className="mb-6">
                        <TestimonialCard review={review} />
                      </div>
                    ))}
                  </Marquee>
                </div>

                {/* Colonne 2 */}
                <div className="h-full hidden md:block">
                  <Marquee 
                    vertical 
                    pauseOnHover 
                    className="h-full"
                    repeat={2}
                  >
                    {allReviews.filter((_, index) => index % 3 === 1).map((review) => (
                      <div key={review.id} className="mb-6">
                        <TestimonialCard review={review} />
                      </div>
                    ))}
                  </Marquee>
                </div>

                {/* Colonne 3 */}
                <div className="h-full hidden lg:block">
                  <Marquee 
                    vertical 
                    pauseOnHover 
                    className="h-full"
                    repeat={2}
                  >
                    {allReviews.filter((_, index) => index % 3 === 2).map((review) => (
                      <div key={review.id} className="mb-6">
                        <TestimonialCard review={review} />
                      </div>
                    ))}
                  </Marquee>
                </div>
              </div>
            </div>
            {/* Effet de flou en haut et en bas */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"/>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"/>
          </div>
          
          {/* Bouton Voir tous les avis */}
          <div className="text-center mt-8 sm:mt-12">
            <Button size="lg" variant="outline" className="group" asChild>
              <Link href="/avis" className="inline-flex items-center">
                Voir tous les avis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PartnersSection />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à découvrir la différence Aspeo ?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
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
                <a href={`tel:${COMPANY.phoneValue}`} className="inline-flex items-center">
                <Phone className="mr-2 w-5 h-5" />
                Nous appeler
                </a>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-primary-foreground/80">
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

      {/* Contact Section */}
      <section className="py-16" id="contact-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:items-center">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        Contactez-nous dès maintenant
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Remplissez ce formulaire et recevez votre devis personnalisé sous {statsData.response.time}
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
              <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Nous contacter</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <a href={`tel:${COMPANY.phoneValue}`} className="text-primary font-semibold hover:text-primary/80 transition-colors">
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
                          <a href={`mailto:${COMPANY.email}`} className="text-primary font-semibold hover:text-primary/80 transition-colors">
                            {COMPANY.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Notre adresse</h3>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                    <p className="text-foreground font-medium">{COMPANY.address.street}</p>
                    <p className="text-sm text-muted-foreground">{COMPANY.address.zipCode} {COMPANY.address.city}, France</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Nos horaires</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center p-3 bg-secondary rounded-lg border border-border">
                      <span className="text-foreground font-medium">Lundi - Jeudi</span>
                      <span className="text-primary text-sm font-medium">{COMPANY.hours.week}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg border border-border">
                      <span className="text-foreground font-medium">Vendredi</span>
                      <span className="text-primary text-sm font-medium">{COMPANY.hours.friday}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <span className="text-foreground font-medium">Samedi - Dimanche</span>
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
                  <h3 className="font-semibold text-lg">Besoin d&apos;une réponse immédiate ?</h3>
                </div>
                
                <p className="text-primary-foreground/90 text-sm mb-4 leading-relaxed">
                  Appelez-nous directement pour un devis express ou une intervention d&apos;urgence.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary-foreground/80 mr-2" />
                    <span>Devis express sous 2h</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ShieldCheck className="w-4 h-4 text-primary-foreground/80 mr-2" />
                    <span>Intervention d&apos;urgence {statsData.emergency.availability}</span>
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
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-lg">Zones d&apos;intervention</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {zonesData.map((zone) => (
                    <span key={zone.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
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
    </div>
  );
};

export default HomePage;
