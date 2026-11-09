import { area, image, list, text, type PageContentModel } from './types';
import { IMG } from './images';

const item = (title: string, text: string) => ({ title, text });

/** Page « Grands Comptes & Marchés Publics ». Délais et pièces du dossier : à confirmer par ASPEO. */
export const accountsContent: PageContentModel = {
  key: 'grands-comptes',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Grands Comptes & Marchés Publics'),
        area('hero.title', 'Titre (H1)', 'Votre prestataire de propreté pour les contrats multi-sites et les marchés publics'),
        area('hero.text', 'Texte', "ASPEO accompagne grandes enseignes, mairies et collectivités, groupes industriels, établissements d'hôtellerie-restauration et entreprises de BTP dans la durée, avec un interlocuteur unique et un cadre contractuel clair."),
        image('hero.image', 'Photo de fond', IMG.baseDeVie),
      ],
    },
    {
      id: 'brief', title: 'En bref pour les acheteurs',
      fields: [
        text('brief.title', 'Titre', 'ASPEO en bref pour les acheteurs'),
        list('brief.items', 'Points clés', 'Point', [text('title', 'Titre', ''), text('text', 'Texte', '')], [
          item('Un interlocuteur unique', 'Du devis à la facturation, pour tous vos sites.'),
          item('Proposition sous 5 jours ouvrés', 'Après réception de votre cahier des charges.'),
          item('Dossier administratif à jour', 'Kbis, URSSAF, fiscal, RC Pro transmis sur demande.'),
          item('Reporting à chaque passage', 'Fiche de contrôle et point qualité régulier.'),
          item('Loire, Rhône et alentours', 'Plaine du Forez, Monts du Lyonnais, Roannais, Lyon Ouest.'),
        ], { max: 6 }),
        area('intro', 'Introduction (ligne vide = nouveau paragraphe)', "Réseaux de commerces, groupes industriels, chaînes d'hôtellerie-restauration, concessionnaires autoroutiers, entreprises de travaux publics et collectivités font appel à ASPEO pour l'entretien de leurs sites multiples : bureaux, surfaces de vente, sites de production, établissements recevant du public, bases de vie de chantier. Nous nous adaptons aux exigences propres aux grands comptes et aux marchés publics : cahier des charges strict, reporting régulier et continuité de service sur toute la durée du contrat, quel que soit le nombre de sites concernés.\n\nPour les grandes enseignes et les réseaux commerciaux, nous adaptons nos passages aux horaires d'ouverture et à l'affluence de chaque point de vente. Pour les mairies et collectivités, nous fournissons l'ensemble des documents administratifs et attestations nécessaires à votre dossier de marché. Pour l'industrie, nous intervenons sans interrompre l'activité continue de vos sites de production, et pour l'hôtellerie-restauration, nous appliquons des protocoles conformes aux normes d'hygiène du secteur. Pour les marchés liés au BTP et aux infrastructures, notre connaissance des axes structurants de la région — A47, A6, A72, RN7, RN82 — et des acteurs qui y interviennent nous permet d'intégrer rapidement les exigences HSE et SPS de chaque chantier, en coordination avec les conducteurs de travaux et les coordinateurs de sécurité."),
      ],
    },
    {
      id: 'setup', title: 'Ce que nous mettons en place',
      fields: [
        text('setup.title', 'Titre', 'Ce que nous mettons en place'),
        list('setup.items', 'Éléments', 'Élément', [text('title', 'Titre', ''), area('text', 'Texte', '')], [
          item('Un interlocuteur unique', 'Un même référent suit votre contrat du devis à la facturation, quel que soit le nombre de sites concernés.'),
          item('Conformité HSE & habilitations', "Personnel formé aux plans de prévention, PPSPS et habilitations requises en zone de chantier ou d'emprise autoroutière."),
          item('Reporting & traçabilité', "Compte-rendu d'intervention à chaque passage, transmis au donneur d'ordre selon le format et la fréquence convenus."),
          item('Couverture multi-sites', "Une organisation capable de couvrir plusieurs sites répartis sur la Plaine du Forez, les Monts du Lyonnais et le Roannais, quel que soit leur secteur d'activité."),
          item('Assurance & conformité contractuelle', "Attestation d'assurance responsabilité civile professionnelle fournie sur demande, cadre contractuel adapté aux exigences des marchés publics."),
          item('Réactivité sur incident', "Une organisation capable de mobiliser rapidement une équipe supplémentaire en cas d'imprévu sur un site en exploitation."),
        ], { max: 10 }),
      ],
    },
    {
      id: 'commitments', title: 'Engagements contractuels',
      fields: [
        text('commit.title', 'Titre', 'Nos engagements contractuels'),
        area('commit.text', 'Texte', 'Ce qui est écrit dans le contrat est ce qui est tenu sur le terrain. Ces engagements sont repris dans notre proposition et adaptés à votre cahier des charges.'),
        list('commit.rows', 'Engagements', 'Engagement', [text('title', 'Intitulé', ''), area('text', 'Description', '')], [
          item('Continuité de service', 'Remplacement de tout agent absent sans intervention de votre part, avec un agent déjà formé à votre site.'),
          item('Contrôle qualité', 'Fiche de contrôle à chaque passage, audit qualité planifié et compte rendu transmis à votre référent.'),
          item('Traitement des réclamations', 'Prise en compte le jour même et action corrective planifiée, avec retour écrit au demandeur.'),
          item('Sécurité et conformité', 'Plan de prévention, accueil sécurité de vos sites et EPI adaptés, en coordination avec votre responsable HSE.'),
          item('Pilotage du contrat', "Point de suivi régulier, indicateurs partagés et ajustement des prestations selon l'évolution de vos besoins."),
          item('Facturation', 'Une facture par site ou consolidée, selon votre organisation comptable, avec le détail des prestations réalisées.'),
        ], { max: 10 }),
      ],
    },
    {
      id: 'sectors', title: 'Secteurs accompagnés',
      fields: [
        text('sectors.title', 'Titre', 'Secteurs accompagnés'),
        area('sectors.intro', 'Introduction', "Nos clients grands comptes n'ont pas les mêmes contraintes, et c'est précisément ce qui guide notre organisation sur chaque contrat."),
        list('sectors.items', 'Secteurs', 'Secteur', [text('title', 'Secteur', ''), area('text', 'Texte', '')], [
          item('Réseaux commerciaux.', "Grandes enseignes (sport, distribution), commerces et surfaces de vente sur plusieurs communes, avec un passage calé sur vos horaires d'ouverture et d'affluence."),
          item('Collectivités & marchés publics.', 'Mairies, bâtiments publics, équipements municipaux, marchés à procédure adaptée ou formalisée, avec les documents administratifs requis pour votre dossier.'),
          item('Industrie.', "Ateliers de production, entrepôts logistiques, zones de circulation et quais de chargement, sans interrompre l'activité continue de vos sites."),
          item('Hôtellerie & restauration.', "Établissements multi-sites, chaînes et groupes hôteliers de la région, avec des protocoles adaptés aux normes d'hygiène du secteur."),
          item('BTP & infrastructures.', "Bases de vie de chantier, emprises autoroutières, fin de chantier avant livraison. Nos équipes s'adaptent aux contraintes d'accès et de sécurité propres à chaque site."),
        ], { max: 8 }),
        text('ref.title', 'Référencement — titre', 'Un prestataire de propreté professionnelle référencé sur la Loire et le Rhône'),
        area('ref.text', 'Référencement — texte (ligne vide = nouveau paragraphe)', "ASPEO répond aux appels d'offres de nettoyage professionnel et aux demandes de référencement fournisseur émanant de mairies, d'établissements publics, de grandes enseignes et de groupes industriels implantés en Plaine du Forez, dans les Monts du Lyonnais et le Roannais. Notre structure est en mesure de fournir un devis détaillé multi-sites, un cadre contractuel adapté aux marchés publics à procédure adaptée (MAPA) et un suivi régulier documenté pour chaque prestation réalisée.\n\nQue votre besoin porte sur l'entretien courant de locaux communaux, la propreté d'un réseau de magasins, la gestion d'une base de vie de chantier ou la remise en état d'un site industriel, notre équipe commerciale étudie votre cahier des charges et revient vers vous avec une proposition chiffrée sous 5 jours ouvrés."),
      ],
    },
    {
      id: 'method', title: 'Méthode',
      fields: [
        text('method.title', 'Titre', 'Comment nous mettons en place un contrat grand compte'),
        list('method.steps', 'Étapes', 'Étape', [text('title', 'Titre', ''), area('text', 'Texte', ''), text('duration', 'Délai', '')], [
          { title: 'Étude du cahier des charges', text: "Analyse du marché ou de l'appel d'offres, des sites concernés et des contraintes spécifiques (HSE, accès, horaires).", duration: 'Sous 48h' },
          { title: 'Proposition & cadrage contractuel', text: "Devis détaillé par site, planning d'intervention et modalités de reporting convenues avec votre référent achats.", duration: 'Sous 5 jours' },
          { title: 'Déploiement sur site', text: 'Mise en place des équipes formées, habilitées et équipées selon les exigences propres à chaque site ou chantier.', duration: 'Selon planning' },
          { title: 'Suivi & reporting régulier', text: "Comptes-rendus périodiques, point de suivi avec votre référent et ajustement du contrat selon l'évolution de vos besoins.", duration: 'En continu' },
        ], { max: 8 }),
      ],
    },
    {
      id: 'documents', title: 'Pièces du dossier',
      fields: [
        text('docs.title', 'Titre', 'Ce que nous fournissons pour votre dossier'),
        area('docs.text', 'Texte', "Les pièces administratives et techniques demandées lors d'une consultation, d'un appel d'offres ou d'un référencement fournisseur, transmises sur simple demande."),
        list('docs.items', 'Pièces', 'Pièce', [text('title', 'Pièce', ''), area('text', 'Précision', '')], [
          item('Extrait Kbis', 'De moins de 3 mois, à jour à la date de la consultation.'),
          item('Attestation de vigilance URSSAF', 'Renouvelée tous les 6 mois, conformément au Code du travail.'),
          item('Attestation de régularité fiscale', 'Justifiant que nos obligations fiscales sont à jour.'),
          item('Assurance RC Professionnelle', 'Attestation en cours de validité, avec les montants de garantie.'),
          item('Mémoire technique', 'Organisation, moyens humains et matériels, protocoles et contrôle qualité adaptés à votre cahier des charges.'),
          item('Références clients', 'Liste de références comparables, avec contacts communiqués sur accord des clients.'),
          item('Fiches techniques produits', 'Fiches de données de sécurité et certificats des produits écolabellisés utilisés.'),
          item('DUME / DC1 – DC2', 'Formulaires de candidature remplis pour les marchés publics.'),
        ], { max: 12 }),
      ],
    },
    {
      id: 'cta', title: "Bandeau d'appel",
      fields: [
        text('cta.title', 'Titre', "Un marché ou un appel d'offres à l'étude ?"),
        area('cta.text', 'Texte', 'Décrivez-nous votre besoin et le cadre du marché : nous revenons vers vous avec une proposition adaptée.'),
        image('cta.image', 'Photo', IMG.baseDeVie),
      ],
    },
  ],
};
