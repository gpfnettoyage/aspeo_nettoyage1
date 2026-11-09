import { area, text, type PageContentModel } from './types';
import { LEGAL_TEXTS } from './legal-texts';

const TITLES: Record<string, string> = {
  'mentions-legales': 'Mentions légales',
  'politique-de-confidentialite': 'Politique de confidentialité',
  'conditions-generales-d-utilisation': "Conditions générales d'utilisation",
  'politique-des-cookies': 'Politique de cookies',
};

/** Pages légales : un titre et un texte Markdown (« ## » = titre d'article). */
export const legalContents: PageContentModel[] = Object.entries(TITLES).map(([key, title]) => ({
  key,
  sections: [{
    id: 'body', title: 'Contenu',
    fields: [
      text('title', 'Titre (H1)', title),
      area('body', 'Texte (Markdown : « ## » pour un titre d\'article, ligne vide entre les paragraphes)', LEGAL_TEXTS[key] ?? ''),
    ],
  }],
}));
