import { Service } from '@/types/services';

/**
 * Normalise un titre en supprimant les caractères spéciaux et en comptant uniquement les caractères significatifs
 * @param title - Titre à normaliser
 * @returns Longueur normalisée du titre
 */
function getNormalizedLength(title: string): number {
  // Supprime les caractères spéciaux (slashes, espaces multiples, etc.) et compte les caractères significatifs
  return title
    .replace(/\s*\/\s*/g, ' ') // Remplace les slashes et espaces autour par un seul espace
    .replace(/\s*&\s*/g, ' ') // Remplace les & et espaces autour par un seul espace
    .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
    .trim()
    .length;
}

/**
 * Trie les services par longueur de titre (du plus court au plus long)
 * Utilise une longueur normalisée qui ignore les caractères spéciaux pour un tri plus cohérent
 * @param services - Tableau de services à trier
 * @returns Tableau de services triés par longueur de titre
 */
export function sortServicesByTitleLength(services: Service[]): Service[] {
  return [...services].sort((a, b) => {
    const lengthA = getNormalizedLength(a.title);
    const lengthB = getNormalizedLength(b.title);
    
    // Si les longueurs normalisées sont égales, on trie par ordre alphabétique
    if (lengthA === lengthB) {
      return a.title.localeCompare(b.title, 'fr', { 
        numeric: true, 
        sensitivity: 'base' 
      });
    }
    
    return lengthA - lengthB;
  });
}

