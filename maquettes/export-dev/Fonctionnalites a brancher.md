# Fonctionnalités simulées dans la maquette — à brancher à l'intégration

Rien de ce qui suit ne fonctionne réellement dans la maquette : ce sont des démonstrations visuelles.

## Formulaire de devis (page Contact)
- Envoi : la maquette affiche une animation de confirmation mais n'envoie rien. À brancher sur l'envoi réel (e-mail vers contact@aspeo.fr et/ou CRM), avec protection anti-spam (honeypot ou reCAPTCHA) et accusé de réception au client.
- Pièces jointes photos : sélection simulée, à brancher sur un stockage (taille max, formats JPG/PNG/HEIC).
- Champ « Type de prestation » prérempli depuis une page Service : logique déjà prévue dans la maquette, à conserver.
- Consentement RGPD : la mention est présente, prévoir l'enregistrement de la date de consentement.

## Recherche globale
- Fonctionne sur les données de la maquette (services, villes, articles, réalisations, presse, pages). À brancher sur les contenus administrables du CMS. Page /recherche en noindex.

## Contenus administrables (CMS)
- Services, villes, articles (Médias), réalisations, presse, offres d'emploi : chaque liste de la maquette correspond à un type de contenu à créer dans l'outil d'administration, avec les mêmes champs.

## Avis clients
- Note Google, nombre d'avis et témoignages sont saisis à la main dans la maquette. À relier à la fiche Google Business Profile (API ou widget) ou à mettre à jour manuellement.
- Boutons « Laissez-nous un avis » : renseigner le lien réel de dépôt d'avis Google.

## Compteurs animés (clients, satisfaction, années)
- Valeurs fixes dans la maquette, à confirmer et à rendre modifiables dans le CMS.

## Nous rejoindre
- Bouton « Postuler » : à brancher sur un formulaire de candidature (CV en pièce jointe) ou une adresse e-mail dédiée.

## Espace presse
- Boutons « Demander les logos / photos / fiche / communiqués » : renvoient vers le formulaire de contact. Prévoir éventuellement de vrais fichiers téléchargeables.

## Non publiés (fichiers présents dans le projet, mais non reliés au site)
- « ASPEO Connect » (espace client) et « ASPEO Collaborateur » : maquettes d'exploration uniquement, aucun lien sur le site. Ne pas développer sans validation.

## Suivi
- Ajouter la mesure d'audience (respectueuse du RGPD) et le bandeau cookies correspondant à la politique de cookies.
