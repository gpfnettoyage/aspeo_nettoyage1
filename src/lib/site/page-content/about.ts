import { area, image, list, text, type PageContentModel } from './types';
import { IMG } from './images';

/** Page « Notre Histoire » (/a-propos). Récit, chronologie et valeurs : à valider par ASPEO. */
export const aboutContent: PageContentModel = {
  key: 'a-propos',
  sections: [
    {
      id: 'hero', title: 'Bandeau',
      fields: [
        text('hero.eyebrow', 'Surtitre', 'Notre Histoire'),
        area('hero.title', 'Titre (H1, retour à la ligne autorisé)', 'Notre\nHistoire'),
        area('hero.text', 'Texte', "D'une conviction locale à un partenaire de référence, née à Panissières entre la Plaine du Forez et les Monts du Lyonnais."),
        image('hero.image', 'Photo de fond', IMG.equipes),
      ],
    },
    {
      id: 'intro', title: 'Introduction',
      fields: [
        area('intro.aside', 'Colonne gauche', 'Une entreprise indépendante, fondée en 2024 à Panissières, entre la Plaine du Forez et les Monts du Lyonnais.'),
        area('intro.lead', 'Accroche', "ASPEO est née d'une conviction : une entreprise de propreté peut allier exigence professionnelle, respect des personnes et engagement écologique."),
        area('intro.body', 'Paragraphe', "Des premières remises en état et interventions délicates réalisées dans le Forez aux contrats de nettoyage tertiaire, de bureaux et de fin de chantier qui couvrent aujourd'hui Saint-Étienne, Roanne, Montbrison et l'ouest lyonnais, notre développement s'est construit pas à pas, sans précipitation : chaque nouveau métier a été structuré, chaque équipe formée, chaque protocole éprouvé avant d'être déployé. Cette croissance maîtrisée est le socle de la confiance que nous accordent aussi bien les particuliers que les entreprises, syndics et collectivités."),
      ],
    },
    {
      id: 'story', title: 'Récit',
      fields: [
        text('story.title', 'Titre', 'Comment ASPEO est née, et pourquoi elle a grandi'),
        area('story.intro', 'Introduction', "ASPEO a été créée en 2024 à Panissières, dans la Loire. Le point de départ est simple : beaucoup d'entreprises, de collectivités et de particuliers de la région avaient du mal à trouver un prestataire de propreté à la fois réactif, joignable et constant dans la qualité. Les grands groupes semblaient loin, les petites structures peinaient à suivre dans la durée."),
        list('story.blocks', 'Chapitres', 'Chapitre', [text('title', 'Titre', ''), area('text', 'Texte (ligne vide = nouveau paragraphe)', '')], [
          { title: "Les premières missions : là où d'autres hésitaient", text: "Les premiers mois, une grande partie de l'activité s'est construite sur des interventions que peu d'entreprises acceptaient : logements très encombrés, situations de syndrome de Diogène, remises en état après un départ de locataire. Ces chantiers demandent de la méthode, du matériel adapté et surtout du tact, parce qu'il y a souvent une famille, un bailleur ou un tuteur derrière chaque demande.\n\nCes missions ont fixé une manière de travailler qui ne nous a plus quittés : visiter avant de chiffrer, expliquer clairement ce qui sera fait, et ne repartir qu'une fois le résultat contrôlé." },
          { title: 'Du ponctuel au régulier', text: "Les clients satisfaits de ces interventions nous ont ensuite confié l'entretien de leurs propres locaux : bureaux, commerces, cabinets, puis des sites plus importants. ASPEO a ainsi développé un véritable pôle de nettoyage professionnel, avec des contrats d'entretien réguliers, des passages planifiés et des équipes affectées aux mêmes sites pour assurer la continuité.\n\nAujourd'hui, l'entreprise intervient aussi sur des bases de vie de chantier, des nettoyages de fin de chantier, des surfaces commerciales, des sites industriels et des établissements d'hôtellerie et de restauration, tout en conservant ses interventions spécialisées." },
          { title: 'Un ancrage local assumé', text: "Nous avons fait le choix de rester une entreprise régionale. Nos équipes interviennent dans la Loire et le Rhône, de la Plaine du Forez aux Monts du Lyonnais, jusqu'à Saint-Étienne, Roanne et l'agglomération lyonnaise. Ce périmètre volontairement limité nous permet de connaître le terrain, de nous déplacer pour chaque visite et de garder un lien direct avec chaque client." },
          { title: 'Ce que nous voulons rester', text: "Grandir sans perdre ce qui a fait notre réputation : un interlocuteur que l'on connaît, des engagements tenus, et la même exigence que l'on entretienne un open space chaque soir ou que l'on remette en état un logement en une seule intervention." },
        ], { max: 8 }),
      ],
    },
    {
      id: 'values', title: 'Engagements',
      fields: [
        text('values.title', 'Titre', "Ce qui n'a pas changé depuis 2024"),
        area('values.text', 'Texte', 'Trois engagements concrets, et la façon dont nous les tenons à chaque intervention.'),
        list('values.items', 'Engagements', 'Engagement', [text('title', 'Titre', ''), area('text', 'Texte', ''), area('proof', 'La preuve', '')], [
          { title: 'Discrétion', text: "Véhicules et tenues sans marquage sur demande, interventions hors horaires d'ouverture, et aucune information sur votre site ou votre situation partagée à des tiers.", proof: 'nos interventions chez les particuliers se font sans voisinage alerté, nos passages en entreprise sans croiser vos équipes.' },
          { title: 'Ponctualité', text: 'Les créneaux convenus sont tenus, et un agent absent est remplacé sans que vous ayez à le demander.', proof: "chaque passage est tracé sur une fiche de contrôle, consultable par le client, avec l'heure d'arrivée et de départ." },
          { title: 'Formation interne', text: 'Chaque agent est formé par nos soins avant sa première intervention, puis accompagné sur le terrain par un responsable.', proof: "un nouvel agent ne travaille jamais seul sur un site avant d'avoir été validé par son encadrant." },
        ], { max: 5 }),
      ],
    },
    {
      id: 'partner', title: 'Partenaire durable',
      fields: [
        text('partner.title', 'Titre', "Un partenaire durable, du contrat régulier à l'urgence"),
        area('partner.text', 'Texte', "Un accompagnement basé sur la confiance, la rigueur et la transparence, que vous ayez besoin d'un entretien récurrent de vos locaux ou d'une intervention ponctuelle plus délicate. Nous utilisons des produits écolabel certifiés et des protocoles éprouvés, avec la même exigence à chaque intervention."),
        image('partner.image', 'Photo', IMG.equipes),
      ],
    },
    {
      id: 'vision', title: 'Vision',
      fields: [
        text('vision.title', 'Titre', 'Notre vision du métier'),
        area('vision.text', 'Texte', "Entretenir des bureaux avec la même rigueur qu'une remise en état complète d'un logement, traiter un syndrome de Diogène avec le même respect qu'une base de vie de chantier : c'est la vision qui guide nos choix, nos recrutements et nos investissements depuis le premier jour, sur nos deux domaines d'intervention."),
        list('vision.items', 'Piliers', 'Pilier', [text('title', 'Titre', ''), area('text', 'Texte', '')], [
          { title: 'Exigence technique', text: "Des protocoles précis et documentés pour chaque type d'intervention, de l'entretien de bureaux au syndrome de Diogène, appliqués sans raccourci." },
          { title: 'Équipes formées et encadrées', text: "Des techniciens formés sur le terrain aussi bien aux contrats réguliers qu'aux situations les plus exigeantes, avec un responsable dédié qui suit chaque intervention." },
          { title: 'Ancrage local', text: "Des équipes recrutées dans la région, qui connaissent les communes et les accès, et un siège à Panissières où l'on peut nous rencontrer." },
          { title: 'Continuité de service', text: "Un pilotage qualité permanent : traçabilité des interventions, reporting digital et continuité de service garantie, même en cas d'imprévu." },
        ], { max: 4 }),
      ],
    },
    {
      id: 'timeline', title: 'Chronologie',
      fields: [
        text('timeline.eyebrow', 'Surtitre', 'Notre histoire'),
        text('timeline.title', 'Titre', 'Une évolution maîtrisée'),
        area('timeline.text', 'Texte', "De Panissières à Saint-Étienne, Roanne et jusqu'à Lyon, les étapes qui ont structuré notre organisation et forgé notre exigence."),
        list('timeline.items', 'Étapes', 'Étape', [text('year', 'Année', ''), text('title', 'Titre', ''), text('tag', 'Étiquette', ''), area('text', 'Texte', '')], [
          { year: '2024', title: "Naissance d'une vision", tag: 'Vision & Fondation', text: "ASPEO voit le jour à Panissières, portée par la conviction qu'une entreprise de propreté peut allier exigence professionnelle, respect des personnes et engagement écologique. Les premières prestations posent les fondations d'un savoir-faire aujourd'hui reconnu en Loire." },
          { year: '2024', title: "Spécialisation dans l'extrême", tag: 'Expertise Technique', text: "Dès ses débuts, ASPEO fait le choix de se spécialiser dans les interventions délicates — syndrome de Diogène, logements insalubres, remises en état — plutôt que dans le nettoyage généraliste, avec des protocoles et des produits adaptés à chaque situation." },
          { year: '2025', title: 'Naissance du pôle Nettoyage Professionnel', tag: 'Diversification', text: "Sollicitée par des entreprises séduites par sa rigueur, ASPEO structure une offre d'entretien régulier pour bureaux, sièges sociaux, surfaces commerciales, bases de vie de chantier et fin de chantier — avec la même exigence que pour ses interventions spécialisées." },
          { year: '2025', title: 'Expansion territoriale', tag: 'Croissance Territoriale', text: "L'équipe s'étoffe et le rayon d'action s'étend à la Plaine du Forez, aux Monts du Lyonnais et au Roannais, jusqu'à Saint-Étienne et l'agglomération lyonnaise." },
          { year: '2026', title: 'Reconnaissance locale', tag: 'Reconnaissance', text: "Grâce à sa réactivité et à la qualité de ses interventions, ASPEO s'impose comme un partenaire de confiance pour les particuliers comme pour les entreprises, syndics, collectivités et compagnies d'assurance de son territoire." },
        ], { max: 12 }),
        text('future.title', 'Vision long terme — titre', 'Une vision long terme'),
        area('future.text', 'Vision long terme — texte', "La suite de notre histoire s'écrit avec la même méthode : consolider notre ancrage de Saint-Étienne à Lyon, de Roanne à Montrond-les-Bains, approfondir chacun de nos savoir-faire, poursuivre la formation de nos équipes et renforcer nos engagements environnementaux. Grandir, oui — mais sans jamais transiger sur l'exigence qui nous définit."),
        text('cta.title', 'Appel — titre', 'Écrivons la suite ensemble'),
        area('cta.text', 'Appel — texte', 'Rejoignez les clients et les collaborateurs qui font grandir ASPEO chaque jour, à Saint-Étienne, Montbrison, Feurs et dans tout le Forez.'),
        image('cta.image', 'Appel — photo', IMG.clientHeureux),
      ],
    },
    {
      id: 'team', title: 'Équipe',
      fields: [
        text('team.title', 'Titre', "L'équipe ASPEO"),
        area('team.text', 'Texte', "Des interlocuteurs identifiés, que vous rencontrez lors de la visite et qui suivent votre dossier jusqu'au bout."),
        list('team.members', 'Membres (une fiche n\'est affichée que si le nom est renseigné)', 'Membre', [text('name', 'Prénom Nom', ''), text('role', 'Fonction', ''), area('bio', 'Présentation', ''), image('photo', 'Photo', ''), text('photoAlt', 'Texte alternatif', '')], [
          { name: '', role: 'Dirigeant', bio: "Fondateur d'ASPEO, il définit les protocoles et suit personnellement les contrats grands comptes.", photo: '', photoAlt: '' },
          { name: '', role: "Responsable d'exploitation", bio: 'Organise les plannings, encadre les équipes sur le terrain et réalise les contrôles qualité.', photo: '', photoAlt: '' },
          { name: '', role: 'Chargé(e) de clientèle', bio: 'Votre premier contact : visite technique, devis et suivi de la relation au quotidien.', photo: '', photoAlt: '' },
        ], { max: 8, help: 'Noms, rôles et photos à fournir par ASPEO : la section reste masquée tant qu\'aucun nom n\'est saisi.' }),
      ],
    },
  ],
};
