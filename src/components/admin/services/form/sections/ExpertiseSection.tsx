'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import { calculateSectionProgress } from '../SectionProgress';
import ImageUploader from '@/components/admin/upload/ImageUploader';

interface ExpertiseSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function ExpertiseSection({ form }: ExpertiseSectionProps) {
  const { register, watch, setValue } = form;

  const slug = watch('slug') || 'nouveau-service';
  const content = watch('content');
  const expertise = content?.expertise;
  const images = content?.images || [];

  const progress = calculateSectionProgress(
    {
      title: expertise?.title,
      description: expertise?.description,
    },
    ['title', 'description']
  );

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    // Keep array structure up to the highest non-empty index
    const lastNonEmpty = newImages.reduce((acc, img, i) => (img ? i : acc), -1);
    setValue('content.images', newImages.slice(0, lastNonEmpty + 1));
  };

  return (
    <CollapsibleSection
      title="Notre Expertise"
      icon={Award}
      progress={progress}
      defaultOpen={false}
      description="Mettez en avant votre expertise sur ce service"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="expertise.title">Titre de l&apos;expertise</Label>
          <Input
            id="expertise.title"
            {...register('content.expertise.title')}
            placeholder="Ex: Notre Expertise en Nettoyage Industriel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expertise.description">Description de l&apos;expertise</Label>
          <Textarea
            id="expertise.description"
            {...register('content.expertise.description')}
            rows={5}
            placeholder="Description détaillée de votre expertise sur ce type de service...&#10;&#10;Vous pouvez utiliser plusieurs paragraphes séparés par des lignes vides."
          />
          <p className="text-xs text-muted-foreground">
            Séparez les paragraphes par des lignes vides pour un meilleur affichage.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expertise.highlights">Points forts (un par ligne)</Label>
          <Textarea
            id="expertise.highlights"
            rows={5}
            defaultValue={expertise?.highlights?.join('\n') || ''}
            onChange={(e) => {
              const highlights = e.target.value
                .split('\n')
                .filter((h) => h.trim());
              setValue('content.expertise.highlights', highlights);
            }}
            placeholder="Expertise reconnue depuis 10 ans&#10;Équipes formées et certifiées&#10;Intervention rapide 24/7&#10;Matériel professionnel de pointe"
          />
          <p className="text-xs text-muted-foreground">
            Ces points seront affichés sous forme de badges dans la section expertise.
          </p>
        </div>

        <ImageUploader
          value={images[1] || ''}
          onChange={(url) => updateImage(1, url)}
          serviceSlug={slug}
          label="Image d'illustration"
          description="Image affichée à côté de la section expertise."
        />
      </div>
    </CollapsibleSection>
  );
}
