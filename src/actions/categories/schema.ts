import { z } from 'zod';

// ============================================
// Category Validation Schemas
// ============================================

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  slug: z
    .string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .max(50, 'Le slug ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    ),
  description: z.string().max(200, 'La description ne peut pas dépasser 200 caractères').optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().uuid(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
