import { f, SEO_GROUP, type CollectionDef } from './fields';

const POLES = [{ value: 'professionnel', label: 'Nettoyage professionnel' }, { value: 'specialise', label: 'Interventions spécialisées' }];
const qa = [f.text('question', 'Question', { required: true }), f.area('answer', 'Réponse', { required: true, rows: 3 })];
const titleText = [f.text('title', 'Titre', { required: true }), f.area('text', 'Texte', { rows: 3 })];

const services: CollectionDef = {
  key: 'services', label: 'Services', singular: 'service', gender: 'm', icon: 'file',
  intro: 'Les blocs laissés vides ne s’affichent pas sur la page du service.',
  status: 'boolean', draft: true, slugFrom: 'title', publicPath: '/proprete-services/{slug}', seo: true,
  groups: [
    { title: 'Haut de page', description: 'Nom, catégorie, accroche et image', fields: [
      f.text('title', 'Titre du service', { required: true, max: 120 }),
      f.slug(),
      f.text('subtitle', 'Accroche courte (menus, cartes)', { max: 120 }),
      f.relation('categoryId', 'Activité', 'categories', { half: true }),
      f.number('displayOrder', 'Ordre d’affichage', { half: true, min: 0 }),
      f.area('content.tagline', 'Sous-titre du bandeau', { rows: 2, max: 240 }),
    ] },
    { title: 'Pour qui ?', description: 'Les profils concernés', fields: [
      f.lines('content.audience', 'Pour qui ?'),
    ] },
    { title: 'Ce qui est inclus', description: 'Le détail de la prestation', fields: [
      f.lines('content.includes', 'Ce qui est inclus (« Nos services », « Détails des services »)'),
      f.lines('content.spaces', 'Espaces concernés'),
      f.lines('content.sectors', 'Secteurs d’application'),
      f.list('content.approach', 'Notre réponse (interventions spécialisées)', 'Point', titleText, { maxItems: 6 }),
      f.list('content.plus', 'Les + ASPEO', 'Avantage', titleText, { maxItems: 8 }),
      f.lines('content.guarantees', 'Vos garanties'),
    ] },
    { title: 'Non inclus', description: 'Ce qui n’est pas compris', fields: [
      f.lines('content.notIncluded', 'Non inclus'),
    ] },
    { title: 'Délais', description: 'Délais réalistes', fields: [
      f.text('content.delay', 'Délais'),
      f.text('content.testimonialAuthor', 'Avis affiché (nom exact de l’auteur)', { help: 'Doit correspondre à un avis publié dans « Avis clients ».' }),
    ] },
    { title: 'Déroulement', description: 'Les étapes de l’intervention', fields: [
      f.list('content.process', 'Notre méthode d’intervention', 'Étape', [f.text('title', 'Titre', { required: true }), f.area('text', 'Description', { rows: 2 }), f.text('duration', 'Délai')], { maxItems: 8 }),
      f.lines('content.firstSteps', 'Ce qu’il faut prévoir (interventions spécialisées)'),
    ] },
    { title: 'Tarifs', description: 'Formules ou fourchettes de prix. À n’afficher qu’après validation des fourchettes par ASPEO.', fields: [
      f.toggle('content.showPricing', 'Afficher les fourchettes de prix'),
      f.list('content.pricingTiers', 'Fourchettes', 'Niveau', [f.text('name', 'Niveau', { required: true }), f.number('min', 'Minimum (€)'), f.number('max', 'Maximum (€)'), f.text('unit', 'Unité (ex. /mois)'), f.area('text', 'Description', { rows: 2 })], { maxItems: 5 }),
      f.area('content.priceNote', 'Note sous les tarifs', { rows: 2 }),
    ] },
    { title: 'FAQ du service', description: 'Questions propres à ce service', fields: [
      f.list('content.faq', 'Questions fréquentes', 'Question', qa, { maxItems: 15 }),
    ] },
    { title: 'Photos', description: 'Galerie du service', fields: [
      f.gallery('content.images', 'Photos (1 : bandeau, 2 : expertise, 3 : « Notre réponse »)', { maxItems: 6 }),
      f.image('content.beforeImage', 'Photo « avant » (réelle)', { half: true }),
      f.image('content.afterImage', 'Photo « après » (réelle)', { half: true }),
    ] },
    { title: 'Textes de la page', description: 'Problème, risques, intervention et sections détaillées', fields: [
      f.area('content.problem', 'Le problème'),
      f.area('content.risks', 'Les risques'),
      f.area('content.intervention', 'Notre intervention'),
      f.area('content.benefits', 'Ce que vous y gagnez'),
      f.area('content.whyFast', 'Ce qu’il faut prendre en compte', { rows: 3 }),
      f.list('content.longform', 'Sections de texte détaillées', 'Section', titleText, { maxItems: 10 }),
    ] },
    { title: 'Textes du site actuel (conservés)', description: 'Contenus repris de la version précédente du site.', fields: [
      f.area('content.introText', 'Introduction (ancien site)'),
      f.area('content.contextText', 'Contexte (ancien site)'),
    ] },
  ],
  list: { title: 'title', columns: [{ label: 'Catégorie', path: 'category.name', kind: 'relation' }, { label: 'Statut', path: 'published', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['title', 'subtitle', 'slug'] },
  orderBy: [{ displayOrder: 'asc' }, { title: 'asc' }],
};

const categories: CollectionDef = {
  key: 'categories', label: 'Catégories', singular: 'catégorie', gender: 'f', icon: 'folder',
  intro: 'Les activités regroupent les services dans le méga-menu et disposent de leur propre page.',
  status: 'boolean', draft: false, slugFrom: 'name', publicPath: '/proprete-services/{slug}', seo: true,
  groups: [
    { title: 'Catégorie', description: 'Nom, URL et ordre', fields: [
      f.text('name', 'Nom', { required: true, max: 80 }), f.slug(), f.select('pole', 'Pôle', POLES, { half: true }),
      f.number('displayOrder', 'Ordre', { half: true, min: 0 }), f.area('description', 'Présentation courte (catalogue)', { rows: 2 }),
      f.toggle('content.separateColumn', 'Afficher dans la colonne « Autres services » du méga-menu'),
    ] },
    { title: 'Page de la catégorie', description: 'Introduction et image', fields: [
      f.text('content.kicker', 'Surtitre'), f.area('content.headline', 'Titre (H1)', { rows: 2 }), f.area('content.subtitle', 'Sous-titre', { rows: 2 }),
      f.image('content.heroImage', 'Photo du bandeau'), f.area('content.intro', 'En bref', { rows: 6 }), f.text('content.listTitle', 'Titre de la liste des prestations'),
    ] },
    { title: 'Bloc éditorial (facultatif)', fields: [
      f.text('content.editorial.title', 'Titre'), f.area('content.editorial.text', 'Texte'), f.text('content.editorial.subtitle1', 'Sous-titre 1'), f.area('content.editorial.text1', 'Texte 1', { rows: 2 }),
      f.lines('content.editorial.bullets', 'Puces'), f.text('content.editorial.subtitle2', 'Sous-titre 2'), f.area('content.editorial.text2', 'Texte 2'), f.area('content.editorial.text3', 'Texte 3', { rows: 2 }),
      f.text('content.editorial.statLabel', 'Encadré — libellé', { half: true }), f.text('content.editorial.statValue', 'Encadré — chiffre', { half: true }),
      f.text('content.editorial.statStrong', 'Encadré — texte en gras', { half: true }), f.text('content.editorial.statText', 'Encadré — texte', { half: true }), f.text('content.editorial.statNote', 'Encadré — source'),
    ] },
    { title: 'Méthode et appel à l’action', fields: [
      f.text('content.method.title', 'Titre de la méthode'), f.area('content.method.intro', 'Introduction', { rows: 2 }), f.lines('content.method.steps', 'Étapes'),
      f.text('content.method.calloutTitle', 'Encadré — titre'), f.area('content.method.calloutText', 'Encadré — texte', { rows: 2 }), f.image('content.methodImage', 'Photo'),
      f.area('content.cta.title', 'Appel final — titre', { rows: 2 }), f.area('content.cta.text', 'Appel final — texte', { rows: 3 }),
    ] },
    SEO_GROUP,
  ],
  list: { title: 'name', columns: [{ label: 'Services', path: '_count.services', format: (v) => `${Number(v) || 0} service${Number(v) > 1 ? 's' : ''}` }, { label: 'Statut', path: 'published', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['name', 'slug'] },
  orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
};

const cities: CollectionDef = {
  key: 'villes', label: 'Pages villes', singular: 'ville', gender: 'f', icon: 'pin',
  intro: 'Une fiche n’est visible que si elle est publiée et que le texte d’introduction est rédigé. Évitez les textes identiques d’une ville à l’autre.',
  status: 'content', draft: true, slugFrom: 'name', publicPath: '/ville/{slug}', seo: true,
  groups: [
    { title: 'Identité', description: 'Nom, secteur et trajet', fields: [
      f.text('name', 'Nom de la commune', { required: true, max: 80 }),
      f.slug(),
      f.text('sector', 'Secteur (regroupement de la page Zones)', { half: true }),
      f.text('distance', 'Distance / repère (ex. « 15 min de Panissières »)', { half: true }),
      f.text('department', 'Département', { half: true }),
      f.number('displayOrder', 'Ordre', { half: true, min: 0 }),
      f.toggle('featured', 'Mettre en avant'),
    ] },
    { title: 'Haut de page', description: 'Image et accroche locale', fields: [
      f.image('image', 'Photo'),
      f.text('imageAlt', 'Texte alternatif de la photo'),
      f.area('intro', 'Introduction (la première phrase sert d’accroche)', { rows: 5 }),
    ] },
    { title: 'Contenu local', description: 'Textes propres à la commune', fields: [
      f.area('sectorText', 'Le secteur'),
      f.area('whyText', 'Pourquoi ASPEO ici'),
      f.area('practicalText', 'Informations pratiques'),
      f.area('insalubreText', 'Logements insalubres & Diogène'),
      f.area('urgencyText', 'Urgences (texte non affiché actuellement)'),
      f.list('faq', 'Questions fréquentes propres à la commune', 'Question', qa, { maxItems: 8 }),
    ] },
    { title: 'Exemple de chantier', description: 'Facultatif', fields: [
      f.area('caseText', 'Exemple d’intervention (réel uniquement)', { help: 'Laisser vide si aucun chantier réel ne peut être cité.' }),
    ] },
    { title: 'Liens', description: 'Communes voisines et services', fields: [
      f.relation('focusService', 'Service mis en avant', 'services', { half: true, valueKey: 'slug' }),
    ] },
    { title: 'Carte', description: 'Position de la commune sur la carte de la page Zones', fields: [
      f.number('mapX', 'Position X sur la carte (%)', { half: true }),
      f.number('mapY', 'Position Y (%)', { half: true }),
      f.number('latitude', 'Latitude', { half: true }),
      f.number('longitude', 'Longitude', { half: true }),
    ] },
  ],
  list: { title: 'name', columns: [{ label: 'Secteur', path: 'sector' }, { label: 'Trajet depuis Panissières', path: 'distance' }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['name', 'sector', 'slug'] },
  orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
};

const realisations: CollectionDef = {
  key: 'realisations', label: 'Réalisations', singular: 'réalisation', gender: 'f', icon: 'camera',
  intro: 'Ne publiez que des chantiers réels, avec l’accord du client s’il est identifiable.',
  status: 'content', draft: true, slugFrom: 'title', publicPath: '/realisations/{slug}', seo: true,
  groups: [
    { title: 'Présentation', description: 'Titre, service, commune et client', fields: [
      f.text('title', 'Titre', { required: true, max: 140 }),
      f.slug(),
      f.select('pole', 'Pôle', POLES, { half: true }),
      f.relation('serviceSlug', 'Prestation', 'services', { half: true, valueKey: 'slug' }),
      f.text('serviceLabel', 'Libellé de la prestation', { half: true }),
      f.text('city', 'Commune', { half: true }),
      f.text('client', 'Client (anonymisé si besoin)', { half: true }),
      f.text('dateLabel', 'Date (ex. « 2026 »)', { half: true }),
      f.number('displayOrder', 'Ordre', { half: true, min: 0 }),
      f.toggle('featured', 'À la une (accueil)'),
    ] },
    { title: 'Le chantier', description: 'Besoin, contraintes, intervention, résultat', fields: [
      f.area('context', 'Le contexte'),
      f.area('constraints', 'Les contraintes du site'),
      f.area('intervention', 'Notre intervention'),
      f.area('result', 'Le résultat'),
    ] },
    { title: 'Chiffres clés', description: 'Surface, durée, fréquence…', fields: [
      f.list('facts', 'Chiffres clés', 'Chiffre', [f.text('k', 'Libellé', { required: true }), f.text('v', 'Valeur', { required: true })], { maxItems: 6 }),
    ] },
    { title: 'Photos', description: 'Photo principale, avant / après', fields: [
      f.image('image', 'Photo principale'),
      f.text('imageAlt', 'Texte alternatif'),
      f.image('gallery.before', 'Avant'),
      f.image('gallery.during', 'Pendant'),
      f.image('gallery.after', 'Après'),
    ] },
  ],
  list: { title: 'title', columns: [{ label: 'Service', path: 'serviceLabel' }, { label: 'Commune', path: 'city' }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['title', 'city', 'client', 'serviceLabel'] },
  orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
};

const articles: CollectionDef = {
  key: 'articles', label: 'Articles Médias', singular: 'article', gender: 'm', icon: 'newspaper',
  status: 'content', draft: true, slugFrom: 'title', publicPath: '/medias/actualites/{slug}', seo: true,
  groups: [
    { title: 'Article', description: 'Titre, URL, catégorie, image', fields: [
      f.text('title', 'Titre', { required: true, max: 160 }),
      f.slug(),
      f.text('category', 'Catégorie', { half: true, help: 'Indiquez « Actualités » pour que l’article apparaisse dans l’onglet Actualités de la page Médias.' }),
      f.date('publishedAt', 'Date de publication', { half: true, help: 'Une date future programme la publication.' }),
      f.text('author', 'Auteur'),
      f.image('image', 'Image principale'),
      f.text('imageAlt', 'Texte alternatif'),
    ] },
    { title: 'Contenu', description: 'Texte de l’article', fields: [
      f.area('excerpt', 'Résumé (cartes, partage)', { rows: 3, max: 300 }),
      f.md('body', 'Texte de l’article', { required: true }),
      f.lines('tags', 'Mots-clés'),
      f.list('faq', 'Questions fréquentes', 'Question', qa, { maxItems: 10 }),
    ] },
  ],
  list: { title: 'title', columns: [{ label: 'Catégorie', path: 'category' }, { label: 'Date', path: 'publishedAt', kind: 'date' }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['title', 'category', 'excerpt'] },
  orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
};

const press: CollectionDef = {
  key: 'presse', label: 'Presse', singular: 'parution', gender: 'f', icon: 'mic',
  status: 'content', draft: true, slugFrom: 'title', publicPath: '/medias/presse/{slug}', seo: true,
  groups: [
    { title: 'Parution', description: 'Titre, média, date et lien', fields: [
      f.text('title', 'Titre', { required: true, max: 180 }),
      f.slug(),
      f.text('media', 'Média', { half: true }),
      f.select('type', 'Type', ['Article', 'Reportage', 'Interview', 'Communiqué'].map((v) => ({ value: v, label: v })), { half: true }),
      f.text('dateLabel', 'Date affichée (ex. « 14 sept. 2026 »)', { half: true }),
      f.date('publishedAt', 'Date (tri)', { half: true }),
      f.text('externalUrl', 'Lien vers la parution originale', { half: true }),
      f.text('fileUrl', 'Document à télécharger (lien)', { half: true }),
      f.image('image', 'Image'),
      f.text('imageAlt', 'Texte alternatif'),
    ] },
    { title: 'Résumé', description: 'Résumé et texte complet', fields: [
      f.area('excerpt', 'Chapô', { rows: 3 }),
      f.md('body', 'Texte', { rows: 10 }),
    ] },
  ],
  list: { title: 'title', columns: [{ label: 'Média', path: 'media' }, { label: 'Date', path: 'dateLabel' }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['title', 'media'] },
  orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
};

const testimonials: CollectionDef = {
  key: 'avis', label: 'Avis clients', singular: 'avis', gender: 'm', icon: 'star',
  intro: 'Saisissez uniquement des avis réels (ex. repris de votre fiche Google), avec l’accord de leur auteur.',
  status: 'content', draft: false, seo: false,
  groups: [
    { title: 'Avis', description: 'Auteur, note et texte', fields: [
      f.text('author', 'Auteur', { required: true, half: true }),
      f.text('initials', 'Initiales (avatar)', { half: true, max: 4 }),
      f.text('context', 'Contexte (ex. « Particulier · Montbrison »)', { half: true }),
      f.text('dateLabel', 'Date', { half: true }),
      f.area('quote', 'Avis', { required: true, rows: 5 }),
      f.number('rating', 'Note (1 à 5)', { half: true, min: 1, max: 5 }),
    ] },
    { title: 'Source', description: 'Origine de l’avis', fields: [
      f.select('source', 'Source', [{ value: 'google', label: 'Google' }, { value: 'direct', label: 'Transmis directement' }], { half: true }),
    ] },
    { title: 'Affichage', description: 'Où afficher cet avis', fields: [
      f.number('displayOrder', 'Ordre', { half: true, min: 0 }),
    ] },
  ],
  list: { title: 'author', columns: [{ label: 'Activité · commune', path: 'context' }, { label: 'Note', path: 'rating', format: (v) => (v ? `${v}/5` : '—') }, { label: 'Source', path: 'source' }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['author', 'quote', 'context'] },
  orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
};

const jobs: CollectionDef = {
  key: 'emplois', label: 'Offres d’emploi', singular: 'offre', gender: 'f', icon: 'briefcase',
  status: 'content', draft: false, slugFrom: 'title', publicPath: '/nous-rejoindre#{slug}', seo: false,
  groups: [
    { title: 'Le poste', description: 'Intitulé, contrat, lieu', fields: [
      f.text('title', 'Intitulé du poste', { required: true }),
      f.slug({ help: 'Ancre de l’offre sur la page Nous rejoindre.' }),
      f.text('contractType', 'Contrat', { half: true }),
      f.text('hours', 'Temps de travail', { half: true }),
      f.text('location', 'Lieu (ex. « Saint-Étienne, 42 »)', { half: true }),
      f.text('city', 'Ville', { half: true }),
      f.text('duration', 'Durée', { half: true }),
      f.number('displayOrder', 'Ordre', { half: true, min: 0 }),
    ] },
    { title: 'Description', description: 'Missions, profil, avantages', fields: [
      f.area('summary', 'Résumé'),
      f.area('missions', 'Vos missions'),
      f.area('profile', 'Votre profil'),
      f.area('conditions', 'Conditions'),
    ] },
  ],
  list: { title: 'title', columns: [{ label: 'Contrat', path: 'contractType' }, { label: 'Lieu', path: 'location' }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['title', 'location'] },
  orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
};

/** Libellés des pages où une question de FAQ est affichée (colonne « Affichée sur »). */
const FAQ_SCOPES: Record<string, string> = { 'grands-comptes': 'Grands Comptes & Marchés Publics', accueil: 'Accueil', contact: 'Contact' };

const faq: CollectionDef = {
  key: 'faq', label: 'FAQ', singular: 'question', gender: 'f', icon: 'help',
  intro: 'Questions affichées sur la page Grands Comptes (et réutilisables sur d’autres pages).',
  status: 'content', draft: false, seo: false,
  groups: [
    { title: 'Question', description: 'Question et réponse', fields: [
      ...qa,
    ] },
    { title: 'Affichage', description: 'Pages où la question apparaît', fields: [
      f.select('scope', 'Page', [{ value: 'grands-comptes', label: 'Grands Comptes & Marchés Publics' }, { value: 'accueil', label: 'Accueil' }, { value: 'contact', label: 'Contact' }], { required: true, half: true }),
      f.number('displayOrder', 'Ordre', { half: true, min: 0 }),
    ] },
  ],
  list: { title: 'question', columns: [{ label: 'Affichée sur', path: 'scope', format: (v) => FAQ_SCOPES[String(v)] ?? (v ? String(v) : '—') }, { label: 'Statut', path: 'status', kind: 'status' }, { label: 'Mis à jour', path: 'updatedAt', kind: 'date' }], search: ['question', 'answer'], filter: { path: 'scope', label: 'Page', options: [{ value: 'grands-comptes', label: 'Grands Comptes' }, { value: 'accueil', label: 'Accueil' }, { value: 'contact', label: 'Contact' }] } },
  orderBy: [{ scope: 'asc' }, { displayOrder: 'asc' }],
};

export const COLLECTIONS: Record<string, CollectionDef> = Object.fromEntries(
  [services, categories, cities, realisations, articles, press, testimonials, jobs, faq].map((c) => [c.key, c]),
);
export const getCollection = (key: string) => COLLECTIONS[key];
