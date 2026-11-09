import { area, image, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Page « Médias » (actualités). */
export const mediasContent: PageContentModel = {
  key: 'medias',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Médias'),
        area('hero.title', 'Titre (H1)', 'Nos\nActualités'),
        area('hero.text', 'Texte', "Retrouvez nos actualités, retours d'expérience et conseils d'experts sur le nettoyage professionnel à Saint-Étienne, Roanne, Feurs, Montbrison et Lyon."),
        image('hero.image', 'Photo de fond', IMG.baseDeVie),
      ],
    },
  ],
};
