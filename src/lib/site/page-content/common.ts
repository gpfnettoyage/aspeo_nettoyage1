import { area, list, text, type PageContentModel } from './types';

/** Blocs réutilisés sur plusieurs pages (fiches services…). */
export const commonContent: PageContentModel = {
  key: 'blocs-communs',
  sections: [
    {
      id: 'commitments',
      title: 'Engagements (fiches services professionnelles)',
      fields: [
        list('commitments', 'Engagements', 'Engagement', [text('t', 'Titre', ''), area('d', 'Texte', '')], [
          { t: 'Un interlocuteur unique du premier appel à la remise des lieux', d: "Pas de succession d'intervenants anonymes : la même personne suit votre dossier, coordonne l'intervention et reste joignable en cas de question." },
          { t: 'Un rapport détaillé après chaque intervention', d: "Diagnostic, actions menées, photos avant/après : vous disposez d'un document clair, utile pour votre dossier d'assurance, votre syndic ou votre propre suivi." },
          { t: 'Des équipes formées à chaque type de mission', d: "Entretien régulier de bureaux, base de vie de chantier ou syndrome de Diogène : nos techniciens sont formés autant à la technique qu'à l'accompagnement humain de ces situations." },
        ], { max: 6 }),
      ],
    },
  ],
};
