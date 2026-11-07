'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface SubServicesSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function SubServicesSection({ form }: SubServicesSectionProps) {
  const { control, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'content.subServices',
  });

  const progress = fields.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Sous-Services Inclus"
      icon={Layers}
      progress={progress}
      defaultOpen={false}
      description="Services détaillés inclus dans cette offre"
    >
      <div className="space-y-4 pt-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', description: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un sous-service
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg space-y-4 relative bg-muted/30"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="space-y-2 pr-10">
                <Label htmlFor={`subservices.${index}.name`}>
                  Nom du sous-service
                </Label>
                <Input
                  id={`subservices.${index}.name`}
                  {...register(`content.subServices.${index}.name` as const)}
                  placeholder="Ex: Nettoyage des vitres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`subservices.${index}.description`}>
                  Description
                </Label>
                <Textarea
                  id={`subservices.${index}.description`}
                  {...register(
                    `content.subServices.${index}.description` as const
                  )}
                  rows={3}
                  placeholder="Description détaillée de ce sous-service..."
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              Aucun sous-service ajouté.
              <br />
              <span className="text-xs">
                Cliquez sur &quot;Ajouter un sous-service&quot; pour commencer.
              </span>
            </p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
