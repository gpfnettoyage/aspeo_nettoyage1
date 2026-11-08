# Mise en production de la refonte ASPEO

Ce document décrit, dans l'ordre, ce qu'il faut faire pour mettre en ligne la refonte développée sur la branche `claude/aspeo-site-development-b6vvog`.
**Rien n'a été appliqué à la production.** Chaque étape sensible doit être validée par ASPEO et exécutée par le développeur responsable.

---

## 1. Avant de commencer

1. **Sauvegarde complète de la base de production** (export PostgreSQL ou sauvegarde Neon/Vercel Postgres) et vérification que la restauration fonctionne.
2. Déploiement d'abord sur un **environnement de préproduction** (Preview Vercel) branché sur une **copie** de la base de production.
3. Relire la liste « Contenus à valider » (section 6) avec ASPEO.

---

## 2. Variables d'environnement

### Déjà utilisées par le site actuel (à conserver)

| Variable | Rôle |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Base PostgreSQL |
| `BETTER_AUTH_SECRET` (≥ 32 caractères), `BETTER_AUTH_URL` | Authentification de l'administration |
| `OVH_EMAIL_USER`, `OVH_EMAIL_PASS`, `RECEIVER_EMAIL` | Messagerie OVH (sécurité de l'admin, et par défaut formulaires du site) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Redis Upstash (limitation de débit) |
| `BLOB_READ_WRITE_TOKEN` | Stockage des images et pièces jointes (Vercel Blob) |
| `NEXT_PUBLIC_APP_URL` | Adresse publique du site (`https://www.aspeo.fr`) |
| `CRON_SECRET` | Tâches planifiées |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID`, `NEXT_PUBLIC_HOTJAR_ID` | Mesure d'audience (après consentement) |

### Nouvelles variables (toutes facultatives)

| Variable | Défaut | Rôle |
|---|---|---|
| `SMTP_HOST` | `ssl0.ovh.net` | Serveur d'envoi des e-mails des formulaires |
| `SMTP_PORT` | `465` | Port SMTP |
| `SMTP_SECURE` | `true` si port 465 | Connexion chiffrée directe |
| `SMTP_USER`, `SMTP_PASS` | `OVH_EMAIL_USER` / `OVH_EMAIL_PASS` | Compte d'envoi (si différent du compte de sécurité) |
| `MAIL_FROM` | `SMTP_USER` | Adresse d'expéditeur affichée |
| `FORM_TOKEN_SECRET` | `BETTER_AUTH_SECRET` | Signature des jetons anti-spam des formulaires |
| `TURNSTILE_SECRET_KEY` **et** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | — | Cloudflare Turnstile (anti-robot). Actif uniquement si **les deux** sont définies. Ajouter le domaine dans le tableau de bord Cloudflare. *Non testé en conditions réelles : l'hôte Cloudflare n'était pas accessible depuis l'environnement de développement.* |

Les destinataires des notifications (devis, candidatures) se règlent dans l'admin : **Réglages → Chiffres & notifications**.

---

## 3. Base de données

Les migrations de la refonte sont **uniquement additives** (aucun `DROP`, aucun `RENAME`, aucune donnée modifiée) :

| Migration | Contenu |
|---|---|
| `20261107_refonte_contenus` | Nouvelles colonnes de `Category` et `Service`, nouvelles tables (villes, réalisations, articles, presse, avis, offres, FAQ, pages, réglages, médias, demandes, candidatures, redirections, journal) |
| `20261108_lead_status_quoted` | Ajout du statut « Devis envoyé » |

Procédure (après sauvegarde, sur la préproduction d'abord) :

```bash
npx prisma migrate status
npx prisma migrate deploy
```

Si la base de production n'a pas d'historique Prisma (`_prisma_migrations` absente ou incomplète), **ne pas** utiliser `migrate reset` ni `db push --accept-data-loss`. Marquer les migrations déjà appliquées avec `npx prisma migrate resolve --applied <nom>` après vérification, puis appliquer les nouvelles.

---

## 4. Import des contenus de la maquette

Le script est **idempotent et non destructif** : il crée ce qui manque et complète les champs vides, sans jamais écraser un contenu existant.

```bash
npx tsx scripts/import-refonte.ts --dry-run   # simulation : lire le rapport
npx tsx scripts/import-refonte.ts             # import réel
```

En production, **ne pas** utiliser `--publish-unvalidated` (réservé à la base de développement) : les contenus de la maquette non validés sont importés **en brouillon**.

Option `--assign-categories` : reclasse les services existants dans les nouvelles activités du méga-menu. Sans elle, les services déjà classés gardent leur catégorie actuelle (le rapport liste les écarts). À décider avec ASPEO après lecture de la simulation.

Après l'import :
- Administration → **Bibliothèque d'images** → « Recenser les images du site » (ajoute les images déjà en ligne, sans rien modifier) ;
- compléter les textes alternatifs signalés.

---

## 5. Déploiement et vérifications

1. Déployer la branche en préproduction (`npm run build` doit passer).
2. Vérifier :
   - pages publiques (accueil, catalogue, fiches services, villes, réalisations, médias, contact, nous rejoindre, pages légales) ;
   - un **envoi réel** du formulaire de devis et d'une candidature (notification et accusé de réception reçus, photos/CV consultables depuis l'admin) ;
   - les anciennes adresses : `/services/...`, `/actualites/...` → redirections 301/308 ; liste dans **Admin → Redirections** ;
   - `/sitemap.xml` (contenus publiés uniquement) et `/robots.txt` ;
   - la connexion à l'admin (2FA, vérification d'appareil) et l'aperçu des brouillons.
3. Soumettre le sitemap dans Google Search Console après la mise en ligne.

Création du premier compte administrateur (si nécessaire) :

```bash
ADMIN_EMAIL=… ADMIN_PASSWORD=… npx tsx scripts/seed-admin.ts
```

---

## 6. Contenus et choix à valider par ASPEO

- **Tarifs** : fourchettes de prix masquées (`showPricing` désactivé) tant qu'elles ne sont pas validées.
- **Photos avant/après** : uniquement des photos réelles de chantiers.
- **Contenus de la maquette non validés** (réalisations, articles, presse, avis, offres, FAQ d'exemple) : importés en brouillon, à relire puis publier depuis l'admin.
- **Prestations retirées de l'offre** : nettoyage après sinistre, débarras, traitement humidité et moisissures sont **dépubliés** (données conservées). Le « nettoyage après décès » est en brouillon, à rédiger avant publication.
- **Pages villes** sans texte rédigé (Montrond-les-Bains, Boën-sur-Lignon, Saint-Étienne, Lyon, Roanne) : brouillons, non visibles ; pas de texte générique dupliqué.
- **Chiffres clés** (clients, satisfaction, années, note Google) : à confirmer (Réglages → Chiffres & notifications).
- **Durées de conservation** indiquées dans la politique de confidentialité : à valider.
- **Équipe** : section masquée tant que les noms ne sont pas fournis.
- **Ancien éditeur de services** (import JSON « IA ») : ses adresses redirigent vers le nouvel éditeur ; ses fichiers sont conservés dans le dépôt, suppression à valider.
- **Pièces jointes** : avec Vercel Blob, les photos de devis et CV ont une adresse publique non devinable ; elles ne sont listées que dans l'admin. Pour un accès strictement privé, prévoir un stockage privé dédié.

---

## 7. Retour arrière

- Le code : redéployer le déploiement Vercel précédent (« Promote to Production »).
- La base : les migrations n'ayant rien supprimé, l'ancien site fonctionne avec la nouvelle structure ; en cas de besoin, restaurer la sauvegarde de l'étape 1.
