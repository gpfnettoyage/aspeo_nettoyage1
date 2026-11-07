import { area, image, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Catalogue « Propreté & Services ». */
export const servicesContent: PageContentModel = {
  key: 'proprete-services',
  sections: [
    {
      id: 'hero',
      title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Propreté & Services'),
        area('hero.title', 'Titre (H1)', 'Nos Services : Nettoyage Professionnel & Interventions Spécialisées'),
        area('hero.text', 'Texte', "De l'entretien régulier de vos locaux aux interventions spécialisées : trouvez la prestation adaptée à votre besoin."),
        image('hero.image', 'Photo de fond', IMG.vitres),
      ],
    },
    {
      id: 'intro',
      title: 'Introduction',
      fields: [
        area('intro.aside', 'Texte de la colonne gauche', 'Nettoyage professionnel régulier et interventions spécialisées à forte valeur ajoutée : deux expertises complémentaires, une seule équipe.'),
        area('intro.lead', 'Accroche', 'Chez ASPEO, chaque situation appelle une réponse différente. Un entretien de bureaux ne se traite pas comme un dégât des eaux, un syndrome de Diogène ne se traite pas comme une fin de chantier.'),
        area('intro.body', 'Paragraphe', "C'est pourquoi nous avons développé deux pôles d'expertise complémentaires : le nettoyage professionnel (bureaux et sièges sociaux, surfaces commerciales, bases de vie, fin de chantier) pour un entretien régulier et fiable, et les interventions spécialisées (syndrome de Diogène, logement insalubre, désinfection, remise en état) pour les situations les plus exigeantes. Une équipe basée à Panissières intervient en Plaine du Forez, Monts du Lyonnais et Roannais, avec un devis gratuit établi sous 24h après la visite."),
      ],
    },
    {
      id: 'cta',
      title: "Panneau d'appel",
      fields: [
        text('cta.eyebrow', 'Surtitre', 'Un besoin spécifique ?'),
        text('cta.title', 'Titre', 'Parlons de votre projet'),
        area('cta.text', 'Texte', 'Nos équipes vous accompagnent pour définir la solution la plus adaptée à vos besoins et à vos contraintes.'),
        image('cta.image', 'Photo', IMG.clientHeureux),
      ],
    },
  ],
};
