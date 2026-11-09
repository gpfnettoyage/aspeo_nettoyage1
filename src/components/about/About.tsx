import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Marquee } from '@/components/magicui/marquee';
import Image from 'next/image';
import reviewsData from '@/data/reviews.json';
import statsData from '@/data/stats.json';
import { getInitials } from '@/utils/initials';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { COMPANY } from '@/constants/company';
import { 
  CheckCircle,
  Clock,
  ArrowRight,
  Award,
  Leaf,
  Heart,
  Building,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Handshake,
  Zap,
  Quote,
  ThumbsUp,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

const About = () => {
  const breadcrumbItems = [
    { label: 'À propos' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 2 Columns */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        {/* Breadcrumb - Top Left */}
        <div className="absolute top-6 left-6 z-10">
          <PageBreadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className=''>
                                 <Badge variant="outline" className="mb-8 bg-white border-gray-200">
                   <Building className="w-4 h-4 mr-2 text-primary" />
                   Nettoyage en Loire & Rhône
                 </Badge>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  À propos d&apos;ASPEO –
                  <span className="text-primary block">Entreprise de nettoyage</span>
                  en Loire (42) et Rhône (69)
                </h1>
                
                                                   <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                    Depuis plus de 2 ans, <strong className="text-gray-900">ASPEO</strong> accompagne entreprises et professionnels en Loire et Rhône avec des services de nettoyage professionnel fiables et performants. Grâce à des équipements modernes et une approche innovante, nous garantissons propreté, hygiène et satisfaction à chaque intervention.
                  </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base group">
                  <Link href="/contact#contact-form" className="inline-flex items-center">
                    Demander un devis gratuit
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base inline-flex items-center">
                  <Link href={`tel:${COMPANY.phoneValue}`} className="inline-flex items-center"> 
                  <Phone className="mr-2 w-5 h-5" />
                  {COMPANY.phone}
                  </Link>
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statsData.clients.count}+</div>
                  <p className="text-gray-600 text-sm">{statsData.clients.label}</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statsData.satisfaction.rate}%</div>
                  <p className="text-gray-600 text-sm">Taux de satisfaction</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statsData.response.time}</div>
                  <p className="text-gray-600 text-sm">{statsData.response.label}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10">
                                 <Image
                   src="/img/logo/logo.png"
                   alt="Équipe Aspeo - Nettoyage professionnel"
                   width={600}
                   height={500}
                   priority
                   className="rounded-2xl shadow-2xl"
                 />
                {/* Floating Badge */}
                <div className="absolute -top-4 -left-4 bg-white border border-gray-200 text-primary p-4 rounded-xl shadow-lg">
                  <Award className="w-8 h-8" />
                </div>
                {/* Floating Stats Card */}
                <Card className="absolute -bottom-6 -right-6 bg-white shadow-xl border-0 w-48">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">+25%</p>
                        <p className="text-sm text-gray-600">Croissance 2024</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Background decoration */}
              <div className="absolute top-8 right-8 w-72 h-72 bg-primary/5 rounded-full -z-10" />
              <div className="absolute bottom-8 left-8 w-48 h-48 bg-blue-100/50 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20 bg-gray-50/30">
        <div className="container">
                                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
                         {/* Left - Content */}
             <div className="lg:col-span-2 space-y-8">
              <div>
                <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                  <Building className="w-4 h-4 mr-2 text-primary" />
                  Qui sommes-nous
                </Badge>
                                                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    ASPEO – Entreprise de nettoyage professionnel en Loire et Rhône
                  </h2>
                                                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      <strong className="text-gray-900">ASPEO</strong> est une entreprise familiale de <strong className="text-gray-900">nettoyage professionnel</strong> présente principalement en Loire et Rhône. Depuis notre création, nous avons choisi de placer la rigueur, la proximité et l&apos;expertise au cœur de chacune de nos prestations. Notre objectif est simple : garantir à nos clients des environnements propres, sains et durables.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      Nous accompagnons au quotidien les entreprises, copropriétés, administrations et particuliers dans l&apos;entretien de leurs locaux. Grâce à une équipe formée, engagée et motivée, nous assurons des interventions adaptées aux besoins spécifiques de chaque site : nettoyage de bureaux et open spaces, entretien de parties communes, hygiène de locaux administratifs, vitrerie ou encore remise en état après travaux.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                      Chez <strong className="text-gray-900">ASPEO</strong>, nous croyons que la propreté contribue directement à la qualité de vie et aux conditions de travail. Chaque intervention repose sur un suivi rigoureux : audit, protocole clair, contrôle qualité et reporting transparent. Cette exigence quotidienne et l&apos;attention portée aux détails permettent de bâtir une relation de confiance solide avec nos clients.
                    </p>
              </div>

              
            </div>
            
                         {/* Right - Contact & CTA */}
             <div className="space-y-6">
                               {/* Contactez-nous */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Contactez-nous</h3>
                  <div className="space-y-4">
                                         <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                         <Phone className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                         <p className="text-sm text-gray-500">Téléphone</p>
                         <Link href={`tel:${COMPANY.phoneValue}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                           {COMPANY.phone}
                         </Link>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                         <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                         </svg>
                       </div>
                       <div>
                         <p className="text-sm text-gray-500">Email</p>
                         <Link href={`mailto:${COMPANY.email}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                           {COMPANY.email}
                         </Link>
                       </div>
                     </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium text-gray-900">{COMPANY.address.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
               
               {/* Intervention rapide */}
               <div className="bg-primary text-white p-6 rounded-xl">
                 <div className="text-center">
                   <Clock className="w-8 h-8 mx-auto mb-3" />
                   <h4 className="font-bold text-lg mb-1">Intervention rapide</h4>
                   <p className="text-sm text-white/90">{statsData.emergency.availability} disponible</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                <Zap className="w-4 h-4 mr-2 text-primary" />
                Notre Approche
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Une méthodologie éprouvée pour des résultats exceptionnels
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chaque intervention suit un protocole rigoureux développé au fil de nos 2 années d&apos;expérience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Diagnostic</h3>
                <p className="text-gray-600 text-sm">
                  Analyse complète de vos besoins et contraintes spécifiques
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Planification</h3>
                <p className="text-gray-600 text-sm">
                  Élaboration d&apos;un plan d&apos;intervention adapté et personnalisé
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exécution</h3>
                <p className="text-gray-600 text-sm">
                  Intervention avec équipements professionnels et techniques expertes
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contrôle</h3>
                <p className="text-gray-600 text-sm">
                  Vérification qualité et suivi pour garantir votre satisfaction
                </p>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-16 bg-gray-50 rounded-2xl p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{statsData.satisfaction.rate}%</div>
                  <p className="text-gray-600 text-sm">Respect des protocoles</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{statsData.response.time}</div>
                  <p className="text-gray-600 text-sm">{statsData.response.label}</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{statsData.satisfaction.rate}%</div>
                  <p className="text-gray-600 text-sm">Taux de satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 bg-gray-50/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-white border-gray-200">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              Notre Histoire
            </Badge>
                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
               L&apos;aventure <span className="text-primary">Aspeo</span>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez le parcours qui a transformé une vision en réalité, 
              et qui continue de nous inspirer chaque jour
            </p>
          </div>

          {/* Timeline - Responsive */}
          <div className="max-w-6xl mx-auto">
            {/* Desktop Timeline */}
            <div className="hidden lg:block relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary h-full"></div>
              
              {/* Timeline Items */}
              <div className="space-y-16">
                {/* 2020 - Début */}
                <div className="relative flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-primary text-sm font-semibold mb-2">2021</div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">La naissance d&apos;une vision</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Tout commence avec une idée simple mais ambitieuse : révolutionner 
                          le nettoyage professionnel en Loire et Rhône. Une équipe 
                          passionnée se forme autour de valeurs communes.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="w-1/2 pl-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 12.747 5.754 12.5 7.5 12.5c1.747 0 3.332.247 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.247 4.5 1.253v13C16.5 18.5 14.754 18.5 13 18.5c-1.746 0-3.332-.247-4.5-1.253" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-primary">Vision & Fondation</h4>
                    </div>
                  </div>
                </div>

                {/* 2021 - Premiers pas */}
                <div className="relative flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-primary">Premiers Succès</h4>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="w-1/2 pl-8">
                    <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-primary text-sm font-semibold mb-2">2024</div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Les premiers pas vers la perfection</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Premiers contrats, premières satisfactions client. L&apos;équipe 
                          s&apos;agrandit et les méthodes se perfectionnent. Chaque intervention 
                          devient une opportunité d&apos;amélioration.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 2022-2023 - Expansion */}
                <div className="relative flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-primary text-sm font-semibold mb-2">2024</div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">L&apos;expansion et l&apos;innovation</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Investissement dans des équipements de pointe, formation continue 
                          des équipes, et développement de nouveaux services spécialisés. 
                          La réputation Aspeo s&apos;étend.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="w-1/2 pl-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-primary">Innovation & Croissance</h4>
                    </div>
                  </div>
                </div>

                                 {/* 2024-2025 - Aujourd'hui */}
                 <div className="relative flex items-center">
                   <div className="w-1/2 pr-8 text-right">
                     <div className="text-center">
                       <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                         </svg>
                       </div>
                                               <h4 className="font-semibold text-primary">Expertise Reconnue</h4>
                     </div>
                   </div>
                   
                   <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                   
                   <div className="w-1/2 pl-8">
                     <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                       <CardContent className="p-6">
                         <div className="text-primary text-sm font-semibold mb-2">2025</div>
                         <h3 className="text-xl font-bold mb-3 text-gray-900">La reconnaissance de notre savoir-faire</h3>
                         <p className="text-gray-600 text-sm leading-relaxed">
                           Plus de {statsData.clients.count} clients satisfaits, une équipe de professionnels
                           expérimentés, et une position de référence dans le nettoyage
                           professionnel en Loire et Rhône.
                         </p>
                       </CardContent>
                     </Card>
                   </div>
                 </div>
              </div>
            </div>

            {/* Mobile Timeline - Vertical Stack */}
            <div className="lg:hidden space-y-8">
              {/* 2020 - Début */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 12.747 5.754 12.5 7.5 12.5c1.747 0 3.332.247 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.247 4.5 1.253v13C16.5 18.5 14.754 18.5 13 18.5c-1.746 0-3.332-.247-4.5-1.253" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Card className="bg-white shadow-lg border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-primary text-sm font-semibold">2020</span>
                          <span className="text-primary text-xs font-medium">Vision & Fondation</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900">La naissance d&apos;une vision</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Tout commence avec une idée simple mais ambitieuse : révolutionner 
                          le nettoyage professionnel en Loire et Rhône. Une équipe 
                          passionnée se forme autour de valeurs communes.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* 2021 - Premiers pas */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Card className="bg-white shadow-lg border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-primary text-sm font-semibold">2021</span>
                          <span className="text-primary text-xs font-medium">Premiers Succès</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900">Les premiers pas vers la perfection</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Premiers contrats, premières satisfactions client. L&apos;équipe 
                          s&apos;agrandit et les méthodes se perfectionnent. Chaque intervention 
                          devient une opportunité d&apos;amélioration.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* 2022-2023 - Expansion */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Card className="bg-white shadow-lg border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-primary text-sm font-semibold">2022-2023</span>
                          <span className="text-primary text-xs font-medium">Innovation & Croissance</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900">L&apos;expansion et l&apos;innovation</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Investissement dans des équipements de pointe, formation continue 
                          des équipes, et développement de nouveaux services spécialisés. 
                          La réputation Aspeo s&apos;étend.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

                             {/* 2024-2025 - Aujourd'hui */}
               <div className="relative">
                 <div className="flex items-start gap-4">
                   <div className="flex-shrink-0">
                     <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                       </svg>
                     </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <Card className="bg-white shadow-lg border border-gray-200">
                       <CardContent className="p-4">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-primary text-sm font-semibold">2024-2025</span>
                           <span className="text-primary text-xs font-medium">Expertise Reconnue</span>
                         </div>
                         <h3 className="text-lg font-bold mb-2 text-gray-900">La reconnaissance de notre savoir-faire</h3>
                         <p className="text-gray-600 text-sm leading-relaxed">
                           Plus de {statsData.clients.count} clients satisfaits, une équipe de professionnels
                           expérimentés, et une position de référence dans le nettoyage
                           professionnel en Loire et Rhône.
                         </p>
                       </CardContent>
                     </Card>
                   </div>
                 </div>
               </div>
            </div>
          </div>

     
          {/* CTA */}
          <div className="text-center mt-16">
            <Button size="lg" className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base" asChild>
              <Link href="/contact#contact-form">
                Écrire la suite de notre histoire
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values & Commitments */}
      <section className="py-20 bg-gray-50/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Values */}
            <div>
              <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                <Heart className="w-4 h-4 mr-2 text-primary" />
                Nos Valeurs
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Les fondements de notre savoir-faire
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: CheckCircle,
                    title: "Qualité Sans Compromis",
                    description: "Standards de qualité appliqués à chaque intervention, avec un contrôle qualité systématique."
                  },
                  {
                    icon: Zap,
                    title: "Réactivité Garantie",
                    description: `Intervention d'urgence ${statsData.emergency.availability} et délais de réponse optimisés pour tous vos besoins.`
                  },
                  {
                    icon: Leaf,
                    title: "Engagement Écologique",
                    description: "Produits respectueux de l'environnement et démarche RSE intégrée à notre activité."
                  },
                  {
                    icon: ShieldCheck,
                    title: "Fiabilité Totale",
                    description: "Assurance responsabilité civile, équipe formée et matériel certifié pour votre sérénité."
                  }
                ].map((value, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments */}
            <div>
              <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                <Handshake className="w-4 h-4 mr-2 text-primary" />
                Notre mission
              </Badge>
        

              <div className="bg-gray-50 rounded-xl p-8">

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Votre satisfaction, notre priorité
              </h2>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  Nous nous engageons à fournir des services de nettoyage professionnels et de qualité pour tous types d&apos;espaces. Notre objectif est de maintenir un environnement propre, sain et agréable pour votre entreprise ou votre résidence.
                </p>

                <div className="space-y-4">
                  {[
                    "Services de nettoyage personnalisés selon vos besoins",
                    "Équipe qualifiée et expérimentée",
                    "Produits écologiques et respectueux de l'environnement",
                  ].map((commitment, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <ThumbsUp className="w-4 h-4 text-primary" />
                      <span className="text-gray-700 text-sm">{commitment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-white border-gray-200">
              <MessageCircle className="w-4 h-4 mr-2 text-primary" />
              Témoignages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              La satisfaction de nos clients témoigne de notre engagement quotidien
            </p>
          </div>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
            <Marquee pauseOnHover className="[--duration:80s]" reverse>
              {reviewsData.reviews.slice(0, 12).map((review) => {
                const initials = getInitials(review.nom);

                return (
                  <Link key={review.id} href="/avis">
                    <Card className="bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border group w-64 mx-4 cursor-pointer">
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
                        <p className="text-foreground leading-relaxed text-sm line-clamp-2 min-h-[2.5rem]">
                          &quot;{review.commentaire}&quot;
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="w-12 h-12 mr-4 border-2 border-primary">
                              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                                {initials}
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
                  </Link>
                );
              })}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base" asChild>
              <Link href="/avis" className="inline-flex items-center">
                Voir tous les avis
              </Link>
            </Button>
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
                         <h2 className="text-3xl md:text-4xl font-bold mb-6">
               Prêt à découvrir la différence Aspeo ?
             </h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez plus de {statsData.clients.count} clients qui nous font confiance pour maintenir
              leurs espaces dans un état parfait.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base group" asChild>
                <Link href="/contact#contact-form" className="inline-flex items-center">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto sm:px-6 sm:py-3 text-sm sm:text-base text-foreground" asChild>
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
  );
};

export default About;