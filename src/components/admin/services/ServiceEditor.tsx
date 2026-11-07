'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service } from '@/types/services';
import { CategoryOption } from '@/types/categories';
import {
  createServiceSchema,
  CreateServiceInput,
} from '@/actions/services/schema';
import {
  createServiceAction,
  updateServiceAction,
} from '@/actions/services/services.actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, Save, ArrowLeft, RotateCcw, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

import ServiceEditorLayout from './ServiceEditorLayout';
import PreviewTabs from './preview/PreviewTabs';
import AIImportModal from './AIImportModal';
import { useAutoSave, formatAutoSaveStatus, getAutoSaveBadgeVariant } from './hooks/useAutoSave';

// Form sections - ordered to EXACTLY match the public page layout (Service.tsx)
import GeneralInfoSection from './form/sections/GeneralInfoSection';
import SEOSection from './form/sections/SEOSection';
import HeroSection from './form/sections/HeroSection';
import ContentSection from './form/sections/ContentSection';
import ExpertiseSection from './form/sections/ExpertiseSection';
import TargetSpacesSection from './form/sections/TargetSpacesSection';
import PrestationsSection from './form/sections/PrestationsSection';
import SubServicesSection from './form/sections/SubServicesSection';
import ProcessSection from './form/sections/ProcessSection';
import GuaranteesSection from './form/sections/GuaranteesSection';
import ApplicationSectorsSection from './form/sections/ApplicationSectorsSection';
import WhyChooseSection from './form/sections/WhyChooseSection';
import FAQSection from './form/sections/FAQSection';
import CTASection from './form/sections/CTASection';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ServiceEditorProps {
  service?: Service;
  mode: 'create' | 'edit';
  categories: CategoryOption[];
}

export default function ServiceEditor({
  service,
  mode,
  categories,
}: ServiceEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Memoize default values to avoid recalculating on every render
  const defaultValues = useMemo(() => {
    const defaultContent = service?.content || {
      images: [],
      descriptions: [],
      subServices: [],
    };

    return {
      slug: service?.slug || '',
      title: service?.title || '',
      subtitle: service?.subtitle || '',
      categoryId: service?.categoryId || null,
      seoTitle: service?.seoTitle || '',
      seoDesc: service?.seoDesc || '',
      published: service?.published ?? true,
      content: defaultContent,
    } as CreateServiceInput;
  }, [service]);

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues,
  });

  const watchedData = form.watch();
  const debouncedData = useDebounce(watchedData, 300);

  // Auto-save with validation and initial data comparison
  const formId = mode === 'edit' && service ? service.id : 'new';
  const autoSave = useAutoSave(formId, watchedData, {
    interval: 30000, // 30 seconds
    enabled: true,
    schema: createServiceSchema,
    initialData: defaultValues, // Compare against initial values
  });

  // Check for meaningful draft on mount (only once)
  useEffect(() => {
    if (draftChecked) return;
    setDraftChecked(true);

    // In edit mode, only show if draft is newer than service.updatedAt AND different
    // In create mode, only show if draft is different from empty defaults
    const serviceUpdatedAt = mode === 'edit' && service?.updatedAt
      ? service.updatedAt
      : undefined;

    const hasMeaningful = autoSave.hasMeaningfulDraft(defaultValues, serviceUpdatedAt);

    if (hasMeaningful) {
      setShowRestoreDialog(true);
    } else {
      // Clean up obsolete draft silently
      autoSave.clear();
    }
  }, [draftChecked, autoSave, defaultValues, mode, service?.updatedAt]);

  const handleRestoreDraft = () => {
    const draft = autoSave.restore();
    if (draft) {
      form.reset(draft);
      toast.success('Brouillon restauré', {
        description: 'Votre travail précédent a été restauré.',
      });
    }
    setShowRestoreDialog(false);
  };

  const handleDiscardDraft = () => {
    autoSave.clear();
    setShowRestoreDialog(false);
  };

  const onSubmit = async (data: CreateServiceInput) => {
    setIsSubmitting(true);

    try {
      let result;

      if (mode === 'create') {
        result = await createServiceAction(data);
      } else {
        // Include expectedUpdatedAt for conflict detection
        // Handle both Date object and ISO string (dates are serialized when passing from Server to Client Component)
        const updatedAt = service!.updatedAt;
        const expectedUpdatedAt = updatedAt instanceof Date
          ? updatedAt.toISOString()
          : String(updatedAt);

        result = await updateServiceAction({
          id: service!.id,
          expectedUpdatedAt,
          ...data,
        });
      }

      if (result.success) {
        // Clear draft on successful save
        autoSave.clear();

        toast.success(mode === 'create' ? 'Service créé' : 'Service mis à jour', {
          description:
            mode === 'create'
              ? 'Le service a été créé avec succès.'
              : 'Les modifications ont été enregistrées.',
        });
        router.push('/gp8x2k4m/services');
        router.refresh();
      } else {
        // Extract error info for type safety
        const errorResult = result as { success: false; error: string; errors?: string[]; conflict?: boolean };

        // Handle conflict error
        if (errorResult.conflict) {
          toast.error('Conflit détecté', {
            description: errorResult.error,
            duration: 10000, // Show longer for important message
          });
          return;
        }

        // Handle multiple validation errors
        if (errorResult.errors && errorResult.errors.length > 1) {
          toast.error('Erreurs de validation', {
            description: errorResult.errors.join(' • '),
            duration: 10000,
          });
        } else {
          toast.error('Erreur', {
            description: errorResult.error,
          });
        }
      }
    } catch {
      toast.error('Erreur', {
        description: 'Une erreur inattendue est survenue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form content - sections ordered to EXACTLY match the public page layout
  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Informations de base */}
      <GeneralInfoSection form={form} categories={categories} mode={mode} />

      {/* 2. SEO */}
      <SEOSection form={form} />

      {/* 3. Hero & Images */}
      <HeroSection form={form} />

      {/* 4. Descriptions & Contexte */}
      <ContentSection form={form} />

      {/* 5. Expertise */}
      <ExpertiseSection form={form} />

      {/* 6. Espaces Cibles */}
      <TargetSpacesSection form={form} />

      {/* 7. Prestations */}
      <PrestationsSection form={form} />

      {/* 8. Sous-services */}
      <SubServicesSection form={form} />

      {/* 9. Processus/Méthodologie */}
      <ProcessSection form={form} />

      {/* 10. Garanties */}
      <GuaranteesSection form={form} />

      {/* 11. Secteurs d'Application */}
      <ApplicationSectorsSection form={form} />

      {/* 12. Pourquoi Nous Choisir */}
      <WhyChooseSection form={form} />

      {/* 13. FAQ */}
      <FAQSection form={form} />

      {/* 14. CTA & Conversion */}
      <CTASection form={form} />
    </form>
  );

  // Preview content (import handled via modal now)
  const previewContent = <PreviewTabs data={debouncedData} />;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/gp8x2k4m/services">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {mode === 'create' ? 'Nouveau service' : 'Modifier le service'}
            </h1>
            {mode === 'edit' && service && (
              <p className="text-sm text-muted-foreground">{service.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Auto-save status */}
          {autoSave.state.status !== 'idle' && (
            <Badge
              variant={getAutoSaveBadgeVariant(autoSave.state.status)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Clock className="w-3 h-3" />
              {formatAutoSaveStatus(autoSave.state, autoSave.timeSinceLastSave)}
            </Badge>
          )}

          {/* Import IA button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="hidden sm:flex"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Importer IA
          </Button>

          {/* Save button */}
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Créer' : 'Enregistrer'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Layout (Split View) */}
      <div className="flex-1 min-h-0 pt-4">
        <ServiceEditorLayout
          formContent={formContent}
          previewContent={previewContent}
        />
      </div>

      {/* Restore Draft Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Brouillon trouvé
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mode === 'create'
                ? 'Un brouillon de votre travail précédent a été trouvé. Voulez-vous le restaurer ou commencer un nouveau service ?'
                : 'Des modifications non sauvegardées ont été trouvées pour ce service. Voulez-vous les restaurer ou reprendre depuis la version actuelle ?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              {mode === 'create' ? 'Nouveau service' : 'Version actuelle'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>
              Restaurer le brouillon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import IA Modal */}
      <AIImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        form={form}
      />
    </div>
  );
}
