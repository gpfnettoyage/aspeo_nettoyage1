import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Marquee } from '@/components/magicui/marquee';
import { getReviews } from '@/services/reviewsService';
import { getInitials } from '@/utils/initials';
import { Star, Quote, ChevronRight, Users, Award, ThumbsUp, Clock} from 'lucide-react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { Review } from '@/services/reviewsService';
import statsData from '@/data/stats.json';

const AllReviews = () => {
  const reviews = getReviews();

  const breadcrumbItems = [
    { label: 'Avis clients' }
  ];

  const stats = [
    { icon: Users, value: `${statsData.clients.count}+`, label: statsData.clients.label },
    { icon: Award, value: statsData.rating.value, label: statsData.rating.label },
    { icon: ThumbsUp, value: `${statsData.satisfaction.rate}%`, label: 'Recommandations' },
    { icon: Clock, value: statsData.response.time, label: statsData.response.label }
  ];

  const StarRating = ({ rating = 5 }: { rating?: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
  
  const TestimonialCard = ({ review }: { review: Review }) => (
    <Card className="bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border group w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between mb-4">
          <Quote className="w-8 h-8 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
          <StarRating rating={5} />
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

  return (
    <div>
      {/* Hero Section with Background Image */}
      <section className="relative bg-white text-foreground h-[500px] sm:h-[500px] lg:h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/img/reviews/reviews-image.webp"
            alt="Avis clients Aspeo"
            fill
            className="object-cover"
            priority={true}
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/70"/>
        
        {/* Breadcrumb - Top Left */}
        <div className="absolute top-6 left-6 z-10">
          <PageBreadcrumb items={breadcrumbItems} variant="hero" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Ce que disent nos{' '}
              <span className="text-primary">clients</span>
            </h1>
            
            <p className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6">
              Découvrez l&apos;évaluation de nos services par ceux qui nous ont fait confiance.
            </p>
            
            <div className="flex justify-center items-center gap-2 mb-6 sm:mb-8">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-base sm:text-lg font-semibold">5/5 basé sur {reviews.length} avis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30" id="reviews-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Marquee Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Témoignages clients
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chaque avis compte pour nous. Voici ce que nos clients pensent vraiment de nos services de nettoyage professionnel.
            </p>
          </div>
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
                  {reviews.filter((_, index) => index % 3 === 0).map((review) => (
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
                  {reviews.filter((_, index) => index % 3 === 1).map((review) => (
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
                  {reviews.filter((_, index) => index % 3 === 2).map((review) => (
                    <div key={review.id} className="mb-6">
                      <TestimonialCard review={review} />
                    </div>
                  ))}
                </Marquee>
              </div>
            </div>
          </div>
          {/* Effet de flou en haut - maintenant sur toute la largeur */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"/>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"/>
        </div>
        
        {/* Bouton discret pour donner un avis */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link 
              href="https://g.page/r/CWJsAxXVP__iEAE/review"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Donner mon avis
            </Link>
          </Button>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            Rejoignez nos clients satisfaits
          </h3>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Découvrez pourquoi plus de {statsData.clients.count} clients nous font confiance pour leurs besoins de nettoyage professionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              asChild
            >
              <Link href="/contact#contact-form">
                Demander un devis
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              asChild
            >
              <Link href="/proprete-services">
                Voir nos services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllReviews;
