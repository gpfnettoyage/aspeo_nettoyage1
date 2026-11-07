'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CreateServiceInput } from '@/actions/services/schema';
import ServicePreview from './ServicePreview';
import SERPPreview from './SERPPreview';
import SEOScoreCard from './SEOScoreCard';
import { Eye, Search, Sparkles, Copy, Check } from 'lucide-react';
import { COMPANY } from '@/constants/company';

interface PreviewTabsProps {
  data: CreateServiceInput;
}

/**
 * AI Prompt Generator - génère un prompt optimisé pour remplir le service
 */
function AIPromptPreview({ data }: { data: CreateServiceInput }) {
  const [copied, setCopied] = useState(false);

  // Calculer les champs remplis (pour stats) et contexte existant
  const content = data.content;

  const filledCount = [
    data.title, data.slug, data.subtitle, data.seoTitle, data.seoDesc,
    content?.introText, content?.contextText, content?.expertise?.title,
    content?.targetSpaces?.length, content?.prestationsCategories?.length,
    content?.subServices?.length, content?.process?.length,
    content?.guarantees?.length, content?.applicationSectors?.length,
    content?.whyChoose?.length, content?.faq?.length
  ].filter(Boolean).length;

  const totalFields = 16;
  const emptyCount = totalFields - filledCount;

  // Contexte existant pour aider l'IA
  const existingContext: string[] = [];
  if (data.title) existingContext.push(`Titre actuel: "${data.title}"`);
  if (data.subtitle) existingContext.push(`Sous-titre actuel: "${data.subtitle}"`);
  if (content?.introText) existingContext.push(`Intro existante: "${content.introText.substring(0, 100)}..."`);
  if (content?.expertise?.title) existingContext.push(`Section expertise: "${content.expertise.title}"`);

  // Générer le prompt expert SEO local avec TOUS les champs
  const prompt = `# RÔLE
Tu es un expert SEO senior spécialisé dans le référencement local pour les entreprises de services B2B en France. Tu maîtrises les techniques de rédaction SEO, le maillage sémantique, et l'optimisation pour le pack local Google.

# CONTEXTE ENTREPRISE
- **Entreprise**: ${COMPANY.fullName} (${COMPANY.name})
- **Siège**: ${COMPANY.address.full}
- **Zone d'intervention**: Départements Loire (42) et Rhône (69) - Région Auvergne-Rhône-Alpes
- **Villes principales**: Saint-Étienne, Lyon, Roanne, Feurs, Montbrison, Villefranche-sur-Saône
- **Secteur**: Nettoyage professionnel B2B (bureaux, commerces, industries, copropriétés)
- **Contact**: ${COMPANY.phone} | ${COMPANY.email}
- **Site web**: ${COMPANY.website}

# SERVICE À RÉDIGER
${data.title ? `**Titre du service**: "${data.title}"` : '**Service**: (à définir par l\'utilisateur)'}
${data.slug ? `**URL cible**: ${COMPANY.website}/services/${data.slug}` : ''}
${existingContext.length > 0 ? `\n**Contexte existant:**\n${existingContext.map(c => `- ${c}`).join('\n')}` : ''}

# CHAMPS À GÉNÉRER (JSON complet)

**IMPORTANT**: Ne génère PAS le champ "seoTitle" car il est auto-généré par le formulaire avec le format: "[Titre] | ${COMPANY.name} Nettoyage Loire & Rhône"

Génère TOUS les champs suivants en JSON:

\`\`\`json
{
  "seoDesc": "string (max 155 car.) - Description méta pour Google avec service + zone géo + bénéfice + CTA",
  "subtitle": "string - Accroche courte affichée sur les cartes de services",
  "introText": "string - Texte d'introduction du hero (2-3 phrases, mot-clé + localisation dans les 100 premiers car.)",
  "contextText": "string - Paragraphe de contexte après le hero (3-4 phrases)",
  "expertise": {
    "title": "string - Titre de la section expertise (ex: Notre expertise en [service])",
    "description": "string - Description détaillée de l'expertise (2-3 paragraphes)",
    "highlights": ["string", "string", "..."] // 4-6 points forts
  },
  "targetSpaces": ["string", "string", "..."], // 4-8 types d'espaces concernés
  "prestationsCategories": [
    {
      "title": "string - Nom de la catégorie",
      "items": ["string", "string", "..."] // 3-5 prestations par catégorie
    }
    // 2-4 catégories
  ],
  "subServices": [
    {
      "name": "string - Nom du sous-service",
      "description": "string - Description détaillée (2-3 phrases)"
    }
    // 3-6 sous-services
  ],
  "process": [
    {
      "step": 1,
      "title": "string - Titre de l'étape",
      "description": "string - Description de l'étape",
      "duration": "string - Ex: '30 min', '1-2h', 'Variable'"
    }
    // 4-6 étapes
  ],
  "guarantees": ["string", "string", "..."], // 4-6 garanties
  "applicationSectors": ["string", "string", "..."], // 4-8 secteurs d'application
  "whyChoose": ["string", "string", "..."], // 4-6 raisons de nous choisir
  "faq": [
    {
      "question": "string - Question incluant variation géographique",
      "answer": "string - Réponse détaillée (2-4 phrases)"
    }
    // 4-6 questions
  ]
}
\`\`\`

# DIRECTIVES SEO LOCAL

## Mots-clés géographiques à intégrer naturellement
- Primaires: "Loire", "Rhône", "Saint-Étienne", "Lyon"
- Secondaires: "42", "69", "région lyonnaise", "stéphanois", "Auvergne-Rhône-Alpes"
- Long tail: "nettoyage [service] Saint-Étienne", "entreprise nettoyage Lyon", "[service] Loire Rhône"

## Règles SEO
1. **seoDesc**: max 155 car., inclure service + zone + bénéfice + CTA implicite
2. **introText**: mot-clé principal + localisation dans les 100 premiers caractères
3. **FAQ**: au moins 2 questions avec variations géographiques ("dans la Loire", "à Lyon", "en région stéphanoise")
4. **Note**: Le seoTitle est auto-généré par le formulaire, ne pas le fournir

## Ton et style
- Professionnel mais accessible, orienté bénéfices clients
- Vocabulaire technique du nettoyage professionnel
- Éviter le jargon marketing creux et les superlatifs vides

## Spécificités sectorielles à mentionner
- Équipements professionnels, produits éco-responsables, personnel formé
- Flexibilité horaires, devis gratuit, intervention rapide
- Assurance RC Pro, respect des normes d'hygiène

# FORMAT DE RÉPONSE
Réponds UNIQUEMENT avec le JSON valide complet, sans commentaires ni explications.`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 min-w-0 overflow-hidden">
      {/* Header avec bouton copier */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-sm">Prompt IA</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="h-7 text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copier
            </>
          )}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="text-lg font-bold text-green-700">{filledCount}/{totalFields}</div>
          <div className="text-[10px] text-green-600">Champs remplis</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <div className="text-lg font-bold text-orange-700">{emptyCount}</div>
          <div className="text-[10px] text-orange-600">Champs à compléter</div>
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-white rounded-lg border p-3 min-w-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-[10px] leading-relaxed whitespace-pre-wrap">
            <code>{prompt}</code>
          </pre>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-1">
        <p className="text-[10px] text-purple-700">
          <strong>💡 Utilisation :</strong> Copiez ce prompt et collez-le dans Claude, ChatGPT ou Gemini.
        </p>
        <p className="text-[10px] text-purple-600">
          Puis cliquez sur &quot;Importer IA&quot; en haut de page pour coller le résultat.
        </p>
      </div>
    </div>
  );
}

export default function PreviewTabs({ data }: PreviewTabsProps) {
  return (
    <Tabs defaultValue="preview" className="w-full min-w-0 overflow-hidden">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs">
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Aperçu</span>
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex items-center gap-1.5 text-xs">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SEO</span>
        </TabsTrigger>
        <TabsTrigger value="ai-prompt" className="flex items-center gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prompt IA</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-0">
        <div className="bg-gray-100 rounded-lg p-2 overflow-hidden">
          <ServicePreview data={data} />
        </div>
      </TabsContent>

      <TabsContent value="seo" className="mt-0 space-y-4">
        <SEOScoreCard
          title={data.title}
          seoTitle={data.seoTitle || ''}
          seoDesc={data.seoDesc || ''}
          slug={data.slug}
          content={{
            descriptions: data.content?.descriptions,
            introText: data.content?.introText,
            faq: data.content?.faq,
          }}
        />
        <SERPPreview
          title={data.seoTitle || data.title}
          slug={data.slug}
          description={data.seoDesc || data.content?.descriptions?.[0] || ''}
        />
      </TabsContent>

      <TabsContent value="ai-prompt" className="mt-0 min-w-0 overflow-hidden">
        <AIPromptPreview data={data} />
      </TabsContent>
    </Tabs>
  );
}
