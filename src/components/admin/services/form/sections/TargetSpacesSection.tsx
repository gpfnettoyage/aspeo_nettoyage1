'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface TargetSpacesSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function TargetSpacesSection({ form }: TargetSpacesSectionProps) {
  const { watch, setValue } = form;

  const content = watch('content');
  const targetSpaces = content?.targetSpaces || [];

  const progress = targetSpaces.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Espaces Cibles"
      icon={Building2}
      progress={progress}
      defaultOpen={false}
      description="Types d'espaces où ce service peut être appliqué"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="targetSpaces">Espaces cibles (un par ligne)</Label>
          <Textarea
            id="targetSpaces"
            rows={6}
            defaultValue={targetSpaces.join('\n')}
            onChange={(e) => {
              const spaces = e.target.value
                .split('\n')
                .filter((s) => s.trim());
              setValue('content.targetSpaces', spaces);
            }}
            placeholder="Bureaux&#10;Open spaces&#10;Salles de réunion&#10;Espaces de coworking&#10;Halls d'accueil&#10;Sanitaires"
          />
          <p className="text-xs text-muted-foreground">
            Affichés sous forme de badges dans la section &quot;Espaces concernés&quot;.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
