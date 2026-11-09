# Contrôle technique ASPEO — Codex

Base contrôlée : `claude/aspeo-site-development-b6vvog`, commit `514fcee046c6fd7737f45deaa1ef902d497b93d0`.
Branche de corrections : `codex/controle-qualite-aspeo`.

## Corrections indépendantes du travail graphique

- **Prévisualisation : redirection ouverte.** Un administrateur suivant `/api/preview?path=%2F%09%2Fevil.example` était redirigé vers un site externe : `URL()` supprime les tabulations et retours à la ligne. Ces caractères sont désormais refusés et l'origine de la destination calculée est vérifiée. Les chemins internes, paramètres et ancres restent utilisables. Les tests reproduisent trois contournements sur le code initial et vérifient également le refus des visiteurs non autorisés.
- **Nettoyage : refus si le secret est absent.** Lorsque `CRON_SECRET` était absent, `Authorization: Bearer undefined` passait la comparaison et atteignait les suppressions. Un secret vide avait le même problème. La route refuse désormais ces configurations avant tout accès à Prisma. Les tests de nettoyage utilisent exclusivement des simulations de Prisma.
- **Lint compatible Next.js 16.** `next lint` a été supprimé ; `npm run lint` appelle maintenant ESLint. Le dossier de maquettes de référence est exclu du contrôle du code applicatif, sans modification de son contenu. Le global Node `process` de `csp.mjs` est déclaré. La règle `no-control-regex` est désactivée sur une seule ligne où ces caractères sont volontairement interdits par la validation des services ; la validation reste identique.
- **E2E Better Auth.** Le test de déconnexion appelait en GET l’ancienne URL `/api/auth/signout` ; il utilise désormais POST `/api/auth/sign-out` et exige HTTP 200 avec `{ success: true }`. Le test CSRF utilisait également une ancienne URL : il appelle maintenant `/api/auth/sign-in/email` avec une origine tierce et `Sec-Fetch-Site: cross-site`, et exige HTTP 403 avec `INVALID_ORIGIN` (un HTTP 404 ou 500 ne suffit plus).
- **CI effective sur les branches de développement.** Les PR visant la branche de Claude et les push sur la branche Codex déclenchent désormais les contrôles. Les échecs TypeScript et ESLint ne sont plus masqués. Le lint reste rouge tant que les deux erreurs existantes ci-dessous ne sont pas traitées avec Claude.

## Points à coordonner avec Claude

1. **Priorité élevée — confidentialité des pièces jointes.** `src/lib/storage/files.ts`, fonction `storePrivate`, utilise `put(..., { access: 'public' })` sur Vercel Blob. Une URL aléatoire réduit la découverte mais ne constitue pas une autorisation : toute personne disposant du lien peut télécharger un CV ou une photo sans session. La route authentifiée ne couvre que le stockage local. Aucun accès aux données de production n'a été effectué. Prévoir un stockage réellement privé et une route authentifiée de lecture ; le choix du store, le traitement des liens existants et des notifications doivent être coordonnés avant modification. Aucune migration ni modification de fichiers existants réalisée.
2. **ESLint — deux erreurs dans l'interface existante**, règle `react-hooks/set-state-in-effect` : `src/app/gp8x2k4m/login/page.tsx:49` et `src/components/admin/services/ServiceEditorLayout.tsx:30`. Aucun changement de ces composants dans cette PR. Ce sont des erreurs de lint, sans preuve ici d'un dysfonctionnement utilisateur.
3. **Tests E2E de sécurité à renforcer ultérieurement.** Certains tests existants acceptent des résultats trop larges : le test CSRF de `e2e/security.spec.ts` accepte même HTTP 500, et plusieurs tests de connexion vérifient seulement la présence du formulaire. Leur passage seul ne démontre pas l'efficacité de toutes les protections. Les nouveaux tests ciblent précisément les conditions de refus côté serveur.

## Périmètre et sécurité de l'exécution

Aucune maquette, aucun composant graphique ni aucune variable d'environnement réelle modifiés. Aucun accès à une base distante, aucune migration, aucun seed. Une première passe a utilisé une URL PostgreSQL `127.0.0.1:1` non exploitable. Pour vérifier ensuite le pré-rendu et les parcours E2E, un conteneur PostgreSQL 15 jetable nommé `aspeo-codex-qa-postgres` a été créé, exposé exclusivement sur `127.0.0.1:55432`, avec des identifiants fictifs et une base vide `aspeo_qa`. `prisma db push` a créé le schéma uniquement dans cette base locale neuve. Aucun contenu de production importé. Les tests unitaires simulent les services. Les scripts de lancement et leurs valeurs fictives restent dans `/tmp`, hors du dépôt. Seule la branche Codex est publiée ; la PR vise la branche de Claude et reste en brouillon, sans fusion automatique.

## Audit des dépendances

`npm audit --omit=dev --json` signale 32 entrées dans le graphe audité : 3 critiques, 24 élevées, 4 modérées et 1 faible. Ce comptage ne signifie pas que chaque avis est exploitable avec la configuration actuelle. Les avis incluent notamment des plugins OAuth non activés ici et des outils de développement ; leur applicabilité doit être qualifiée. Aucune mise à jour globale automatique dans cette PR : Next.js et Better Auth sont partagés avec le développement de Claude, et plusieurs corrections proposées impliquent des versions majeures (notamment Nodemailer, Sharp et Zod). Prévoir une PR de dépendances coordonnée, avant mise en production.

- `next` verrouillé en `16.1.6` : sévérité maximale `critical`.
- `better-auth` verrouillé en `1.4.19` : sévérité maximale `critical`.
- `nodemailer` verrouillé en `7.0.13` : sévérité maximale `high`.
- `sharp` verrouillé en `0.34.5` : sévérité maximale `high`.
- `zod` verrouillé en `3.25.76` : sévérité maximale `high`.

Avis à examiner en priorité : [Next.js / Server Actions](https://github.com/advisories/GHSA-mq59-m269-xvcx), [Next.js / Image Optimization](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [Sharp / libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj). La présence de Server Actions et de traitements d’images justifie cette priorité, sans constituer une preuve d’exploitation.

## Résultats de validation

Environnement : Node.js 24.22.1, npm 11.9.0, Chromium système, PostgreSQL 15 local vide. La matrice Node.js 20 de GitHub Actions reste à vérifier sur la PR.

| Contrôle | Résultat |
| --- | --- |
| `npm ci` | Réussi, lockfile conservé, client Prisma généré |
| `npx tsc --noEmit` | Réussi |
| `npm test` | 21 fichiers, 424 tests réussis, dont 15 nouveaux tests de routes |
| `npm run lint` | 2 erreurs existantes dans les composants cités, aucune erreur sur les fichiers applicatifs corrigés |
| `npm run build` | Réussi avec la base jetable locale et `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` pour le proxy TLS de cet environnement |
| `git diff --check` | Réussi |

La première tentative de build sans base s'arrêtait au pré-rendu (Prisma P1001) ; les tentatives sans certificats système échouaient au téléchargement des polices Google. Ces limites de l'environnement ont été résolues sans changer le design ni les polices du projet.

Les E2E utilisent le serveur de développement local, des services SMTP inaccessibles (`127.0.0.1:1`), aucun identifiant Redis réel et le repli dev/test. Ils ne valident donc pas la délivrabilité des e-mails, Upstash réel, les parcours d'un administrateur authentifié ni les données de production.

### Playwright : résultats et limites

- Découverte : 67 tests répartis dans 4 fichiers.
- Première passe sans base : arrêt après 3 échecs ; les délais de compilation et l'absence de services empêchaient une validation complète.
- Sous-ensemble après compilation, encore sans base : 14/15 réussis ; le 500 sur une URL d'API inexistante disparaît avec la base locale et retourne bien une réponse admise par le test.
- Passe complète sur base jetable locale : **65/67 réussis** (`--workers=2 --retries=0 --timeout=60000 --max-failures=5`). Échecs : ancien endpoint de déconnexion et délai d'assertion de connexion invalide (15 secondes).
- Après correction du test de déconnexion et du faux positif CSRF, relance ciblée **3/3 réussis** : connexion invalide (13,7 secondes), déconnexion (200 + `success: true`), origine tierce (403 + `INVALID_ORIGIN`). Commande : `CI=true PW_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --workers=1 --retries=0 --grep 'should show error for invalid credentials|should handle logout endpoint|should reject foreign origin POST requests'`.

Tous les cas ont ainsi été exécutés ; cela ne constitue pas une nouvelle passe complète 67/67 verte. Le cas de connexion reste sensible aux délais du repli Redis et à la charge de compilation. Aucun timeout du dépôt n'a été augmenté et aucun test n'a été désactivé pour masquer cet échec.
