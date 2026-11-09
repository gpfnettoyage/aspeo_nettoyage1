import { area, image, text, type PageContentModel } from './types';

/** Page « Contact & devis ». */
export const contactContent: PageContentModel = {
  key: 'contact',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Contact'),
        text('hero.title', 'Titre (H1)', 'Contactez-nous & obtenez votre devis'),
        text('hero.text', 'Texte', 'Devis gratuit et sans engagement.'),
        image('hero.image', 'Photo de fond', '/img/site/bureaux-aspeo.webp'),
      ],
    },
    {
      id: 'form', title: 'Formulaire',
      fields: [
        text('form.title', 'Titre', 'Contactez-nous dès maintenant'),
        area('form.text', 'Texte', 'Remplissez ce formulaire et recevez votre devis personnalisé sous 24h après la visite.'),
      ],
    },
    {
      id: 'aside', title: 'Colonne de droite',
      fields: [
        text('aside.ctaTitle', 'Encadré orange — titre', "Besoin d'un devis rapide ?"),
        area('aside.ctaText', 'Encadré orange — texte', 'Devis gratuit sous 24h après la visite · Visite technique sur site · Contrat adapté à votre activité.'),
      ],
    },
  ],
};
