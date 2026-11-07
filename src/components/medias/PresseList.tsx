'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X, FileText, Download, Calendar } from 'lucide-react';

interface Presse {
  id: number;
  title: string;
  description: string;
  date: string;
  category?: string;
  fileSize?: string | null;
  pdfUrl: string;
}

interface PresseListProps {
  initialPresse: Presse[];
}

const PresseList = ({ initialPresse }: PresseListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous les documents');

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialPresse.forEach((presse) => {
      if (presse.category) {
        cats.add(presse.category);
      }
    });
    return ['Tous les documents', ...Array.from(cats).sort()];
  }, [initialPresse]);

  // Filtrer et rechercher
  const filteredPresse = useMemo(() => {
    let filtered = [...initialPresse];

    // Filtrer par catégorie
    if (selectedCategory !== 'Tous les documents') {
      filtered = filtered.filter((presse) => presse.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (presse) =>
          presse.title.toLowerCase().includes(query) ||
          presse.description.toLowerCase().includes(query) ||
          presse.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [initialPresse, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
        {/* Barre de recherche */}
        <div className="relative w-full md:w-auto md:max-w-md md:flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un document..."
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

      {/* Résultats */}
      {filteredPresse.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresse.map((presse) => (
            <Card key={presse.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  {presse.category && (
                    <Badge variant="outline" className="text-xs">
                      {presse.category}
                    </Badge>
                  )}
                </div>

                <CardTitle className="line-clamp-2 mb-2 leading-snug text-lg">
                  {presse.title}
                </CardTitle>

                <CardDescription className="line-clamp-2 text-sm flex-1 mb-3">
                  {presse.description}
                </CardDescription>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(presse.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {presse.fileSize && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{presse.fileSize}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full group-hover:shadow-md transition-shadow"
                  asChild
                >
                  <a
                    href={presse.pdfUrl}
                    download
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'Tous les documents'
              ? 'Aucun résultat trouvé pour votre recherche.'
              : 'Aucun document de presse disponible pour le moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PresseList;
