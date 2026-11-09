import { area, image, list, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Page « Nous rejoindre ». Les offres d'emploi sont gérées dans Contenus > Offres d'emploi. */
export const careersContent: PageContentModel = {
  key: 'nous-rejoindre',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Recrutement'),
        text('hero.title', 'Titre (H1)', 'Rejoignez les équipes ASPEO'),
        area('hero.text', 'Texte', "Agents, chefs d'équipe, laveurs de vitres, techniciens : nous recrutons dans la Loire et le Rhône, avec ou sans expérience. Formation assurée en interne."),
        image('hero.image', 'Photo de fond', IMG.equipes),
      ],
    },
    {
      id: 'work', title: 'Travailler chez ASPEO',
      fields: [
        text('work.title', 'Titre', 'Travailler chez ASPEO'),
        area('work.text', 'Texte (ligne vide = nouveau paragraphe)', "Chez ASPEO, chaque agent est titulaire de ses sites : vous connaissez vos clients, ils vous connaissent. Pas de remplacement au hasard d'un jour à l'autre, mais un planning stable, au plus près de chez vous.\n\nNous formons nos équipes en interne, aux techniques comme à la sécurité, et nous faisons évoluer ceux qui le souhaitent vers des postes de chef d'équipe ou de technicien spécialisé."),
        image('work.image', 'Photo', IMG.equipeTertiaire),
      ],
    },
    {
      id: 'offer', title: 'Ce que nous offrons',
      fields: [
        text('offer.title', 'Titre', 'Ce que nous vous offrons'),
        list('offer.items', 'Avantages', 'Avantage', [text('title', 'Titre', ''), area('text', 'Texte', '')], [
          { title: 'Un planning stable', text: 'Des horaires réguliers et des sites proches de votre domicile.' },
          { title: 'Une formation interne', text: 'Techniques, produits, sécurité : vous êtes accompagné dès le premier jour.' },
          { title: 'Du matériel fourni', text: 'Tenue, équipements de protection et matériel professionnel entretenu.' },
          { title: 'Une vraie évolution', text: "Possibilité d'évoluer vers chef d'équipe ou technicien spécialisé." },
        ], { max: 6 }),
      ],
    },
    {
      id: 'jobs', title: 'Offres',
      fields: [
        text('jobs.title', 'Titre', "Nos offres d'emploi"),
        area('jobs.text', 'Texte', 'Cliquez sur une offre pour voir le détail, puis postulez directement en ligne avec votre CV.'),
        text('spontaneous.title', 'Candidature spontanée — titre', 'Candidature spontanée'),
        area('spontaneous.text', 'Candidature spontanée — texte', "Aucune offre ne correspond à votre profil ? Envoyez-nous votre candidature : nous la conservons et revenons vers vous dès qu'un poste se libère près de chez vous."),
      ],
    },
  ],
};
