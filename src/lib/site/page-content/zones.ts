import { area, image, list, text, type PageContentModel } from './types';

/** Page « Zones d'intervention » et éléments communs des fiches villes. */
export const zonesContent: PageContentModel = {
  key: 'zones-intervention',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', "Zones d'intervention"),
        area('hero.title', 'Titre (H1)', "Nos secteurs\nd'intervention"),
        area('hero.text', 'Texte', "Depuis notre siège de Panissières, nos équipes rayonnent sur trois grands secteurs : le secteur central, la Plaine du Forez et l'ouest lyonnais. Trouvez votre commune ci-dessous."),
        image('hero.image', 'Photo de fond', '/img/site/nettoyage-pro-bureaux.webp'),
      ],
    },
    {
      id: 'sectors', title: 'Secteurs',
      fields: [
        list('sectors', 'Présentation des secteurs (le nom doit correspondre au champ « Secteur » des villes)', 'Secteur', [text('name', 'Nom du secteur', ''), area('intro', 'Présentation', '')], [
          { name: 'Secteur central', intro: 'Autour du siège de Panissières : les communes où nos équipes sont le plus souvent présentes.' },
          { name: 'Plaine du Forez', intro: "De Montbrison à Andrézieux-Bouthéon, un tissu dense d'entreprises, de commerces et de sites logistiques." },
          { name: 'Ouest lyonnais / Beaujolais', intro: "Des Monts du Lyonnais aux portes de Lyon, entre bourgs résidentiels et zones d'activité." },
        ], { max: 10 }),
        text('other.title', 'Encadré — titre', "Votre commune n'apparaît pas ?"),
        area('other.text', 'Encadré — texte', 'Nous intervenons aussi dans les communes voisines de ces secteurs. Indiquez-nous simplement votre adresse lors de votre demande.'),
      ],
    },
    {
      id: 'city', title: 'Fiches villes (textes communs)',
      fields: [
        area('city.servicesText', 'Texte « Tous nos services à… »', "Notre équipe intervient depuis Panissières sur l'ensemble de ces prestations, avec la même astreinte et le même niveau d'exigence."),
      ],
    },
  ],
};
