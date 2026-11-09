/**
 * Registre des pages « fixes » du site public.
 * Chaque page a une clé stable (table Page), un chemin, et des titres/descriptions SEO
 * par défaut repris de la fonction applySEO de la maquette. Les valeurs saisies dans
 * l'admin (Page.seoTitle / seoDesc / content) remplacent ces valeurs par défaut.
 */
export interface PageDefinition {
  key: string;
  title: string;
  path: string;
  seoTitle: string;
  seoDesc: string;
  noindex?: boolean;
}

export const PAGE_DEFINITIONS: PageDefinition[] = [
  { key: 'accueil', title: 'Accueil', path: '/', seoTitle: 'Nettoyage professionnel Loire & Rhône | ASPEO', seoDesc: 'Nettoyage de bureaux, commerces, sites industriels et chantiers, interventions Diogène et logements insalubres en Loire et Rhône. Devis gratuit après visite.' },
  { key: 'a-propos', title: 'Notre Histoire', path: '/a-propos', seoTitle: 'Notre histoire : nettoyage à Panissières | ASPEO', seoDesc: 'Née à Panissières, ASPEO est devenue le partenaire de référence du nettoyage extrême en Plaine du Forez, Monts du Lyonnais et Roannais.' },
  { key: 'proprete-services', title: 'Propreté & Services', path: '/proprete-services', seoTitle: 'Nos Services : Nettoyage Professionnel & Interventions Spécialisées | ASPEO', seoDesc: 'Nettoyage tertiaire et bureaux, surfaces commerciales, bases de vie, fin de chantier, logements insalubres, Diogène : découvrez toutes nos prestations.' },
  { key: 'grands-comptes', title: 'Grands Comptes & Marchés Publics', path: '/grands-comptes', seoTitle: 'Grands Comptes & Marchés Publics | ASPEO', seoDesc: 'ASPEO accompagne entreprises de BTP, concessionnaires autoroutiers, collectivités et grands groupes : interlocuteur unique, conformité HSE et reporting régulier.' },
  { key: 'zones-intervention', title: "Zones d'intervention", path: '/zones-intervention', seoTitle: "Zones d'intervention Loire & Rhône | ASPEO", seoDesc: 'ASPEO intervient en Plaine du Forez, Monts du Lyonnais et Roannais. Découvrez nos secteurs et nos équipes locales.' },
  { key: 'realisations', title: 'Réalisations', path: '/realisations', seoTitle: 'Nos réalisations : chantiers de nettoyage en Loire & Rhône | ASPEO', seoDesc: 'Bureaux, surfaces commerciales, bases de vie, fin de chantier, panneaux solaires, Diogène : découvrez nos chantiers de nettoyage détaillés, du contexte au résultat.' },
  { key: 'medias', title: 'Médias', path: '/medias', seoTitle: 'Actualités & Conseils Propreté | ASPEO', seoDesc: "Conseils d'experts, retours d'expérience et actualités sur le nettoyage professionnel et la remise en état." },
  { key: 'actualites', title: 'Actualités', path: '/medias/actualites', seoTitle: 'Actualités & conseils nettoyage | ASPEO', seoDesc: "Conseils d'experts, retours d'expérience et actualités sur le nettoyage professionnel en Loire et Rhône." },
  { key: 'presse', title: 'Espace presse', path: '/medias/presse', seoTitle: 'Espace presse | ASPEO, nettoyage professionnel Loire & Rhône', seoDesc: "Retombées presse, communiqués et kit média d'ASPEO, entreprise de nettoyage professionnel basée à Panissières (Loire). Contact presse dédié." },
  { key: 'avis', title: 'Avis clients', path: '/avis', seoTitle: 'Avis clients nettoyage Loire & Rhône | ASPEO', seoDesc: 'Découvrez les avis de nos clients sur nos prestations de nettoyage professionnel et de remise en état.' },
  { key: 'nous-rejoindre', title: 'Nous rejoindre', path: '/nous-rejoindre', seoTitle: "Nous rejoindre : offres d'emploi en nettoyage | ASPEO", seoDesc: "ASPEO recrute agents de propreté, chefs d'équipe, laveurs de vitres et techniciens dans la Loire et le Rhône. CDI, formation interne, planning stable." },
  { key: 'contact', title: 'Contact', path: '/contact', seoTitle: 'Contact et devis gratuit | ASPEO Nettoyage', seoDesc: 'Contactez ASPEO pour un devis gratuit sous 24h après la visite. Intervention rapide en Plaine du Forez, Monts du Lyonnais et Roannais.' },
  { key: 'recherche', title: 'Recherche', path: '/recherche', seoTitle: 'Recherche | ASPEO', seoDesc: 'Rechercher une prestation, une ville, un article ou une réalisation ASPEO.', noindex: true },
  { key: 'mentions-legales', title: 'Mentions légales', path: '/mentions-legales', seoTitle: 'Mentions Légales | ASPEO', seoDesc: 'Mentions légales du site ASPEO : éditeur, hébergeur, siège social à Panissières (Loire), propriété intellectuelle et contact.' },
  { key: 'politique-de-confidentialite', title: 'Politique de confidentialité', path: '/politique-de-confidentialite', seoTitle: 'Politique de Confidentialité | ASPEO', seoDesc: 'Comment ASPEO collecte, utilise et protège vos données personnelles transmises via le formulaire de devis, et comment exercer vos droits.' },
  { key: 'conditions-generales-d-utilisation', title: "Conditions générales d'utilisation", path: '/conditions-generales-d-utilisation', seoTitle: "Conditions Générales d'Utilisation | ASPEO", seoDesc: "Conditions générales d'utilisation du site ASPEO : accès au site, responsabilités, liens externes et droit applicable." },
  { key: 'politique-des-cookies', title: 'Politique des cookies', path: '/politique-des-cookies', seoTitle: 'Politique de Cookies | ASPEO', seoDesc: 'Cookies utilisés sur le site ASPEO, finalités, durée de conservation et moyens de gérer vos préférences.' },
  { key: 'blocs-communs', title: 'Blocs communs', path: '/', seoTitle: '', seoDesc: '', noindex: true },
];

export const getPageDefinition = (key: string) => PAGE_DEFINITIONS.find((p) => p.key === key);
