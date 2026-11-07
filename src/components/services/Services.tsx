"use client"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Check, Star, ArrowRight, User, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import servicesFaqData from "@/data/services-faq.json"
import statsData from "@/data/stats.json"
import PageBreadcrumb from "@/components/layout/PageBreadcrumb"
import { Marquee } from "@/components/magicui/marquee"
import ServicesList from "@/components/services/ServicesList"
import { ServiceWithContentAndCategory } from "@/types/services"

interface ServicesProps {
  services: ServiceWithContentAndCategory[]
}

// Images des clients pour le marquee
const clientImages = [
  "/img/clients/studio-phenix.webp",
  "/img/clients/l-orange-bleue-souzy.webp",
  "/img/clients/fitness24.webp",
  "/img/clients/car-protek.webp",
  "/img/clients/bc-informatique.webp",
  "/img/clients/adlg.webp",
  "/img/clients/3-petits-chats.webp"
]

export default function Services({ services }: ServicesProps) {
  const breadcrumbItems = [
    { label: 'Propreté & Services' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-white text-foreground h-[500px] sm:h-[500px] lg:h-[600px] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/img/home/header/nettoyage-de-sol-professionnel-dans-un-espace-moderne.webp"
              alt="Services de nettoyage professionnel"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/70"></div>
          
          {/* Breadcrumb - Top Left */}
          <div className="absolute top-6 left-6 z-10">
            <PageBreadcrumb items={breadcrumbItems} variant="hero" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Services de nettoyage professionnel en <span className="text-primary">Loire (42)</span> et <span className="text-primary">Rhône (69)</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
                Préserver l&apos;hygiène et la propreté de vos environnements et infrastructures
              </p>
              
              {/* CTA Button */}
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
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm mb-4">
                L&apos;expertise d&apos;une équipe de professionnels du nettoyage pour assurer la propreté et l&apos;hygiène de vos
                espaces.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Chez Aspeo, nous comprenons que chaque espace est unique, et que pour maintenir un environnement
                sain et agréable, il est essentiel de faire appel à des professionnels qualifiés.
              </h2>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                <Star className="w-4 h-4 mr-2 text-primary" />
                Nos Expertises
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nos métiers du nettoyage, de la propreté & de l&apos;hygiène
                <span className="text-primary block">dédiés aux secteurs</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quel que soit votre secteur – tertiaire, industrie, santé, agroalimentaire, grande distribution, hôtellerie-restauration, transport ou même situations spécifiques comme le syndrome de Diogène – nos experts conçoivent une offre sur-mesure. Nettoyage professionnel, désinfection et services associés, adaptés à vos besoins et exigences
              </p>
            </div>
            
            {/* Liste des services avec recherche et tri */}
            <ServicesList services={services} />
          </div>
        </section>

        {/* Section Hygiène et Propreté en Environnement de Travail */}
        <section className="pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contenu principal - 2 colonnes */}
              <div className="lg:col-span-2 space-y-8">
                {/* Titre principal */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Hygiène et propreté en environnement de travail, un enjeu fondamental
                </h2>
                
                {/* Paragraphe d'introduction */}
                <p className="text-lg text-gray-700 leading-relaxed">
                  L&apos;hygiène et la propreté en entreprise est un fondamental du bien-être au travail pour 98% des salariés 
                  (étude sur les Français et l&apos;hygiène et la propreté réalisée par IPSOS).
                </p>

                {/* Section 1 */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    La propreté en entreprise, source de bien-être et levier de performance
                  </h3>
                  <p className="text-base text-gray-700 mb-4">
                    L&apos;hygiène et la propreté permettent d&apos;offrir un espace de travail propice à l&apos;efficacité :
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">
                        93% des salariés sont + motivés dans un espace propre et bien rangé
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">
                        Pour 94% des salariés, la propreté participe au maintien d&apos;une bonne ambiance
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    L&apos;hygiène et l&apos;entretien des locaux, leurs rôles clés dans la prévention des risques et l&apos;amélioration de la santé au travail
                  </h3>
                  <div className="space-y-4">
                    <p className="text-base text-gray-700 leading-relaxed">
                      La crise sanitaire de la Covid-19 a démontré que la propreté et l&apos;hygiène sont des enjeux prioritaires 
                      dans la prévention de la santé des collaborateurs et des visiteurs.
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Les mesures d&apos;hygiène préventives mises en place permettent sans nul doute de faire baisser les transmissions 
                      de maladies virales et de ce fait, faire baisser l&apos;absentéisme en procurant un plus grand confort aux employés.
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      C&apos;est pourquoi, en tant qu&apos;entreprise de nettoyage, <span className="text-primary font-semibold">ASPEO</span> fait évoluer 
                      sans cesse ses prestations pour répondre aux évolutions de réglementations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistique et CTA - 1 colonne */}
              <div className="lg:col-span-1 flex items-center">
                <div className="text-left space-y-4">
                  <div>
                  <p className="font-medium">Pour</p>
                  <p className="text-5xl font-bold text-primary">94%</p>
                  <p className="font-medium">des salariés français,</p></div>
                  <p className="">
                    la propreté est un fondamental du bien-être au travail
                  </p>
                  <p className="text-sm text-gray-500">Source étude IPSOS 2018</p>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-6" asChild>
                    <Link href="/contact#contact-form">
                      Échanger avec nos experts sur vos enjeux
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose ASPEO Section */}
        <section className=" ">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-4 bg-white border-gray-200">
                <Check className="w-4 h-4 mr-2 text-primary" />
                Pourquoi ASPEO
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Votre partenaire de confiance pour des
                <span className="text-primary block">espaces parfaitement entretenus</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
                Chaque jour, nous mettons notre savoir-faire au service de vos espaces. Découvrez les
                trois piliers qui font de nous le choix préféré de plus de {statsData.clients.count} clients satisfaits.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-20">
              {/* Card 1 - Expertise */}
              <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Expertise reconnue</CardTitle>
                  <CardDescription className="text-base">
                    Plus de 2 ans d&apos;expérience et des méthodes éprouvées pour garantir 
                    des résultats impeccables sur tous types d&apos;espaces et de surfaces.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <Link href="/a-propos">
                      Notre histoire <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 2 - Rapidité */}
              <Card className="shadow-xl bg-white/80 backdrop-blur-sm -translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Réactivité {statsData.response.time}</CardTitle>
                  <CardDescription className="text-base">
                    Intervention rapide et efficace avec des résultats visibles dès la première 
                    intervention. Votre satisfaction est notre priorité absolue.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full bg-primary text-primary-foreground" asChild>
                    <Link href="/contact#contact-form">
                      Demander une intervention <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 3 - Solutions */}
              <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Solutions sur-mesure</CardTitle>
                  <CardDescription className="text-base">
                    Chaque espace est unique. Nous concevons des solutions personnalisées 
                    qui s&apos;adaptent parfaitement à vos besoins et contraintes spécifiques.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <Link href="/proprete-services">
                      Explorer nos services <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Bottom CTA with image */}
            <div className="relative bg-white rounded-lg shadow-xl overflow-hidden border">
              <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                <div className="relative h-48 sm:h-64 md:h-80 lg:h-full order-1 lg:order-1">
                  <Image
                    src={"/img/services/commerciaux/nettoyage-commercial-aspeo.webp"}
                    alt="Équipe ASPEO - Professionnels du nettoyage"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
                <div className="p-4 sm:p-6 md:p-8 lg:p-12 order-2 lg:order-2">
                  <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Prêt à transformer vos espaces ?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    Rejoignez les entreprises qui ont déjà fait le choix de l&apos;expertise ASPEO. 
                    Obtenez votre devis personnalisé en moins de {statsData.response.time} et découvrez la différence 
                    qu&apos;un partenaire de confiance peut faire.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button size="lg" className="group w-full sm:w-auto" asChild>
                      <Link href="/contact#contact-form" className="inline-flex items-center justify-center">
                        Demander un devis gratuit
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                      <Link href="/a-propos" className="inline-flex items-center justify-center">
                        En savoir plus sur nous
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="container pt-20 mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Pourquoi choisir Aspeo ?</h2>
              <p className="text-sm mb-8">
                Faire appel à Aspeo, c&apos;est s&apos;assurer d&apos;un service professionnel, fiable et adapté à vos besoins
                spécifiques. Découvrez pourquoi de plus en plus de clients nous font confiance pour leurs besoins en
                nettoyage.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Expertise : des professionnels formés et expérimentés dans tous les domaines du nettoyage
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Qualité : des prestations de haute qualité avec une attention particulière aux détails
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Fiabilité : respect des délais et des engagements pour une satisfaction client maximale
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Écologie : utilisation de produits respectueux de l&apos;environnement pour un nettoyage durable
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Flexibilité : des services adaptés à vos besoins spécifiques et à vos contraintes horaires
                  </span>
                </li>
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/contact#contact-form">
                  Contactez-nous maintenant <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden">
              <Image
                src={"/img/services/aspeo-equipes.webp"}
                alt="Équipe de nettoyage professionnelle"
                width={600}
                height={500}
                className="object-cover w-full h-full rounded-lg aspect-[3/2]"
              />
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="py-20 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden order-2 md:order-1">
              <Image
                src={"/img/services/client-aspeo-heureux.webp"}
                alt="Service de nettoyage en action"
                width={600}
                height={500}
                className="object-cover w-full h-full rounded-lg aspect-[3/2]"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Comment nous vous aidons à maintenir vos espaces propres ?</h2>
              <p className="text-sm mb-8">
                Notre processus de nettoyage est conçu pour répondre parfaitement à vos besoins. Nous prenons le temps
                de comprendre votre espace, vos exigences et vos contraintes pour vous offrir un service sur mesure.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Évaluation de vos besoins pour comprendre parfaitement vos attentes et vos exigences en matière de
                    propreté
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Élaboration d&apos;un plan de nettoyage personnalisé adapté à votre espace et à vos contraintes
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Utilisation de produits et d&apos;équipements professionnels pour garantir un résultat impeccable
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-sm">
                    Suivi régulier pour s&apos;assurer de votre satisfaction et ajuster nos services si nécessaire
                  </span>
                </li>
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/contact#contact-form">
                  Demander un devis <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-primary py-8 rounded-lg mx-4 md:mx-6">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h3 className="text-xl font-bold text-primary-foreground mb-4 md:mb-0">
                Besoin d&apos;un service de nettoyage professionnel ?
              </h3>
              <Button variant="secondary" asChild>
                <Link href="/contact#contact-form">
                  Demander un devis gratuit <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative grid grid-cols-3 gap-2 h-80 overflow-hidden">
              <div>
                <Marquee vertical pauseOnHover className="[--duration:40s] h-full">
                  {clientImages.map((clientImage, index) => (
                    <div key={index} className="mb-2 block">
                      <Card className="aspect-square overflow-hidden border-2 border-muted hover:border-primary/30 transition-colors group">
                        <Image
                          src={clientImage}
                          alt={`Client ${index + 1}`}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </Card>
                    </div>
                  ))}
                </Marquee>
              </div>
              <div>
                <Marquee vertical reverse pauseOnHover className="[--duration:40s] h-full">
                  {clientImages.map((clientImage, index) => (
                    <div key={`col2-${index}`} className="mb-2 block">
                      <Card className="aspect-square overflow-hidden border-2 border-muted hover:border-primary/30 transition-colors group">
                        <Image
                          src={clientImages[(index + 2) % clientImages.length]}
                          alt={`Client ${index + 1}`}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </Card>
                    </div>
                  ))}
                </Marquee>
              </div>
              <div>
                <Marquee vertical pauseOnHover className="[--duration:40s] h-full">
                  {clientImages.map((clientImage, index) => (
                    <div key={`col3-${index}`} className="mb-2 block">
                      <Card className="aspect-square overflow-hidden border-2 border-muted hover:border-primary/30 transition-colors group">
                        <Image
                          src={clientImages[(index + 4) % clientImages.length]}
                          alt={`Client ${index + 1}`}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </Card>
                    </div>
                  ))}
                </Marquee>
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white dark:from-background"></div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white dark:from-background"></div>
            </div>
            <Card className="p-8 text-center md:text-left border-0 shadow-none">
              <CardContent className="p-0">
                <div className="text-primary text-6xl font-bold mb-2">{statsData.clients.count}+</div>
                <CardTitle className="text-xl mb-4">{statsData.clients.label}</CardTitle>
                <CardDescription className="text-sm">
                  Depuis notre création, nous avons aidé plus de {statsData.clients.count} clients à maintenir leurs espaces propres et sains,
                  qu&apos;il s&apos;agisse de particuliers ou d&apos;entreprises.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" />
                <Badge variant="outline" className="border-primary/30 text-primary text-xs sm:text-sm">
                  FAQ
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Trouvez rapidement les réponses à vos questions les plus courantes sur nos services de nettoyage
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
              {servicesFaqData.map((faq, index) => (
                <AccordionItem 
                  key={faq.id} 
                  value={`item-${faq.id}`}
                  className="border border-primary/10 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 bg-card/90 backdrop-blur-sm"
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
                    Contactez-nous directement pour une réponse personnalisée sur nos services
                  </p>
                </div>
                <Button size="sm" className="w-full sm:w-auto" asChild>
                  <Link href="/contact#contact-form" className="inline-flex items-center justify-center">
                    Nous contacter
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-primary py-20 rounded-lg mx-4 md:mx-6">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <div className="flex justify-center mb-6">
              <Image src={"/img/logo/logo-white.webp"} alt="Aspeo logo" width={300} height={100} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Contactez-nous dès aujourd&apos;hui pour découvrir comment nos services de nettoyage professionnels peuvent
                transformer vos espaces.
              </h2>
              <Button variant="secondary" className="w-full py-6" asChild>
                <Link href="/contact#contact-form">
                  Demander un devis gratuit
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
