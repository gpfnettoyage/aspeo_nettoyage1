# Guide de gestion des actualités MDX

Ce guide vous explique comment ajouter et modifier les actualités du site web Aspeo en utilisant le format **MDX** (Markdown + JSX).

## 📁 Fichiers concernés

- **Dossier des actualités** : `src/content/actualites/`
- Chaque actualité est un fichier `.mdx` dans ce dossier
- **Images** : `public/img/actu/[slug-de-l-actualite]/` (chaque actualité a son propre sous-dossier)

## 📝 Structure d'une actualité MDX

Chaque fichier `.mdx` contient deux parties :
1. **Les métadonnées** (en haut du fichier)
2. **Le contenu** (en Markdown)

### Exemple complet

```mdx
export const metadata = {
  id: 1,
  slug: 'aspeo-lance-nouveaux-services',
  title: 'Aspeo lance 5 nouveaux services écologiques',
  excerpt: 'Nous sommes ravis d\'annoncer le lancement de nos nouveaux services de nettoyage écologique.',
  image: '/img/actu/aspeo-lance-nouveaux-services/hero.webp',
  date: '2026-01-07',
  category: 'Innovation',
  tags: ['Écologie', 'Nouveaux services', 'Innovation']
}

Aspeo Propreté & Services est **fier de présenter** sa nouvelle gamme de services écologiques pour l'année 2026.

![Image d'introduction](/img/actu/aspeo-lance-nouveaux-services/hero.webp)

## Les 5 nouveaux services

- **Nettoyage 100% écologique** : Utilisation exclusive de produits biodégradables
- **Intervention rapide 24/7** : Disponibilité permanente
- **Service premium bureaux** : Solution complète pour espaces professionnels

![Nos services de nettoyage](/img/actu/aspeo-lance-nouveaux-services/services-bureaux.webp)

Notre objectif ? Devenir **le leader régional** de la propreté écologique d'ici 2028.
```

## 📋 Métadonnées obligatoires

| Champ | Description | Exemple |
|-------|-------------|---------|
| **id** | Numéro unique (incrémentiel) | `1`, `2`, `3`... |
| **slug** | Identifiant URL (minuscules, tirets) | `"nouveaux-services-2026"` |
| **title** | Titre de l'actualité | `"Aspeo lance de nouveaux services"` |
| **excerpt** | Résumé court (2-3 phrases) | `"Découvrez nos nouveaux services..."` |
| **image** | Image principale (hero) | `"/img/actu/[slug]/hero.webp"` |
| **date** | Date de publication (AAAA-MM-JJ) | `"2026-01-07"` |

## 📋 Métadonnées optionnelles

| Champ | Description | Exemple |
|-------|-------------|---------|
| **dateModified** | Date de modification (AAAA-MM-JJ) | `"2026-01-10"` (par défaut = date) |
| **category** | Catégorie de l'actualité | `"Innovation"`, `"Entreprise"`, `"Environnement"` |
| **tags** | Liste de mots-clés (tableau) | `["Écologie", "Services"]` |
| **faq** | Questions fréquentes (tableau d'objets) | Voir section FAQ ci-dessous |
| **cta** | Call-to-Action (objet) | Voir section CTA ci-dessous |

## 📸 Organisation des images

### Structure des dossiers

Chaque actualité possède son propre sous-dossier d'images organisé comme suit :

```
public/
└── img/
    └── actu/
        ├── nettoyage-professionnel-feurs-aspeo/
        │   ├── hero.webp              (image principale)
        │   ├── image-1.webp           (autres images)
        │   └── image-2.webp
        └── hygiene-proprete-entreprise/
            ├── hero.webp
            └── image-1.webp
```

### Nommer vos images

1. **Image principale** : Toujours nommer `hero.webp`
2. **Images secondaires** : Nommer de façon descriptive (`equipe.webp`, `bureaux.webp`, etc.)

### Utilisation dans le MDX

```markdown
![Description de l'image](/img/actu/[slug-de-votre-actu]/hero.webp)
![Autre image](/img/actu/[slug-de-votre-actu]/image-1.webp)
```

**Exemple concret** pour l'actualité `nettoyage-professionnel-feurs-aspeo` :
```markdown
![Vue de Feurs](/img/actu/nettoyage-professionnel-feurs-aspeo/hero.webp)
![Équipe Aspeo](/img/actu/nettoyage-professionnel-feurs-aspeo/equipe.webp)
```

**Avantages de cette organisation** :
- Images groupées par actualité pour une meilleure organisation
- Facile de retrouver et gérer les images d'un article
- Pas de conflit de noms entre actualités
- Syntaxe simple et familière
- Images automatiquement optimisées par Next.js

## ✏️ Comment créer une nouvelle actualité

### Étape 1 : Créer le slug

Le slug devient le nom du fichier. Il doit être :
- En minuscules
- Sans accents
- Avec des tirets à la place des espaces
- Sans caractères spéciaux

**Exemples :**
- Titre : "Aspeo ouvre une nouvelle agence"
- Slug : `nouvelle-agence-lyon`
- Fichier : `nouvelle-agence-lyon.mdx`

### Étape 2 : Créer le fichier MDX

1. Dans le dossier `src/content/actualites/`
2. Créez un nouveau fichier : `votre-slug.mdx`
3. Copiez la structure d'exemple ci-dessus
4. Modifiez les métadonnées et le contenu

### Étape 3 : Rédiger le contenu

Le contenu utilise la syntaxe **Markdown** standard :

#### Titres
```markdown
## Titre de niveau 2
### Titre de niveau 3
```

#### Texte en gras
```markdown
Texte normal et **texte en gras**.
```

#### Listes à puces
```markdown
- Premier élément
- Deuxième élément
- Troisième élément
```

#### Listes numérotées
```markdown
1. Première étape
2. Deuxième étape
3. Troisième étape
```

#### Liens hypertextes

**Liens internes** (vers une page de votre site) :
```markdown
[Texte du lien](/chemin-de-la-page)
```
Exemples : `[Nos services](/proprete-services)` ou `[Contactez-nous](/contact)`

**Liens externes** (vers un site externe) :
```markdown
[Texte du lien](https://exemple.com)
```
Les liens externes s'ouvrent automatiquement dans un nouvel onglet.

**Style automatique des liens** :
- Couleur primaire distinctive pour une meilleure visibilité
- Soulignement élégant qui devient plus prononcé au survol
- Animation fluide de 200ms lors du passage de la souris
- Optimisés pour l'accessibilité et les normes web

## 🖼️ Gestion des images

### Format des images

- **Format** : `.webp` (obligatoire)
- **Taille recommandée** : 1200x800 pixels (ratio 3:2)
- **Poids** : Moins de 200 Ko si possible
- **Nom du fichier** : Descriptif en minuscules avec tirets

## 📅 Format de date

Utilisez toujours le format **AAAA-MM-JJ** :

- ✅ Correct : `"2026-01-07"`
- ❌ Incorrect : `"07/01/2026"` ou `"7 janvier 2026"`

**Note importante** : Les dates sont automatiquement converties au format ISO 8601 avec fuseau horaire (ex: `2026-01-07T00:00:00+01:00`) dans le JSON-LD pour la conformité Schema.org. Vous n'avez pas besoin de spécifier l'heure ou le fuseau horaire dans les métadonnées MDX.

**Date de modification** : Si vous ne spécifiez pas `dateModified`, elle sera automatiquement égale à `date`. Utilisez `dateModified` uniquement si l'actualité a été modifiée après sa publication initiale.

## 🏷️ Catégories disponibles

Catégories suggérées (vous pouvez en créer d'autres) :

- `"Innovation"`
- `"Entreprise"`
- `"Environnement"`
- `"Services"`
- `"Certifications"`

## 📝 Exemple complet d'actualité

**Fichier** : `src/content/actualites/certification-iso-9001.mdx`

```mdx
export const metadata = {
  id: 2,
  slug: 'certification-iso-9001',
  title: 'Aspeo obtient la certification ISO 9001',
  excerpt: 'Une reconnaissance de notre engagement pour la qualité et l\'excellence opérationnelle.',
  image: '/img/actu/certification-iso-9001/certification-iso.webp',
  date: '2025-12-15',
  category: 'Entreprise',
  tags: ['Certification', 'Qualité', 'ISO 9001']
}

Nous sommes **très fiers d'annoncer** qu'Aspeo vient d'obtenir la prestigieuse **certification ISO 9001**.

## Qu'est-ce que la certification ISO 9001 ?

La norme ISO 9001 est une référence mondiale en matière de management de la qualité.

## Les bénéfices pour nos clients

1. **Une qualité de service optimale**
2. **Des processus standardisés**
3. **Une amélioration continue**

Merci à nos équipes pour leur implication !
```

## ⚠️ Points d'attention

### 1. Nom du fichier = slug

Le nom du fichier `.mdx` DOIT correspondre exactement au slug dans les métadonnées.

```javascript
// Fichier: nouveaux-services-2026.mdx
export const metadata = {
  slug: 'nouveaux-services-2026', // ✅ Identique au nom du fichier
  // ...
}
```

### 2. ID unique

Chaque actualité doit avoir un `id` unique. Utilisez le numéro suivant disponible.

### 3. Apostrophes dans les métadonnées

Dans les métadonnées JavaScript, échappez les apostrophes avec `\` :

```javascript
title: 'L\'actualité d\'Aspeo',
excerpt: 'Nous sommes ravis d\'annoncer...',
```

### 4. URLs générées

L'URL de l'actualité sera automatiquement :
```
https://www.aspeo.fr/medias/actualites/[slug]
```

## 🔍 Vérification avant publication

Avant de sauvegarder, vérifiez :

- [ ] Le nom du fichier correspond au slug
- [ ] L'`id` est unique
- [ ] Le `slug` est bien formaté (minuscules, tirets)
- [ ] La `date` est au format AAAA-MM-JJ
- [ ] Les chemins d'images sont corrects
- [ ] Les apostrophes sont échappées dans les métadonnées
- [ ] Le contenu est rédigé en Markdown valide

## ✅ Validation JSON-LD (Schema.org)

Les actualités génèrent automatiquement des données structurées JSON-LD conformes à Schema.org pour améliorer le référencement. Les éléments suivants sont automatiquement gérés :

- **Dates** : Conversion automatique au format ISO 8601 avec fuseau horaire (`YYYY-MM-DDTHH:mm:ss+01:00`)
  - `datePublished` : Date de publication (obligatoire)
  - `dateModified` : Date de modification (optionnelle, par défaut = datePublished)
- **Auteur** : "Équipe Aspeo" avec URL automatique
- **Publisher** : Organisation avec logo
- **FAQ** : Génération automatique du schéma FAQPage si une FAQ est présente

**Test de validation** : Utilisez [Google Rich Results Test](https://search.google.com/test/rich-results) pour valider vos JSON-LD après publication.

## 🛠️ Outils utiles

### Aperçu Markdown

- Visual Studio Code avec l'extension "Markdown Preview Enhanced"
- Typora (éditeur Markdown visuel)

### Validation

- Le build Next.js vous alertera en cas d'erreur
- Testez localement avec `npm run dev`

## ❓ Ajouter une FAQ (Optionnel)

La FAQ apparaît après le contenu principal avec un accordéon interactif.

### Format de la FAQ

```javascript
faq: [
  {
    question: 'Votre première question ?',
    answer: 'La réponse détaillée à cette question.'
  },
  {
    question: 'Votre deuxième question ?',
    answer: 'La réponse détaillée à cette deuxième question.'
  }
]
```

### Exemple complet

```javascript
faq: [
  {
    question: 'Quels produits utilisez-vous ?',
    answer: 'Nous utilisons exclusivement des produits certifiés Ecocert, biodégradables à 99%.'
  },
  {
    question: 'Quel est le délai d\'intervention ?',
    answer: 'Nous intervenons sous 24h pour les demandes urgentes, sous 48h en temps normal.'
  }
]
```

## 📢 Ajouter un CTA (Optionnel)

Le CTA (Call-to-Action) apparaît dans une carte mise en évidence après la FAQ.

### Format du CTA

```javascript
cta: {
  title: 'Titre accrocheur de votre CTA',
  description: 'Description courte qui incite à l\'action (1-2 phrases).',
  buttonText: 'Texte du bouton',
  buttonLink: '/contact#contact-form' // Lien interne ou externe
}
```

### Exemple complet

```javascript
cta: {
  title: 'Prêt à passer au vert ?',
  description: 'Demandez votre devis gratuit pour notre service de nettoyage écologique.',
  buttonText: 'Obtenir un devis gratuit',
  buttonLink: '/contact#contact-form'
}
```

### Exemples de CTA selon le type d'actualité

**Pour un nouveau service** :
```javascript
cta: {
  title: 'Intéressé par ce nouveau service ?',
  description: 'Nos experts sont à votre disposition pour vous conseiller.',
  buttonText: 'Demander un devis',
  buttonLink: '/contact#contact-form'
}
```

**Pour une certification** :
```javascript
cta: {
  title: 'Besoin d\'un prestataire certifié ?',
  description: 'Découvrez comment notre certification peut bénéficier à votre entreprise.',
  buttonText: 'En savoir plus',
  buttonLink: '/proprete-services'
}
```

**Pour un recrutement** :
```javascript
cta: {
  title: 'Rejoignez notre équipe !',
  description: 'Nous recherchons des talents passionnés pour accompagner notre croissance.',
  buttonText: 'Voir les offres',
  buttonLink: '/contact#contact-form'
}
```

## 📞 Avantages du MDX

### ✅ Par rapport au JSON

- **Écriture naturelle** : Rédigez directement en Markdown
- **Formatage automatique** : Titres, listes, gras, italique
- **Meilleure lisibilité** : Pas de `\n\n` pour les retours à la ligne
- **Prévisualisation** : Aperçu direct dans l'éditeur
- **Extensible** : FAQ et CTA intégrés facilement

### Exemple de différence

**Avant (JSON)** :
```json
"content": "Premier paragraphe.\n\nDeuxième paragraphe.\n\n• Point 1\n• Point 2"
```

**Maintenant (MDX)** :
```markdown
Premier paragraphe.

Deuxième paragraphe.

- Point 1
- Point 2
```

---

**Dernière mise à jour** : Janvier 2026
