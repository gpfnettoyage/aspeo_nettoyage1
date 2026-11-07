'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface GuaranteesSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function GuaranteesSection({ form }: GuaranteesSectionProps) {
  const { watch, setValue } = form;

  const content = watch('content');
  const guarantees = content?.guarantees || [];

  const progress = guarantees.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Garanties"
      icon={ShieldCheck}
      progress={progress}
      defaultOpen={false}
      description="Vos engagements et garanties pour ce service"
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="guarantees">Vos Garanties (une par ligne)</Label>
          <Textarea
            id="guarantees"
            rows={6}
            defaultValue={guarantees.join('\n')}
            onChange={(e) => {
              const items = e.target.value
                .split('\n')
                .filter((g) => g.trim());
              setValue('content.guarantees', items);
            }}
            placeholder="100% satisfaction garantie&#10;Intervention sous 24h&#10;Devis gratuit et sans engagement&#10;Personnel formé et assuré&#10;Produits éco-responsables&#10;Suivi qualité régulier"
          />
          <p className="text-xs text-muted-foreground">
            Affichées sous forme de cartes avec icônes dans la section &quot;Vos Garanties&quot;.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
