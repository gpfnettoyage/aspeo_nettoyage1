import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Handshake } from 'lucide-react';

const partners = [
  { src: '/img/partenaires/sh-recyclage.webp', alt: 'SH Recyclage' },
  { src: '/img/partenaires/green-speed.webp', alt: 'Green Speed' },
  { src: '/img/partenaires/boma.webp', alt: 'Boma' },
];

const PartnersSection = () => (
  <section className="py-16 bg-background">
    <div className="container">
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-4 bg-background border-border">
          <Handshake className="w-4 h-4 mr-2 text-primary" />
          Nos Partenaires
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Des <span className="text-primary">partenaires de confiance</span> pour un service d&apos;excellence
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Nous collaborons avec des entreprises reconnues pour garantir la qualité de nos services et offrir des solutions innovantes à nos clients.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 lg:gap-20">
        {partners.map((partner, index) => (
          <div key={index} className="flex flex-col items-center space-y-4 group">
            <div className="relative w-32 h-32 rounded-full border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 group-hover:border-primary/30">
              <Image
                src={partner.src}
                alt={partner.alt}
                loading="lazy"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <p className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors duration-300">
              {partner.alt}
            </p>
          </div>
        ))}
        
        <div className="flex flex-col items-center space-y-4 group">
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/30 shadow-lg bg-muted/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
            <p className="text-center text-sm text-muted-foreground px-4 text-xs leading-tight">
              Prochainement disponible
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground text-center group-hover:text-primary/70 transition-colors duration-300">
            Nouveau partenaire
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default PartnersSection;
