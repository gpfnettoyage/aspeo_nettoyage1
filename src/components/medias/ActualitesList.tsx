'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X, Newspaper, Clock } from 'lucide-react';
import { Actualite } from '@/types/actualites';

interface ActualitesListProps {
  initialActualites: Actualite[];
}

const ActualitesList = ({ initialActualites }: ActualitesListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les actualités');

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialActualites.forEach((actualite) => {
      if (actualite.category) {
        cats.add(actualite.category);
      }
    });
    return ['Toutes les actualités', ...Array.from(cats).sort()];
  }, [initialActualites]);

  // Filtrer et rechercher
  const filteredActualites = useMemo(() => {
    let filtered = [...initialActualites];

    // Filtrer par catégorie
    if (selectedCategory !== 'Toutes les actualités') {
      filtered = filtered.filter((actualite) => actualite.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (actualite) =>
          actualite.title.toLowerCase().includes(query) ||
          actualite.excerpt.toLowerCase().includes(query) ||
          actualite.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [initialActualites, selectedCategory, searchQuery]);

  const hasNoActualites = initialActualites.length === 0;
  const isEmptyState = hasNoActualites && !searchQuery && selectedCategory === 'Toutes les actualités';

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres - Masquée s'il n'y a pas d'actualités */}
      {!hasNoActualites && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
          {/* Barre de recherche */}
          <div className="relative w-full md:w-auto md:max-w-md md:flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
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
              <div className="hidden md:flex items-center flex-shrink-0">
                <ScrollArea className="whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
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
      )}

      {/* Résultats */}
      {filteredActualites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActualites.map((actualite) => (
            <Card key={actualite.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src={actualite.image}
                  alt={actualite.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {actualite.category && (
                  <Badge className="absolute top-3 right-3 bg-primary/90 text-xs">
                    {actualite.category}
                  </Badge>
                )}
              </div>
              <CardHeader className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(actualite.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons/icon-32x32.png"
                      alt="Aspeo"
                      width={20}
                      height={20}
                      className="opacity-60"
                    />
                    <span className="text-xs text-muted-foreground">Équipe Aspeo</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-2 mb-2 leading-snug pb-0.5 text-lg">{actualite.title}</CardTitle>
                <CardDescription className="line-clamp-3 text-sm flex-1">
                  {actualite.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href={`/medias/actualites/${actualite.slug}`}
                  className="text-primary hover:underline font-medium text-sm inline-flex items-center"
                >
                  Lire la suite
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          {isEmptyState ? (
            <>
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
                </div>
                <div className="relative z-10 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Newspaper className="w-14 h-14 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Les actualités arrivent bientôt
              </h3>
              <p className="text-muted-foreground text-base md:text-lg max-w-lg text-center leading-relaxed mb-8">
                Nous préparons du contenu passionnant pour vous. Revenez bientôt pour découvrir nos dernières actualités !
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">À venir prochainement</span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                Aucun résultat trouvé pour votre recherche.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActualitesList;

