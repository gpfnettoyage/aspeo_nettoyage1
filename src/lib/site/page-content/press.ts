import { area, image, list, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Espace presse (/medias/presse). */
export const pressContent: PageContentModel = {
  key: 'presse',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Médias'),
        text('hero.title', 'Titre (H1)', 'Espace presse'),
        area('hero.text', 'Texte', "Retombées médias, communiqués et ressources pour les journalistes qui s'intéressent à ASPEO et au nettoyage professionnel dans la Loire et le Rhône."),
        image('hero.image', 'Photo de fond', IMG.equipeTertiaire),
      ],
    },
    {
      id: 'about', title: 'Présentation et contact presse',
      fields: [
        text('about.title', 'Titre', 'ASPEO en quelques mots'),
        area('about.text', 'Texte (ligne vide = nouveau paragraphe)', "Créée en 2024 à Panissières, dans la Loire, ASPEO est une entreprise de propreté qui intervient auprès des entreprises, des collectivités et des particuliers de la Plaine du Forez, des Monts du Lyonnais et du Roannais.\n\nL'entreprise s'est d'abord fait connaître sur des interventions délicates, comme le syndrome de Diogène ou les logements insalubres, avant de développer le nettoyage professionnel : bureaux et sièges sociaux, surfaces commerciales, sites industriels, hôtellerie-restauration, bases de vie de chantier et fin de chantier.\n\nSon parti pris : un interlocuteur unique, des équipes formées en interne et des produits écolabellisés, sur un territoire volontairement local."),
        text('contact.name', 'Contact presse — nom', 'Service communication ASPEO'),
        area('contact.text', 'Contact presse — texte', "Pour une interview, un reportage ou une demande d'information, nous vous répondons dans les meilleurs délais."),
      ],
    },
    {
      id: 'list', title: 'Parutions',
      fields: [
        text('list.title', 'Titre', 'Ils parlent de nous'),
        area('list.text', 'Texte', 'Articles, reportages et interviews consacrés à ASPEO et à ses équipes.'),
      ],
    },
    {
      id: 'kit', title: 'Kit média',
      fields: [
        text('kit.title', 'Titre', 'Kit média'),
        area('kit.text', 'Texte', "Les éléments utiles pour illustrer un article ou présenter l'entreprise, transmis sur simple demande."),
        list('kit.items', 'Éléments', 'Élément', [text('title', 'Titre', ''), area('text', 'Texte', ''), text('cta', 'Libellé du lien', ''), image('file', 'Fichier à télécharger (facultatif)', '')], [
          { title: 'Logos officiels', text: 'Versions couleur et blanche, en formats web et impression.', cta: 'Demander les logos', file: '' },
          { title: 'Photos haute définition', text: 'Équipes en intervention et chantiers, libres de droits pour la presse avec mention ASPEO.', cta: 'Demander les photos', file: '' },
          { title: "Fiche d'identité", text: "Date de création, zone d'intervention, activités et chiffres clés de l'entreprise.", cta: 'Demander la fiche', file: '' },
          { title: 'Communiqués', text: 'Annonces récentes : nouveaux services, nouveaux secteurs, partenariats.', cta: 'Demander les communiqués', file: '' },
        ], { max: 8, help: 'Sans fichier, le lien ouvre le formulaire de contact.' }),
      ],
    },
  ],
};
