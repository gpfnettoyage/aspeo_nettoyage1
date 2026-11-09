import { area, image, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Page « Nos réalisations ». */
export const realisationsContent: PageContentModel = {
  key: 'realisations',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Médias · Réalisations'),
        text('hero.title', 'Titre (H1)', 'Nos réalisations'),
        area('hero.text', 'Texte', "Chaque chantier, du contexte au résultat : ce que nous avons trouvé sur place, les contraintes du site et la façon dont nous l'avons traité."),
        image('hero.image', 'Photo de fond', IMG.finDeChantier),
        area('intro', 'Introduction', 'Une photo seule ne dit pas grand-chose. Pour chaque intervention, nous présentons le type de site, les contraintes rencontrées, la méthode employée et ce qui a été livré au client. Bureaux et sièges sociaux, surfaces commerciales, bases de vie, fin de chantier, toitures photovoltaïques ou logements très dégradés : voici comment nous travaillons concrètement, en Loire et dans le Rhône.'),
      ],
    },
    {
      id: 'detail', title: 'Fiche chantier (textes communs)',
      fields: [
        text('detail.ctaTitle', 'Encadré — titre', 'Un site comparable à faire entretenir ?'),
        area('detail.ctaText', 'Encadré — texte', 'Décrivez-nous votre besoin : devis gratuit sous 24h après la visite, visite technique si nécessaire.'),
      ],
    },
  ],
};
