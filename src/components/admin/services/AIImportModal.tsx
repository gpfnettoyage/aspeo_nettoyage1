'use client';

import { useState, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Upload,
  AlertCircle,
  CheckCircle2,
  Code2,
  FileJson,
} from 'lucide-react';
import {
  CreateServiceInput,
  serviceSeoDescSchema,
  serviceSeoTitleSchema,
  serviceSlugSchema,
  serviceSubtitleSchema,
  serviceTitleSchema,
} from '@/actions/services/schema';

// Schema pour l'import JSON depuis l'IA
const aiImportSchema = z
  .object({
    title: serviceTitleSchema.optional(),
    slug: serviceSlugSchema.optional(),
    subtitle: serviceSubtitleSchema,
    seoTitle: serviceSeoTitleSchema,
    seoDesc: serviceSeoDescSchema,
    introText: z.string().optional(),
    contextText: z.string().optional(),
    expertise: z
      .object({
        title: z.string(),
        description: z.string(),
        highlights: z.array(z.string()),
      })
      .optional(),
    targetSpaces: z.array(z.string()).optional(),
    prestationsCategories: z
      .array(
        z.object({
          title: z.string(),
          items: z.array(z.string()),
        }),
      )
      .optional(),
    subServices: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    process: z
      .array(
        z.object({
          step: z.number(),
          title: z.string(),
          description: z.string(),
          duration: z.string(),
        }),
      )
      .optional(),
    guarantees: z.array(z.string()).optional(),
    applicationSectors: z.array(z.string()).optional(),
    whyChoose: z.array(z.string()).optional(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
  })
  .passthrough();

interface AIImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateServiceInput>;
}

// Traduire les noms de champs pour l'affichage
const fieldLabels: Record<string, string> = {
  title: 'Titre',
  slug: 'Slug',
  subtitle: 'Sous-titre',
  seoTitle: 'Titre SEO',
  seoDesc: 'Description SEO',
  introText: "Texte d'intro",
  contextText: 'Texte contexte',
  expertise: 'Expertise',
  targetSpaces: 'Espaces cibles',
  prestationsCategories: 'Prestations',
  subServices: 'Sous-services',
  process: 'Processus',
  guarantees: 'Garanties',
  applicationSectors: 'Secteurs',
  whyChoose: 'Pourquoi nous',
  faq: 'FAQ',
};

// Extraire le JSON d'un bloc de code markdown si présent
function extractJson(input: string): string {
  const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)```/;
  const match = input.match(codeBlockPattern);
  if (match) {
    return match[1].trim();
  }
  return input.trim();
}

export default function AIImportModal({
  open,
  onOpenChange,
  form,
}: AIImportModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [importedFields, setImportedFields] = useState<string[]>([]);

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setJsonInput('');
      setImportStatus('idle');
      setImportError(null);
      setImportedFields([]);
    }
    onOpenChange(newOpen);
  };

  // Parse et preview le JSON (useMemo au lieu de useEffect)
  const parsedPreview = useMemo(() => {
    if (!jsonInput.trim()) {
      return null;
    }
    try {
      const cleanJson = extractJson(jsonInput);
      return JSON.parse(cleanJson) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [jsonInput]);

  // Handle import
  const handleImport = () => {
    setImportError(null);
    setImportedFields([]);
    setImportStatus('idle');

    if (!jsonInput.trim()) {
      setImportError("Veuillez coller le JSON généré par l'IA");
      setImportStatus('error');
      return;
    }

    try {
      const cleanJson = extractJson(jsonInput);
      const parsed = JSON.parse(cleanJson);
      const validated = aiImportSchema.safeParse(parsed);

      if (!validated.success) {
        const errors = validated.error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        setImportError(`Erreurs de validation:\n${errors.join('\n')}`);
        setImportStatus('error');
        return;
      }

      const importedData = validated.data;
      const fields: string[] = [];
      const currentValues = form.getValues();

      // Champs racine
      if (importedData.title) {
        form.setValue('title', importedData.title);
        fields.push('title');
      }
      if (importedData.slug) {
        form.setValue('slug', importedData.slug);
        fields.push('slug');
      }
      if (importedData.subtitle) {
        form.setValue('subtitle', importedData.subtitle);
        fields.push('subtitle');
      }
      if (importedData.seoTitle) {
        form.setValue('seoTitle', importedData.seoTitle);
        fields.push('seoTitle');
      }
      if (importedData.seoDesc) {
        form.setValue('seoDesc', importedData.seoDesc);
        fields.push('seoDesc');
      }

      // Champs content
      const contentFields: Record<string, unknown> = {};
      if (importedData.introText) {
        contentFields.introText = importedData.introText;
        fields.push('introText');
      }
      if (importedData.contextText) {
        contentFields.contextText = importedData.contextText;
        fields.push('contextText');
      }
      if (importedData.expertise) {
        contentFields.expertise = importedData.expertise;
        fields.push('expertise');
      }
      if (importedData.targetSpaces) {
        contentFields.targetSpaces = importedData.targetSpaces;
        fields.push('targetSpaces');
      }
      if (importedData.prestationsCategories) {
        contentFields.prestationsCategories =
          importedData.prestationsCategories;
        fields.push('prestationsCategories');
      }
      if (importedData.subServices) {
        contentFields.subServices = importedData.subServices;
        fields.push('subServices');
      }
      if (importedData.process) {
        contentFields.process = importedData.process;
        fields.push('process');
      }
      if (importedData.guarantees) {
        contentFields.guarantees = importedData.guarantees;
        fields.push('guarantees');
      }
      if (importedData.applicationSectors) {
        contentFields.applicationSectors = importedData.applicationSectors;
        fields.push('applicationSectors');
      }
      if (importedData.whyChoose) {
        contentFields.whyChoose = importedData.whyChoose;
        fields.push('whyChoose');
      }
      if (importedData.faq) {
        contentFields.faq = importedData.faq;
        fields.push('faq');
      }

      if (fields.length === 0) {
        setImportError('Aucun champ valide trouvé dans le JSON');
        setImportStatus('error');
        return;
      }

      // Merger content - utiliser shouldDirty pour que useFieldArray se synchronise
      if (Object.keys(contentFields).length > 0) {
        const mergedContent = { ...currentValues.content, ...contentFields };
        form.setValue('content', mergedContent, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // Forcer la mise à jour des arrays pour useFieldArray
        if (contentFields.faq) {
          form.setValue(
            'content.faq',
            contentFields.faq as Array<{ question: string; answer: string }>,
            { shouldDirty: true },
          );
        }
        if (contentFields.subServices) {
          form.setValue(
            'content.subServices',
            contentFields.subServices as Array<{
              name: string;
              description: string;
            }>,
            { shouldDirty: true },
          );
        }
        if (contentFields.process) {
          form.setValue(
            'content.process',
            contentFields.process as Array<{
              step: number;
              title: string;
              description: string;
              duration: string;
            }>,
            { shouldDirty: true },
          );
        }
        if (contentFields.prestationsCategories) {
          form.setValue(
            'content.prestationsCategories',
            contentFields.prestationsCategories as Array<{
              title: string;
              items: string[];
            }>,
            { shouldDirty: true },
          );
        }
      }

      setImportedFields(fields);
      setImportStatus('success');

      toast.success('Données importées', {
        description: `${fields.length} champ(s) importé(s).`,
      });

      // Fermer le modal après 1.5s
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setImportError('JSON invalide. Vérifiez le format et réessayez.');
      } else {
        setImportError(
          `Erreur: ${e instanceof Error ? e.message : 'Erreur inconnue'}`,
        );
      }
      setImportStatus('error');
    }
  };

  // Compter les champs détectés
  const detectedFieldsCount = parsedPreview
    ? Object.keys(parsedPreview).length
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Importer depuis l&apos;IA
          </DialogTitle>
          <DialogDescription>
            Collez le JSON généré par Claude, ChatGPT ou Gemini.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Input zone */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                JSON à importer
              </label>
              {detectedFieldsCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {detectedFieldsCount} champs détectés
                </span>
              )}
            </div>
            <textarea
              placeholder={`{
  "seoDesc": "Description SEO optimisée...",
  "subtitle": "Sous-titre accrocheur...",
  "introText": "Texte d'introduction...",
  ...
}`}
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                if (importStatus !== 'idle') {
                  setImportStatus('idle');
                  setImportError(null);
                  setImportedFields([]);
                }
              }}
              className="flex-1 min-h-[200px] font-mono text-xs resize-none rounded-lg p-4 bg-[#1e1e1e] text-[#d4d4d4] placeholder:text-[#6a6a6a] border-0 outline-none focus:ring-1 focus:ring-[#3b3b3b] selection:bg-[#264f78]"
              spellCheck={false}
            />
          </div>

          {/* Preview des champs détectés */}
          {parsedPreview && importStatus === 'idle' && (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex items-center gap-1.5 mb-2">
                <FileJson className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">Aperçu des champs</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(parsedPreview).map(([field, value]) => {
                  const label = fieldLabels[field] || field;
                  const count = Array.isArray(value) ? value.length : null;
                  return (
                    <span
                      key={field}
                      className="text-xs bg-white border rounded px-2 py-0.5 text-muted-foreground"
                    >
                      {label}
                      {count !== null && ` (${count})`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error message */}
          {importStatus === 'error' && importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono flex-1">
                  {importError}
                </pre>
              </div>
            </div>
          )}

          {/* Success message */}
          {importStatus === 'success' && importedFields.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700">
                    {importedFields.length} champ(s) importé(s) !
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {importedFields.map((field) => (
                      <span
                        key={field}
                        className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5"
                      >
                        {fieldLabels[field] || field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import button */}
          <Button
            onClick={handleImport}
            disabled={!jsonInput.trim() || importStatus === 'success'}
            className="w-full"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer dans le formulaire
          </Button>

          {/* Help text */}
          <p className="text-xs text-muted-foreground text-center">
            Accepte le JSON brut ou encapsulé dans un bloc{' '}
            <code className="bg-muted px-1 rounded">```json</code>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
