import { area, image, list, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Page d'accueil — textes et visuels de la maquette « Refonte Aspeo ». */
export const homeContent: PageContentModel = {
  key: 'accueil',
  sections: [
    {
      id: 'hero',
      title: 'Bandeau principal',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Propreté & services aux entreprises'),
        area('hero.title', 'Titre (H1)', "L'exigence du nettoyage professionnel, au service de vos environnements", { maxLength: 120 }),
        text('hero.leadStrong', 'Introduction — partie en gras', 'ASPEO accompagne entreprises, commerces et particuliers'),
        area('hero.lead', 'Introduction — suite', 'de Saint-Étienne à Roanne, de la Plaine du Forez aux Monts du Lyonnais, en nettoyage professionnel comme en interventions spécialisées. Trouvez votre prestation en un clic.'),
        text('hero.searchPlaceholder', 'Texte du champ de recherche', 'Un service, une ville, une réalisation…'),
        list('hero.images', 'Mosaïque de photos', 'Photo', [image('src', 'Image', ''), text('alt', 'Texte alternatif', '')], [
          { src: IMG.equipeTertiaire, alt: 'Équipe ASPEO en intervention de nettoyage tertiaire' },
          { src: IMG.baseDeVie, alt: "Base de vie de chantier autoroutier entretenue par ASPEO" },
          { src: IMG.commercial, alt: "Nettoyage d'une surface commerciale par ASPEO" },
          { src: IMG.vitres, alt: 'Deux agents ASPEO nettoyant une vitre' },
        ], { max: 4 }),
      ],
    },
    {
      id: 'missions',
      title: 'Nos missions',
      fields: [
        text('missions.title', 'Titre', 'Nos missions'),
        area('missions.text', 'Texte', "Depuis Panissières, nos équipes entretiennent chaque jour les locaux des entreprises et des collectivités, et interviennent sur les situations que d'autres refusent de traiter. Trois missions, une même exigence."),
        list('missions.cards', 'Cartes', 'Carte', [text('title', 'Titre', ''), image('image', 'Image', ''), text('href', 'Lien', '')], [
          { title: 'Entretenir vos espaces professionnels', image: IMG.equipeTertiaire, href: '/proprete-services/nettoyage-professionnel' },
          { title: 'Assainir les situations difficiles', image: IMG.insalubre, href: '/proprete-services/nettoyage-specialise' },
          { title: 'Accompagner les grands comptes', image: IMG.baseDeVie, href: '/grands-comptes' },
        ], { max: 3 }),
      ],
    },
    {
      id: 'environment',
      title: 'Engagement environnemental',
      fields: [
        text('env.eyebrow', 'Surtitre', 'Engagement environnemental'),
        area('env.title', 'Titre (retour à la ligne autorisé)', 'Un nettoyage\nplus responsable'),
        area('env.text', 'Texte', "Nettoyer, c'est utiliser des produits, de l'eau et produire des déchets. Nous réduisons cet impact à chaque passage, sans transiger sur le résultat, pour vos occupants comme pour nos équipes."),
        list('env.items', 'Engagements', 'Engagement', [text('title', 'Titre', ''), area('text', 'Texte', ''), area('proof', 'Preuve', '')], [
          { title: 'Des produits écolabellisés et probiotiques', text: "Nous privilégions des produits porteurs d'un écolabel et des solutions probiotiques, moins agressifs pour les surfaces, l'air intérieur et les utilisateurs.", proof: 'Fiches techniques et certificats des produits utilisés sur votre site transmis sur simple demande.' },
          { title: "Moins d'eau, moins de produit", text: "Le dosage est adapté à chaque surface plutôt qu'appliqué « à l'œil », et le travail en microfibre nettoie efficacement avec beaucoup moins d'eau.", proof: 'Protocole de dosage précisé dans le cahier des charges de votre contrat.' },
          { title: 'Des déchets triés et bien évacués', text: 'Sur les chantiers, les débarras et les logements encombrés, les déchets sont triés et dirigés vers les filières adaptées.', proof: "Filières d'évacuation utilisées pour votre intervention indiquées sur demande." },
        ], { max: 4 }),
        image('env.image', 'Photo', IMG.exterieur),
        text('env.imageAlt', 'Texte alternatif de la photo', "Nettoyage extérieur d'un site d'entreprise par ASPEO"),
      ],
    },
    {
      id: 'process',
      title: 'Comment ça se passe',
      fields: [
        image('process.image', 'Photo', IMG.clientHeureux),
        text('process.imageAlt', 'Texte alternatif', 'Client ASPEO satisfait après une intervention'),
        text('process.badgeValue', 'Encadré — valeur', '24h'),
        text('process.badgeText', 'Encadré — texte', 'pour recevoir votre devis après la visite'),
        text('process.eyebrow', 'Surtitre', 'Travailler avec ASPEO'),
        text('process.title', 'Titre', 'Comment ça se passe'),
        area('process.text', 'Introduction', "Un seul interlocuteur vous accompagne du premier appel jusqu'au suivi de votre contrat. Pas de plateforme, pas d'intermédiaire."),
        list('process.steps', 'Étapes', 'Étape', [text('title', 'Titre', ''), area('text', 'Texte', '')], [
          { title: 'Tout commence par un échange', text: "Par téléphone ou via le formulaire, vous nous décrivez vos locaux ou la situation à traiter. Un interlocuteur ASPEO vous rappelle pour préciser votre besoin, vos contraintes d'accès et vos horaires." },
          { title: 'Nous venons voir avant de chiffrer', text: "La visite sur place nous permet d'évaluer les surfaces, les matériaux et les contraintes réelles. Vous recevez ensuite, sous 24h après la visite, un devis détaillé, clair et sans engagement, sans ligne floue ni supplément caché." },
          { title: 'Puis nous intervenons, et nous restons présents', text: "Une équipe formée intervient selon le planning convenu. Chaque passage fait l'objet d'un contrôle qualité, et nous faisons régulièrement le point avec vous pour ajuster la prestation à l'évolution de vos besoins." },
        ], { max: 5 }),
      ],
    },
    {
      id: 'testimonials',
      title: 'Avis clients',
      fields: [
        text('testimonials.title', 'Titre', 'Ce que disent nos clients'),
        area('testimonials.text', 'Texte', 'La satisfaction de nos clients témoigne de notre engagement quotidien. Survolez pour mettre la lecture en pause.'),
      ],
    },
    {
      id: 'why',
      title: 'Pourquoi choisir ASPEO',
      fields: [
        text('why.eyebrow', 'Surtitre', 'Nos avantages'),
        text('why.title', 'Titre', 'Pourquoi choisir ASPEO ?'),
        area('why.text', 'Introduction', "Choisir un prestataire de propreté, c'est confier ses locaux, ses clés et parfois son image. Voici ce qui fait la différence au quotidien."),
        list('why.items', 'Avantages', 'Avantage', [text('title', 'Titre', ''), area('text', 'Texte', '')], [
          { title: 'Une expertise entretenue', text: "Nos équipes sont formées en continu aux techniques d'hygiène les plus exigeantes et travaillent avec du matériel professionnel. Chaque intervention suit un protocole précis, pour un résultat homogène d'un passage à l'autre." },
          { title: 'Une relation transparente', text: 'Contrôles qualité planifiés, compte rendu détaillé, interlocuteur unique et devis clair sous 24h après la visite : vous savez à tout moment ce qui est fait, quand et par qui.' },
        ], { max: 2 }),
        list('why.images', 'Photos', 'Photo', [image('src', 'Image', ''), text('alt', 'Texte alternatif', '')], [
          { src: IMG.equipes, alt: 'Les équipes ASPEO' },
          { src: IMG.equipeTertiaire, alt: 'Agents ASPEO dans des bureaux' },
          { src: IMG.commercial, alt: 'Entretien de surface commerciale' },
          { src: IMG.vitres, alt: 'Lavage de vitres professionnel' },
        ], { max: 4 }),
      ],
    },
    {
      id: 'featured',
      title: 'Réalisation à la une',
      fields: [
        text('featured.eyebrow', 'Surtitre', 'Réalisation à la une'),
        text('featured.slug', 'Réalisation affichée (identifiant URL, vide = première réalisation « à la une »)', ''),
      ],
    },
    {
      id: 'zones',
      title: 'Zones',
      fields: [
        text('zones.title', 'Titre', 'De Panissières à Lyon, une équipe proche de vous'),
        area('zones.text', 'Texte', "Basée à Panissières, ASPEO intervient dans toute la Plaine du Forez, les Monts du Lyonnais et le Roannais, ainsi qu'à Saint-Étienne et dans l'agglomération lyonnaise."),
        list('zones.chips', 'Communes mises en avant', 'Commune', [text('label', 'Libellé', ''), text('href', 'Lien (facultatif)', '')], [
          { label: 'Montbrison', href: '/ville/montbrison' },
          { label: 'Feurs', href: '/ville/feurs' },
          { label: 'Saint-Symphorien-sur-Coise', href: '/ville/saint-symphorien-sur-coise' },
          { label: 'Roanne', href: '' },
          { label: 'Saint-Étienne & Lyon', href: '' },
        ], { max: 8 }),
        image('zones.image', 'Photo', IMG.cuisineAvantApres),
        text('zones.imageAlt', 'Texte alternatif', 'Cuisine avant et après remise en état par ASPEO'),
      ],
    },
    {
      id: 'cta',
      title: "Bandeau d'appel",
      fields: [
        text('cta.title', 'Titre', "Un besoin de propreté ? On s'en occupe."),
        area('cta.text', 'Texte', 'Bureaux, commerce, chantier ou logement : décrivez-nous la situation, un interlocuteur ASPEO vous rappelle pour fixer une visite et vous remettre un devis clair.'),
        image('cta.image', 'Photo de fond', IMG.equipeTertiaire),
      ],
    },
    {
      id: 'reviews',
      title: 'Avis Google et logos clients',
      fields: [
        text('reviews.label', 'Libellé', 'Vous avez été satisfait ? Laissez-nous un avis'),
        list('reviews.logos', 'Logos clients (avec accord des clients)', 'Logo', [image('src', 'Logo', ''), text('alt', 'Nom du client', '')], [
          { src: '/img/clients/3-petits-chats.webp', alt: '3 Petits Chats' },
          { src: '/img/clients/adlg.webp', alt: 'ADLG' },
          { src: '/img/clients/bc-informatique.webp', alt: 'BC Informatique' },
          { src: '/img/clients/car-protek.webp', alt: 'Car Protek' },
          { src: '/img/clients/fitness24.webp', alt: 'Fitness 24' },
          { src: '/img/clients/l-orange-bleue-souzy.webp', alt: "L'Orange Bleue Souzy" },
          { src: '/img/clients/studio-phenix.webp', alt: 'Studio Phénix' },
        ], { max: 12, help: 'Logos repris du site actuel.' }),
      ],
    },
    {
      id: 'news',
      title: 'Actualités et presse',
      fields: [
        text('news.eyebrow', 'Surtitre actualités', 'Actualités'),
        text('news.title', 'Titre actualités', 'Nos dernières actualités'),
        text('press.eyebrow', 'Surtitre presse', 'Presse'),
        text('press.title', 'Titre presse', 'Ils parlent de nous'),
      ],
    },
  ],
};
