/**
 * Redirections 301 initiales (importées dans la table Redirect, modifiables depuis l'admin).
 * Source : maquettes/export-dev/Redirections 301.md + plan d'URL de la maquette.
 * Les redirections « techniques » à motif (/services/*) restent dans next.config.mjs.
 */
export const LEGACY_REDIRECTS: { source: string; destination: string; note: string }[] = [
  { source: '/proprete-services/nettoyage-transport', destination: '/proprete-services', note: 'Prestation supprimée' },
  { source: '/proprete-services/nettoyage-de-piscines', destination: '/proprete-services/nettoyage-exterieur', note: 'Prestation supprimée' },
  { source: '/proprete-services/nettoyage-apres-sinistre', destination: '/proprete-services/remise-en-etat', note: 'Prestation retirée du catalogue' },
  // Active tant que la fiche « Nettoyage après décès » n'est pas publiée : une page publiée est toujours prioritaire.
  { source: '/proprete-services/nettoyage-apres-deces', destination: '/proprete-services/nettoyage-de-logements-insalubres', note: 'Fiche dédiée à rédiger' },
  { source: '/proprete-services/debarras-maison-appartement-encombrants', destination: '/proprete-services/remise-en-etat', note: 'Prestation retirée du catalogue' },
  { source: '/proprete-services/traitement-humidite', destination: '/proprete-services/remise-en-etat', note: 'Prestation non proposée' },
  { source: '/proprete-services/traitement-moisissures', destination: '/proprete-services/remise-en-etat', note: 'Prestation non proposée' },
  // URL prévues par la maquette -> URL retenues
  { source: '/hub-professionnel', destination: '/proprete-services/nettoyage-professionnel', note: 'URL maquette' },
  { source: '/hub-specialise', destination: '/proprete-services/nettoyage-specialise', note: 'URL maquette' },
  { source: '/hub-exterieur-chantier', destination: '/proprete-services/exterieur-et-chantier', note: 'URL maquette' },
  { source: '/hub-autres', destination: '/proprete-services/services-annexes', note: 'URL maquette' },
  { source: '/presse', destination: '/medias/presse', note: 'URL maquette' },
  { source: '/actualites', destination: '/medias/actualites', note: 'URL maquette' },
  { source: '/temoignages', destination: '/avis', note: 'Ancienne URL' },
];
