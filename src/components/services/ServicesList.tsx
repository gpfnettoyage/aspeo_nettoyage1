'use client';
import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { ServiceWithContentAndCategory } from '@/types/services';

interface ServicesListProps {
  services: ServiceWithContentAndCategory[];
}

const ServicesList = ({ services }: ServicesListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous les services');

  // Extraire les catégories uniques, triées par displayOrder
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    services.forEach((service) => {
      if (service.category) {
        catMap.set(service.category.name, service.category.displayOrder);
      }
    });

    // Trier par displayOrder
    const sortedCategories = Array.from(catMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name);

    return ['Tous les services', ...sortedCategories];
  }, [services]);

  // Filtrer et rechercher
  const filteredServices = useMemo(() => {
    let filtered = [...services];

    // Filtrer par catégorie
    if (selectedCategory !== 'Tous les services') {
      filtered = filtered.filter((service) => service.category?.name === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.descriptions[0]?.toLowerCase().includes(query)
      );
    }

    // Trier par displayOrder de la catégorie
    filtered.sort((a, b) => {
      const orderA = a.category?.displayOrder ?? 999;
      const orderB = b.category?.displayOrder ?? 999;
      return orderA - orderB;
    });

    return filtered;
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
        {/* Barre de recherche */}
        <div className="relative w-full md:w-auto md:max-w-md md:flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres par catégorie */}
        {categories.length > 1 && (
          <>
            {/* Mobile: colonne */}
            <div className="flex flex-wrap gap-2 w-full md:hidden">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? '' : 'bg-white'}
                >
                  {category}
                </Button>
              ))}
            </div>
            {/* Desktop: scroll horizontal à droite */}
            <div className="hidden md:flex items-center ml-auto max-w-[calc(100%-28rem)] min-w-0">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 p-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? '' : 'bg-white flex-shrink-0'}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </>
        )}
      </div>

      {/* Résultats */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredServices.map((service) => {
            const ServiceCard = () => {
              const imageRef = useRef<HTMLDivElement>(null);
              const contentRef = useRef<HTMLDivElement>(null);
              const descriptionRef = useRef<HTMLParagraphElement>(null);

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
                  href={`/proprete-services/${service.slug}`}
                  className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 cursor-pointer bg-white w-full aspect-[2/1] sm:aspect-[4/5]"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div ref={imageRef} className="absolute inset-0 transition-transform duration-500">
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  </div>

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/50 sm:bg-transparent sm:bg-gradient-to-t sm:from-black/80 sm:via-black/40 sm:to-transparent"></div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 p-3 sm:p-4 flex flex-col sm:justify-end text-white">
                    <div ref={contentRef} className="transform transition-transform duration-300 my-auto sm:my-0">
                      <h3 className="text-base sm:text-lg font-bold mb-1 leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-200 mb-2 font-medium">
                        {service.subtitle}
                      </p>
                      <p ref={descriptionRef} className="text-xs sm:text-sm text-gray-200 leading-relaxed opacity-0 transition-opacity duration-300 line-clamp-4">
                        {service.descriptions[0]}
                      </p>
                    </div>
                  </div>

                  {/* Hover border effect */}
                  <div className="absolute inset-0 rounded-lg transition-colors duration-300"></div>
                </Link>
              );
            };

            return <ServiceCard key={service.id} />;
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'Tous les services'
              ? 'Aucun résultat trouvé pour votre recherche.'
              : 'Aucun service disponible pour le moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicesList;


