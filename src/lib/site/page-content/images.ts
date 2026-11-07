/** Photos du stockage Vercel Blob de production reprises par la maquette. */
const BLOB = 'https://gerrrw8pnhgmo9jz.public.blob.vercel-storage.com/services/';

export const IMG = {
  equipeTertiaire: `${BLOB}nettoyage-de-bureaux-sieges-sociaux/equipe-aspeo-nettoyage-tertiaire-stfoylargentiere-1774252402514-924eee13.webp`,
  baseDeVie: `${BLOB}entretien-de-bases-de-vie-infrastructures/base-de-vie-chantier-autoroute-loire-42-installations-temporaires-1782829995112-c5a7ed1b.webp`,
  commercial: `${BLOB}nettoyage-de-surfaces-commerciales/nettoyage-commercial-aspeo-1774184261980.webp`,
  vitres: `${BLOB}lavage-de-vitres/deux-personne-nettoyage-vitre-1774184290601.webp`,
  insalubre: `${BLOB}nettoyage-de-logements-insalubres/chantier-logement-insalubre-stjuststrambert-aspeo-1774276920056-b3363e34.webp`,
  exterieur: `${BLOB}nettoyage-exterieur/nettoyage-exterieur-entreprise-1774184271441.webp`,
  clientHeureux: `${BLOB}general/client-aspeo-heureux-1774184258981.webp`,
  equipes: `${BLOB}general/aspeo-equipes-1774184227905.webp`,
  cuisineAvantApres: `${BLOB}nettoyage-syndrome-de-diogene/avant_apres_nettoyage_cuisine_insalubre_debarras_remise_en_etat_aspeo_nettoyage_-1774272787066-a8fe5fec.webp`,
  finDeChantier: `${BLOB}nettoyage-de-fin-de-chantier/nettoyage-fin-de-chantier-42-aspeo-avant-apres-1774274431620-76dad0cc.webp`,
  ingenieurs: `${BLOB}nettoyage-de-fin-de-chantier/portrait-ingenieurs-pendant-heures-travail-chantier-1774184278385.webp`,
} as const;
