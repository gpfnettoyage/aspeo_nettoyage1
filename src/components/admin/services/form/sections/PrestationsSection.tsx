'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ListChecks, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface PrestationsSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function PrestationsSection({ form }: PrestationsSectionProps) {
  const { control, register, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'content.prestationsCategories',
  });

  const progress = fields.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Catégories de Prestations"
      icon={ListChecks}
      progress={progress}
      defaultOpen={false}
      description="Regroupez vos prestations par catégorie"
    >
      <div className="space-y-4 pt-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ title: '', items: [] })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une catégorie
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
                <Label htmlFor={`prestations.${index}.title`}>
                  Titre de la catégorie
                </Label>
                <Input
                  id={`prestations.${index}.title`}
                  {...register(
                    `content.prestationsCategories.${index}.title` as const
                  )}
                  placeholder="Ex: Nettoyage des sols"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`prestations.${index}.items`}>
                  Prestations détaillées (une par ligne)
                </Label>
                <Textarea
                  id={`prestations.${index}.items`}
                  rows={4}
                  defaultValue={
                    (field as { items?: string[] }).items?.join('\n') || ''
                  }
                  onChange={(e) => {
                    const items = e.target.value
                      .split('\n')
                      .filter((i) => i.trim());
                    setValue(
                      `content.prestationsCategories.${index}.items` as const,
                      items
                    );
                  }}
                  placeholder="Aspiration détaillée&#10;Lavage mécanique&#10;Traitement spécifique..."
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              Aucune catégorie de prestation ajoutée.
              <br />
              <span className="text-xs">
                Cliquez sur &quot;Ajouter une catégorie&quot; pour commencer.
              </span>
            </p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
