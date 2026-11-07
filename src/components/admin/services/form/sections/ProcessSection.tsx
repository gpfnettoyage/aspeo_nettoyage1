'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface ProcessSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function ProcessSection({ form }: ProcessSectionProps) {
  const { control, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'content.process',
  });

  const progress = fields.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Méthodologie (Processus)"
      icon={Clock}
      progress={progress}
      defaultOpen={false}
      description="Étapes de votre intervention"
    >
      <div className="space-y-4 pt-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                step: fields.length + 1,
                title: '',
                description: '',
                duration: '',
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une étape
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

              <div className="grid grid-cols-2 gap-4 pr-10">
                <div className="space-y-2">
                  <Label htmlFor={`process.${index}.step`}>
                    Numéro d&apos;étape
                  </Label>
                  <Input
                    id={`process.${index}.step`}
                    type="number"
                    {...register(`content.process.${index}.step` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`process.${index}.duration`}>
                    Durée estimée
                  </Label>
                  <Input
                    id={`process.${index}.duration`}
                    {...register(`content.process.${index}.duration` as const)}
                    placeholder="Ex: 30 min, 2h..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`process.${index}.title`}>
                  Titre de l&apos;étape
                </Label>
                <Input
                  id={`process.${index}.title`}
                  {...register(`content.process.${index}.title` as const)}
                  placeholder="Ex: Préparation des locaux"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`process.${index}.description`}>
                  Description de l&apos;étape
                </Label>
                <Textarea
                  id={`process.${index}.description`}
                  {...register(`content.process.${index}.description` as const)}
                  rows={2}
                  placeholder="Explication détaillée de cette étape..."
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              Aucune étape de processus ajoutée.
              <br />
              <span className="text-xs">
                Cliquez sur &quot;Ajouter une étape&quot; pour commencer.
              </span>
            </p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
