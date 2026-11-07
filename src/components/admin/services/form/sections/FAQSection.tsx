'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface FAQSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

export default function FAQSection({ form }: FAQSectionProps) {
  const { control, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'content.faq',
  });

  const progress = fields.length > 0 ? 100 : 0;

  return (
    <CollapsibleSection
      title="Foire Aux Questions (FAQ)"
      icon={HelpCircle}
      progress={progress}
      defaultOpen={false}
      description="Questions fréquentes et leurs réponses"
    >
      <div className="space-y-4 pt-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ question: '', answer: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une question
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
                <Label htmlFor={`faq.${index}.question`}>Question</Label>
                <Input
                  id={`faq.${index}.question`}
                  {...register(`content.faq.${index}.question` as const)}
                  placeholder="Ex: À quelle fréquence intervenez-vous ?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`faq.${index}.answer`}>Réponse</Label>
                <Textarea
                  id={`faq.${index}.answer`}
                  {...register(`content.faq.${index}.answer` as const)}
                  rows={3}
                  placeholder="Ex: Nous adaptons nos interventions..."
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              Aucune question ajoutée à la FAQ.
              <br />
              <span className="text-xs">
                Cliquez sur &quot;Ajouter une question&quot; pour commencer.
              </span>
            </p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
