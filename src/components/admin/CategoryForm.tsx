'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '@/types/categories';
import { createCategorySchema, CreateCategoryInput } from '@/actions/categories/schema';
import { createCategoryAction, updateCategoryAction } from '@/actions/categories/categories.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/utils/slugify';

interface CategoryFormProps {
  category?: Category;
  mode: 'create' | 'edit';
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      displayOrder: category?.displayOrder ?? 0,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue('name', newName);
    if (mode === 'create') {
      setValue('slug', slugify(newName));
    }
  };

  const onSubmit = async (data: CreateCategoryInput) => {
    setIsSubmitting(true);

    try {
      let result;

      if (mode === 'create') {
        result = await createCategoryAction(data);
      } else {
        result = await updateCategoryAction({ id: category!.id, ...data });
      }

      if (result.success) {
        toast.success(mode === 'create' ? 'Catégorie créée' : 'Catégorie mise à jour', {
          description: mode === 'create'
            ? 'La catégorie a été créée avec succès.'
            : 'Les modifications ont été enregistrées.',
        });
        router.push('/gp8x2k4m/categories');
        router.refresh();
      } else {
        toast.error('Erreur', {
          description: result.error,
        });
      }
    } catch {
      toast.error('Erreur', {
        description: 'Une erreur inattendue est survenue.',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/gp8x2k4m/categories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Créer la catégorie' : 'Enregistrer'}
            </>
          )}
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                {...register('name')}
                onChange={handleNameChange}
                placeholder="Ex: Nettoyage Intérieur"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="nettoyage-interieur"
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Description de la catégorie..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordre d&apos;affichage</Label>
              <Input
                id="displayOrder"
                type="number"
                {...register('displayOrder', { valueAsNumber: true })}
                placeholder="0"
                min={0}
              />
              {errors.displayOrder && (
                <p className="text-sm text-red-500">{errors.displayOrder.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Les catégories sont triées par ordre croissant (0 = premier)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
