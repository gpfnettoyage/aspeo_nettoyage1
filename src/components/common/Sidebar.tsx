'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { COMPANY } from '@/constants/company';
import statsData from '@/data/stats.json';
import { ServiceWithContent } from '@/types/services';

interface SidebarProps {
  currentServiceSlug?: string;
  services?: ServiceWithContent[];
  hideRelatedServices?: boolean;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentServiceSlug,
  services = [],
  hideRelatedServices = false,
  className = ''
}) => {
  // Filter out the current service if provided, and limit to 5 services
  const otherServices = services
    .filter((s) => !currentServiceSlug || s.slug !== currentServiceSlug)
    .slice(0, 5);

  return (
    <aside className={`space-y-6 lg:sticky lg:top-24 ${className}`}>
      {/* Card 1: Demander un Devis */}
      <Card className="bg-primary text-white border-0 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-xl md:text-2xl font-bold text-white">
            Besoin d&apos;un devis ?
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <p className="text-white/90 text-sm leading-relaxed">
            Obtenez une estimation gratuite et personnalisée pour vos besoins de nettoyage sous {statsData.response.time}.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full font-semibold group shadow-md hover:shadow-xl transition-all"
            asChild
          >
            <Link href="/contact#contact-form">
              Demander un Devis
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Card 2: Nous contacter */}
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-bold flex items-center text-gray-900">
            <Phone className="w-5 h-5 mr-2 text-primary" />
            Nous contacter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-start group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Téléphone</p>
              <a href={`tel:${COMPANY.phoneValue}`} className="text-base font-bold text-gray-900 hover:text-primary transition-colors">
                {COMPANY.phone}
              </a>
            </div>
          </div>
          <Separator />
          <div className="flex items-start group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <a href={`mailto:${COMPANY.email}`} className="text-base font-bold text-gray-900 hover:text-primary transition-colors break-all">
                {COMPANY.email}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
     
      {/* Card 3: Services Connexes - Conditionally Hidden */}
      {!hideRelatedServices && (
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 bg-gray-50/50 border-b">
            <CardTitle className="text-lg font-bold flex items-center text-gray-900">
              <Star className="w-5 h-5 mr-2 text-primary" />
              Services Connexes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <ul className="divide-y">
              {otherServices.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/proprete-services/${service.slug}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-1">
                      {service.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};

export default Sidebar;
