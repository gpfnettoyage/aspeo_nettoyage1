'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface ApplicationSectorsSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function ApplicationSectorsSection({ form }: ApplicationSectorsSectionProps) {
  const { watch, setValue } = form;

  const content = watch('content');
  const applicationSectors = content?.applicationSectors || [];

  const progress = applicationSectors.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Secteurs d'Application"
      icon={FileText}
      progress={progress}
      defaultOpen={false}
      description="Secteurs d'activité où ce service est particulièrement adapté"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="applicationSectors">Secteurs d&apos;application (un par ligne)</Label>
          <Textarea
            id="applicationSectors"
            rows={6}
            defaultValue={applicationSectors.join('\n')}
            onChange={(e) => {
              const sectors = e.target.value
                .split('\n')
                .filter((s) => s.trim());
              setValue('content.applicationSectors', sectors);
            }}
            placeholder="Tertiaire&#10;Industrie&#10;Santé&#10;Commerce&#10;Hôtellerie&#10;Restauration"
          />
          <p className="text-xs text-muted-foreground">
            Affichés sous forme de badges dans la section &quot;Secteurs d&apos;Application&quot;.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
