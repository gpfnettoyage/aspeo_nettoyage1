'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import { calculateSectionProgress } from '../SectionProgress';

interface ContentSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function ContentSection({ form }: ContentSectionProps) {
  const { watch, setValue } = form;

  const content = watch('content');
  const progress = calculateSectionProgress(
    {
      descriptions: content?.descriptions,
      contextText: content?.contextText,
    },
    ['descriptions']
  );

  return (
    <CollapsibleSection
      title="Contenu & Contexte"
      icon={FileText}
      progress={progress}
      defaultOpen={false}
      description="Description principale et contexte du service"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="descriptions">Description du service (un paragraphe par ligne)</Label>
          <Textarea
            id="descriptions"
            rows={6}
            defaultValue={content?.descriptions?.join('\n\n') || ''}
            onChange={(e) => {
              const descriptions = e.target.value
                .split('\n')
                .filter((d) => d.trim());
              setValue('content.descriptions', descriptions);
            }}
            placeholder="Premier paragraphe de description...&#10;&#10;Deuxième paragraphe avec plus de détails...&#10;&#10;Troisième paragraphe si nécessaire..."
          />
          <p className="text-xs text-muted-foreground">
            Utilisées pour le SEO, les cartes de service et comme fallback si le texte d&apos;intro (Hero) est vide.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contextText">Texte de contexte</Label>
          <Textarea
            id="contextText"
            rows={4}
            defaultValue={content?.contextText || ''}
            onChange={(e) => setValue('content.contextText', e.target.value)}
            placeholder="Contexte et importance de ce service pour vos clients...&#10;&#10;Ce texte apparaît après le hero et avant la section expertise."
          />
          <p className="text-xs text-muted-foreground">
            Explique le contexte et l&apos;importance du service. Affiché après le hero.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
