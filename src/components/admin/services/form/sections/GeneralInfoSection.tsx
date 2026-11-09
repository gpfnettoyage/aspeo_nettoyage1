'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { CategoryOption } from '@/types/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { slugify } from '@/utils/slugify';
import { AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import { calculateSectionProgress } from '../SectionProgress';

interface GeneralInfoSectionProps {
  form: UseFormReturn<CreateServiceInput>;
  categories: CategoryOption[];
  mode: 'create' | 'edit';
}

export default function GeneralInfoSection({
  form,
  categories,
  mode,
}: GeneralInfoSectionProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchedValues = watch(['title', 'slug', 'categoryId']);
  const currentTitle = watchedValues[0] || '';
  const currentSlug = watchedValues[1] || '';
  const suggestedSlug = slugify(currentTitle);
  const hasSlugMismatch =
    currentTitle.length > 0 &&
    currentSlug.length > 0 &&
    suggestedSlug.length > 0 &&
    currentSlug !== suggestedSlug;
  const progress = calculateSectionProgress(
    {
      title: currentTitle,
      slug: currentSlug,
    },
    ['title', 'slug'],
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue('title', newTitle, { shouldDirty: true, shouldTouch: true });
    if (mode === 'create') {
      setValue('slug', slugify(newTitle), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('slug', slugify(e.target.value), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleRegenerateSlug = () => {
    setValue('slug', suggestedSlug, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <CollapsibleSection
      title="Informations générales"
      icon={FileText}
      progress={progress}
      defaultOpen={true}
      description="Titre, slug et catégorie du service"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            {...register('title')}
            onChange={handleTitleChange}
            placeholder="Ex: Nettoyage bureaux"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="slug">Slug (URL) *</Label>
            {hasSlugMismatch && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleRegenerateSlug}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Régénérer
              </Button>
            )}
          </div>
          <Input
            id="slug"
            {...register('slug')}
            onChange={handleSlugChange}
            placeholder="nettoyage-bureaux"
          />
          {errors.slug && (
            <p className="text-sm text-red-500">{errors.slug.message}</p>
          )}
          {hasSlugMismatch && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertTriangle className="size-3.5 shrink-0" />
              Slug différent du titre suggéré : {suggestedSlug}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            URL: /proprete-services/{watch('slug') || 'slug'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Sous-titre</Label>
          <Input
            id="subtitle"
            {...register('subtitle')}
            placeholder="Ex: Entreprises et professionnels"
          />
          <p className="text-xs text-muted-foreground">
            Affiché sur les cartes de services dans la liste
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Catégorie</Label>
            <Select
              value={watch('categoryId') || ''}
              onValueChange={(value) => setValue('categoryId', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-background">
              <Checkbox
                id="published"
                checked={watch('published')}
                onCheckedChange={(checked) =>
                  setValue('published', checked as boolean)
                }
              />
              <Label
                htmlFor="published"
                className="font-normal text-sm cursor-pointer"
              >
                {watch('published') ? 'Publié' : 'Brouillon'}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
