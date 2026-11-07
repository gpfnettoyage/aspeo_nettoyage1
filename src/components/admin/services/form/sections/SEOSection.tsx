'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import { calculateSectionProgress } from '../SectionProgress';
import { cn } from '@/lib/utils';
import { COMPANY } from '@/constants/company';

interface SEOSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

type CharacterStatus = 'empty' | 'too-short' | 'optimal' | 'too-long';

const getTitleStatus = (length: number): CharacterStatus => {
  if (length === 0) return 'empty';
  if (length < 30) return 'too-short';
  if (length <= 60) return 'optimal';
  return 'too-long';
};

const getDescStatus = (length: number): CharacterStatus => {
  if (length === 0) return 'empty';
  if (length < 70) return 'too-short';
  if (length <= 160) return 'optimal';
  return 'too-long';
};

const statusColors: Record<CharacterStatus, string> = {
  empty: 'text-muted-foreground',
  'too-short': 'text-yellow-600',
  optimal: 'text-green-600',
  'too-long': 'text-red-600',
};

const statusBgColors: Record<CharacterStatus, string> = {
  empty: 'bg-muted',
  'too-short': 'bg-yellow-100',
  optimal: 'bg-green-100',
  'too-long': 'bg-red-100',
};


export default function SEOSection({ form }: SEOSectionProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const seoTitle = watch('seoTitle') || '';
  const seoDesc = watch('seoDesc') || '';

  const titleLength = seoTitle.length;
  const descLength = seoDesc.length;

  const titleStatus = getTitleStatus(titleLength);
  const descStatus = getDescStatus(descLength);

  const progress = calculateSectionProgress(
    { seoTitle, seoDesc },
    ['seoTitle', 'seoDesc']
  );

  return (
    <CollapsibleSection
      title="SEO"
      icon={Search}
      progress={progress}
      defaultOpen={false}
      description="Optimisation pour les moteurs de recherche"
    >
      <div className="space-y-4 pt-4">
        {/* SEO Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seoTitle">Titre SEO</Label>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded',
                statusColors[titleStatus],
                statusBgColors[titleStatus]
              )}
            >
              {titleLength}/60
              {titleStatus === 'optimal' && ' ✓'}
            </span>
          </div>
          <Input
            id="seoTitle"
            {...register('seoTitle')}
            placeholder="Ex: Nettoyage de Bureaux | Aspeo Nettoyage Loire & Rhône"
            maxLength={70}
            className={cn(
              titleStatus === 'too-long' && 'border-red-300 focus-visible:ring-red-500'
            )}
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Format recommandé :</strong> [Titre du service] | {COMPANY.name} Nettoyage Loire & Rhône
            <br />
            Si trop long (&gt;60 car.) → utiliser &quot;42 & 69&quot; au lieu de &quot;Loire & Rhône&quot;
            <br />
            Si toujours trop long → utiliser uniquement &quot;| {COMPANY.name}&quot;
          </p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className={cn('px-1.5 py-0.5 rounded', statusBgColors['too-short'], statusColors['too-short'])}>
              &lt;30: court
            </span>
            <span className={cn('px-1.5 py-0.5 rounded', statusBgColors['optimal'], statusColors['optimal'])}>
              30-60: optimal
            </span>
            <span className={cn('px-1.5 py-0.5 rounded', statusBgColors['too-long'], statusColors['too-long'])}>
              &gt;60: long
            </span>
          </div>
          {errors.seoTitle && (
            <p className="text-sm text-red-500">{errors.seoTitle.message}</p>
          )}
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seoDesc">Description SEO</Label>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded',
                statusColors[descStatus],
                statusBgColors[descStatus]
              )}
            >
              {descLength}/160
              {descStatus === 'optimal' && ' ✓'}
            </span>
          </div>
          <Textarea
            id="seoDesc"
            {...register('seoDesc')}
            placeholder="Description pour Google (70-160 caractères recommandés)"
            maxLength={160}
            rows={3}
            className={cn(
              descStatus === 'too-long' && 'border-red-300 focus-visible:ring-red-500'
            )}
          />
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className={cn('px-1.5 py-0.5 rounded', statusBgColors['too-short'], statusColors['too-short'])}>
              &lt;70: court
            </span>
            <span className={cn('px-1.5 py-0.5 rounded', statusBgColors['optimal'], statusColors['optimal'])}>
              70-160: optimal
            </span>
            <span className={cn('px-1.5 py-0.5 rounded', statusBgColors['too-long'], statusColors['too-long'])}>
              &gt;160: long
            </span>
          </div>
          {errors.seoDesc && (
            <p className="text-sm text-red-500">{errors.seoDesc.message}</p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
