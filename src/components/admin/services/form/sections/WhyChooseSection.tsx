'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ThumbsUp } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import ImageUploader from '@/components/admin/upload/ImageUploader';

interface WhyChooseSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function WhyChooseSection({ form }: WhyChooseSectionProps) {
  const { watch, setValue } = form;

  const slug = watch('slug') || 'nouveau-service';
  const content = watch('content');
  const whyChoose = content?.whyChoose || [];
  const images = content?.images || [];

  const progress = whyChoose.length > 0 ? 100 : 0;

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    // Keep array structure up to the highest non-empty index
    const lastNonEmpty = newImages.reduce((acc, img, i) => (img ? i : acc), -1);
    setValue('content.images', newImages.slice(0, lastNonEmpty + 1));
  };

  return (
    <CollapsibleSection
      title="Pourquoi Nous Choisir"
      icon={ThumbsUp}
      progress={progress}
      defaultOpen={false}
      description="Arguments différenciateurs pour convaincre vos clients"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="whyChoose">Pourquoi nous choisir (un argument par ligne)</Label>
          <Textarea
            id="whyChoose"
            rows={6}
            defaultValue={whyChoose.join('\n')}
            onChange={(e) => {
              const items = e.target.value
                .split('\n')
                .filter((r) => r.trim());
              setValue('content.whyChoose', items);
            }}
            placeholder="De bénéficier d'une expertise reconnue&#10;D'avoir un interlocuteur unique&#10;De profiter de tarifs compétitifs&#10;D'obtenir des résultats garantis&#10;De travailler avec des équipes formées&#10;D'utiliser des produits éco-responsables"
          />
          <p className="text-xs text-muted-foreground">
            Arguments commerciaux affichés dans la section &quot;Pourquoi nous choisir&quot;.
          </p>
        </div>

        <ImageUploader
          value={images[2] || ''}
          onChange={(url) => updateImage(2, url)}
          serviceSlug={slug}
          label="Image d'illustration"
          description="Image affichée à côté de la section &quot;Pourquoi nous choisir&quot;."
        />
      </div>
    </CollapsibleSection>
  );
}
