import { image, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Page « Avis clients ». */
export const reviewsContent: PageContentModel = {
  key: 'avis',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Avis Clients'),
        text('hero.title', 'Titre (H1)', 'Ce que disent nos clients'),
        image('hero.image', 'Photo de fond', IMG.clientHeureux),
      ],
    },
  ],
};
