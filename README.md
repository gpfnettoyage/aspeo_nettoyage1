# GPF Nettoyage - ASPEO

Application web professionnelle pour une entreprise de nettoyage industriel et professionnel, desservant les regions Loire (42) et Rhone (69).

## Apercu

Site vitrine avec catalogue de services, blog d'actualites, et tableau de bord d'administration securise pour la gestion du contenu.

### Fonctionnalites publiques

- Catalogue de services de nettoyage avec pages detaillees
- Blog d'actualites (MDX)
- Espace medias et presse
- Formulaire de contact
- Page d'avis clients
- Pages legales (CGU, confidentialite, cookies, mentions legales)
- SEO optimise (sitemap, robots.txt, donnees structurees JSON-LD)
- Endpoint `/llms.txt` pour AI crawlers

### Tableau de bord administrateur

- Gestion des services (CRUD, publication/depublication)
- Gestion des categories
- Gestion des utilisateurs (SUPER_ADMIN uniquement)
- Dashboard de securite (bannissement IP, statistiques)
- Systeme d'audit des actions (90 jours)
- Gestion des appareils de confiance
- Configuration 2FA

## Stack technique

### Core

- **Next.js 16** - Framework React avec App Router + Proxy (ex-middleware)
- **React 19** - Bibliotheque UI
- **TypeScript 5** - Typage statique
- **Tailwind CSS 3** - Styling utility-first

### Base de donnees

- **Neon PostgreSQL** - Base de donnees serverless
- **Prisma 7** - ORM avec migrations
- **Backup automatise** - GitHub Actions + Neon Branching

### Authentification & Securite

- **BetterAuth** - Authentification avec plugin 2FA (TOTP)
- **Upstash Redis** - Rate limiting, cache, audit logs
- **bcryptjs** - Hachage des mots de passe (12 rounds)
- **Device Fingerprinting** - Verification des appareils

### UI

- **shadcn/ui** - Composants bases sur Radix UI
- **Lucide React** - Icones
- **Framer Motion** - Animations
- **Sonner** - Notifications toast

### Formulaires & Validation

- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schemas

### Autres

- **Nodemailer** - Envoi d'emails (SMTP OVH)
- **MDX** - Articles/actualites en Markdown enrichi
- **Vercel Analytics** - Metriques de performance

## Installation

### Prerequis

- Node.js 20+
- PostgreSQL 15+ (ou Neon)
- Redis (Upstash recommande)

### Configuration

1. Cloner le repository

```bash
git clone <repo-url>
cd gpf-nettoyage
```

2. Installer les dependances

```bash
npm install
```

3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Variables requises :

```env
# Base de donnees (Neon)
DATABASE_URL="postgresql://..."

# Authentification
BETTER_AUTH_SECRET="minimum-32-caracteres"

# Email (SMTP OVH)
OVH_EMAIL_USER="email@domain.com"
OVH_EMAIL_PASS="password"

# Redis (Upstash/Vercel KV)
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron jobs (GDPR cleanup)
CRON_SECRET="minimum-32-caracteres"
```

Variables optionnelles :

```env
DATABASE_URL_UNPOOLED=              # Pour migrations/backups
NEXT_PUBLIC_HOTJAR_ID=""
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=""
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=""
```

4. Initialiser la base de donnees

```bash
npx prisma db push
npm run db:seed  # Creer admin initial
```

5. Lancer le serveur de developpement

```bash
npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de developpement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Rapport de couverture |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run test:e2e:ui` | Tests E2E avec UI |
| `npm run test:all` | Tous les tests |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seeder admin initial |

## Architecture

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (legal)/           # Pages legales
│   ├── gp8x2k4m/          # Panel admin (route obfusquee)
│   │   ├── login/         # Authentification
│   │   ├── security/      # Parametres securite
│   │   ├── services/      # Gestion services
│   │   ├── categories/    # Gestion categories
│   │   └── users/         # Gestion utilisateurs
│   ├── api/               # Routes API
│   │   ├── auth/          # BetterAuth endpoints
│   │   └── cron/          # Jobs planifies
│   ├── proprete-services/ # Catalogue services
│   ├── medias/            # Blog & presse
│   │   ├── actualites/    # Articles MDX
│   │   └── presse/        # Revue de presse
│   ├── contact/           # Formulaire contact
│   └── avis/              # Page avis
├── actions/               # Server Actions
│   ├── auth/              # Authentification
│   │   ├── auth.actions   # Login, 2FA, device verification
│   │   ├── device.actions # Appareils de confiance
│   │   ├── session.actions# Gestion sessions
│   │   └── password.actions# Reset mot de passe
│   ├── services/          # Gestion services
│   ├── categories/        # Gestion categories
│   ├── users/             # Gestion utilisateurs
│   └── security/          # IP ban, stats
├── components/
│   ├── admin/             # Composants admin
│   │   ├── TwoFactorSetup # Configuration 2FA
│   │   ├── TwoFactorVerify# Verification 2FA
│   │   ├── DeviceVerification# Verification appareil
│   │   ├── TrustedDevices # Liste appareils
│   │   └── SecurityDashboard# Stats securite
│   ├── ui/                # Composants shadcn/ui
│   └── common/            # Composants partages
├── content/
│   └── actualites/        # Articles MDX
├── lib/                   # Utilitaires
│   ├── auth.ts            # Config BetterAuth
│   ├── permissions.ts     # RBAC
│   ├── security.ts        # IP ban, failed attempts
│   ├── trusted-device.ts  # Fingerprinting
│   ├── redis.ts           # Rate limiting
│   ├── audit.ts           # Audit logging
│   ├── prisma.ts          # Client Prisma
│   ├── email.ts           # Templates email
│   ├── env.ts             # Validation env vars
│   ├── constants/         # Constantes
│   └── utils/             # Helpers (ip, security hash)
├── types/                 # Types TypeScript
└── proxy.ts               # Edge security (ex-middleware)
```

## Securite

### Authentification

- Sessions de 24h avec tracking IP/user-agent
- 2FA obligatoire pour SUPER_ADMIN et ADMIN (TOTP)
- Verification d'appareil par email pour nouveaux devices
- Codes de secours chiffres pour recuperation 2FA
- Device fingerprinting (SHA-256, multi-signaux)

### Protection

- Rate limiting multi-couches :
  - IP: 5 tentatives/60s
  - Email: 10 tentatives/15min
  - 2FA: 5 tentatives/15min
- Bannissement IP auto apres 10 echecs
- Delai artificiel de 1.5s sur login (anti-timing)
- Fail-closed en production (Redis down = deny)
- Headers de securite stricts (CSP, HSTS, X-Frame-Options)

### Roles (RBAC)

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Acces total, gestion utilisateurs |
| ADMIN | Gestion contenu + securite |
| EDITOR | Creation/modification contenu |
| VIEWER | Lecture seule dashboard |
| USER | Site public uniquement |

### Audit

- Logging Redis des actions (90 jours TTL)
- Actions tracees : CREATE, UPDATE, DELETE, PUBLISH, LOGIN, LOGIN_FAILED, LOGOUT
- Fallback console si Redis down

## Tests

### Tests unitaires (Vitest)

- Permissions et hierarchie des roles
- Validation IP et utilitaires de securite
- Fingerprinting d'appareils
- Hash et crypto

### Tests d'integration

- Flux d'authentification
- Verification d'appareil
- Reset mot de passe
- CRUD utilisateurs

### Tests E2E (Playwright)

- Flux de connexion complet
- Controle d'acces par role
- Headers de securite
- Protection brute force

## Deploiement

### Vercel (recommande)

Le projet est configure pour Vercel avec :

- **Neon PostgreSQL** - Base de donnees serverless
- **Upstash Redis** - Rate limiting (ou Vercel KV)
- **Cron jobs** - Nettoyage GDPR quotidien (3h UTC)

```bash
vercel deploy
```

### Backup automatise

GitHub Actions execute un backup quotidien via Neon Branching :
- Cron: 3h UTC chaque jour
- Retention: 7 jours
- Point-in-time recovery via branches

Configuration requise :
- Secret `NEON_API_KEY_BACKUP` dans GitHub

### CI/CD

Pipeline GitHub Actions :

1. Tests unitaires et integration
2. Tests E2E avec PostgreSQL
3. Verification TypeScript
4. Linting ESLint

## Modele de donnees

### Entites principales

- **User** - Utilisateurs avec roles et 2FA
- **Session** - Sessions avec IP/user-agent
- **TwoFactor** - Secrets TOTP chiffres + backup codes
- **TrustedDevice** - Appareils de confiance (fingerprint)
- **DeviceVerification** - Codes de verification en attente
- **Service** - Services de nettoyage (contenu JSON riche)
- **Category** - Categories de services

## Variables d'environnement

Voir `.env.example` pour la liste complete.

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Oui | Connection Prisma |
| `BETTER_AUTH_SECRET` | Oui | Secret auth (32+ chars) |
| `OVH_EMAIL_USER` | Oui | Email SMTP |
| `OVH_EMAIL_PASS` | Oui | Password SMTP |
| `KV_REST_API_URL` | Oui | Redis URL |
| `KV_REST_API_TOKEN` | Oui | Redis token |
| `NEXT_PUBLIC_APP_URL` | Oui | URL publique |
| `CRON_SECRET` | Oui | Secret cron (32+ chars) |

## Licence

Projet prive - Tous droits reserves
