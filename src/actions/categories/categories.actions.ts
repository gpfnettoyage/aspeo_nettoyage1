'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { adminActionRateLimit, safeRateLimit } from '@/lib/redis';
import { Prisma } from '@prisma/client';
import { logAdminAction } from '@/lib/audit';
import { createCategorySchema, updateCategorySchema, CreateCategoryInput, UpdateCategoryInput } from './schema';

// ============================================
// Types
// ============================================
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// ============================================
// Create Category
// ============================================
export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // Require categories:create permission (EDITOR, ADMIN, SUPER_ADMIN)
    const session = await requirePermission('categories:create');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate input
    const validatedData = createCategorySchema.parse(input);

    // Create category (handles race condition via unique constraint)
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        displayOrder: validatedData.displayOrder,
      },
    });

    // Revalidate paths
    revalidatePath('/gp8x2k4m/categories');
    revalidatePath('/gp8x2k4m/services');

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      resource: 'Category',
      resourceId: category.id,
      resourceName: validatedData.name,
    });

    return { success: true, data: { id: category.id } };
  } catch (error) {
    // Handle unique constraint violation (race condition)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Ce slug ou nom existe déjà' };
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Create category error:', error);
    }
    return { success: false, error: 'Erreur lors de la création de la catégorie' };
  }
}

// ============================================
// Update Category
// ============================================
export async function updateCategoryAction(
  input: UpdateCategoryInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // Require categories:update permission (EDITOR, ADMIN, SUPER_ADMIN)
    const session = await requirePermission('categories:update');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate input
    const validatedData = updateCategorySchema.parse(input);

    // Check category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingCategory) {
      return { success: false, error: 'Catégorie non trouvée' };
    }

    // Update category (handles race condition via unique constraint)
    const category = await prisma.category.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        displayOrder: validatedData.displayOrder,
      },
    });

    // Revalidate paths
    revalidatePath('/gp8x2k4m/categories');
    revalidatePath('/gp8x2k4m/services');

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'UPDATE',
      resource: 'Category',
      resourceId: category.id,
      resourceName: validatedData.name,
    });

    return { success: true, data: { id: category.id } };
  } catch (error) {
    // Handle unique constraint violation (race condition)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Ce slug ou nom existe déjà' };
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Update category error:', error);
    }
    return { success: false, error: 'Erreur lors de la mise à jour de la catégorie' };
  }
}

// ============================================
// Delete Category Schema
// ============================================
const deleteCategorySchema = z.object({
  id: z.string().uuid('ID de catégorie invalide'),
});

// ============================================
// Delete Category
// ============================================
export async function deleteCategoryAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    // Require categories:delete permission (ADMIN, SUPER_ADMIN only)
    const session = await requirePermission('categories:delete');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate UUID format
    const validated = deleteCategorySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const { id } = validated.data;

    // Check category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { services: true } } },
    });

    if (!existingCategory) {
      return { success: false, error: 'Catégorie non trouvée' };
    }

    // Delete category (services will be unlinked via onDelete: SetNull)
    await prisma.category.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath('/gp8x2k4m/categories');
    revalidatePath('/gp8x2k4m/services');

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Category',
      resourceId: id,
      resourceName: existingCategory.name,
    });

    return { success: true, data: { id } };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete category error:', error);
    }
    return { success: false, error: 'Erreur lors de la suppression de la catégorie' };
  }
}
