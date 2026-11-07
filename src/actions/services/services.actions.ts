'use server';

import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { adminActionRateLimit, safeRateLimit } from '@/lib/redis';
import { Prisma } from '@prisma/client';
import { logAdminAction } from '@/lib/audit';
import {
  createServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from './schema';

// ============================================
// Action Response Type
// ============================================
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: string[] }
  | { success: false; error: string; conflict: true; currentUpdatedAt: string };

// ============================================
// Create Service Action
// ============================================
export async function createServiceAction(
  input: CreateServiceInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Require services:create permission (EDITOR, ADMIN, SUPER_ADMIN)
    const session = await requirePermission('services:create');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate input
    const result = createServiceSchema.safeParse(input);
    if (!result.success) {
      const errors = result.error.errors.map(e => e.message);
      return {
        success: false,
        error: errors.length > 1
          ? `${errors.length} erreurs de validation`
          : errors[0],
        errors,
      };
    }

    const { slug, title, subtitle, categoryId, seoTitle, seoDesc, published, content } = result.data;

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return { success: false, error: 'Catégorie non trouvée' };
      }
    }

    // SEO fields: store null if not provided (page will use generateSEOTitle() dynamically)
    // This is more flexible and allows changing SEO format without DB migration

    // Create service (handles race condition via unique constraint)
    const service = await prisma.service.create({
      data: {
        slug,
        title,
        subtitle,
        categoryId,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
        published,
        content,
      },
    });

    // Revalidate affected paths (layout revalidates nav/footer across all pages)
    revalidatePath('/', 'layout');
    revalidatePath('/proprete-services');
    revalidatePath(`/proprete-services/${slug}`);
    revalidatePath('/gp8x2k4m/services');

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      resource: 'Service',
      resourceId: service.id,
      resourceName: title,
    });

    return { success: true, data: { id: service.id, slug: service.slug } };
  } catch (error) {
    // Handle unique constraint violation (race condition on slug)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Un service avec ce slug existe déjà' };
    }
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Create service error:', error);
    }
    return { success: false, error: 'Une erreur est survenue lors de la création du service' };
  }
}

// ============================================
// Update Service Action
// ============================================
export async function updateServiceAction(
  input: UpdateServiceInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Require services:update permission (EDITOR, ADMIN, SUPER_ADMIN)
    const session = await requirePermission('services:update');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate input
    const result = updateServiceSchema.safeParse(input);
    if (!result.success) {
      const errors = result.error.errors.map(e => e.message);
      return {
        success: false,
        error: errors.length > 1
          ? `${errors.length} erreurs de validation`
          : errors[0],
        errors,
      };
    }

    const { id, slug, categoryId, expectedUpdatedAt, ...updateData } = result.data;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return { success: false, error: 'Service non trouvé' };
    }

    // Conflict detection: check if service was modified by someone else
    if (expectedUpdatedAt) {
      const expectedDate = new Date(expectedUpdatedAt);
      const actualDate = existingService.updatedAt;

      // Compare timestamps (allow 1 second tolerance for rounding)
      if (Math.abs(actualDate.getTime() - expectedDate.getTime()) > 1000) {
        return {
          success: false,
          error: 'Ce service a été modifié par quelqu\'un d\'autre. Veuillez rafraîchir la page pour voir les dernières modifications.',
          conflict: true,
          currentUpdatedAt: actualDate.toISOString(),
        };
      }
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return { success: false, error: 'Catégorie non trouvée' };
      }
    }

    // Update service (handles race condition via unique constraint)
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(categoryId !== undefined && { categoryId }),
        ...updateData,
      },
    });

    // Revalidate affected paths (layout revalidates nav/footer across all pages)
    revalidatePath('/', 'layout');
    revalidatePath('/proprete-services');
    revalidatePath(`/proprete-services/${existingService.slug}`);
    if (slug && slug !== existingService.slug) {
      revalidatePath(`/proprete-services/${slug}`);
    }
    revalidatePath('/gp8x2k4m/services');
    revalidatePath(`/gp8x2k4m/services/${id}`);

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'UPDATE',
      resource: 'Service',
      resourceId: service.id,
      resourceName: service.title,
    });

    return { success: true, data: { id: service.id, slug: service.slug } };
  } catch (error) {
    // Handle unique constraint violation (race condition on slug)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Un service avec ce slug existe déjà' };
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Update service error:', error);
    }
    return { success: false, error: 'Une erreur est survenue lors de la mise à jour du service' };
  }
}

// ============================================
// Delete Service Action
// ============================================
export async function deleteServiceAction(
  input: { id: string }
): Promise<ActionResult> {
  try {
    // Require services:delete permission (ADMIN, SUPER_ADMIN only)
    const session = await requirePermission('services:delete');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate input
    const result = deleteServiceSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message };
    }

    const { id } = result.data;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return { success: false, error: 'Service non trouvé' };
    }

    // Delete service
    await prisma.service.delete({
      where: { id },
    });

    // Revalidate affected paths (layout revalidates nav/footer across all pages)
    revalidatePath('/', 'layout');
    revalidatePath('/proprete-services');
    revalidatePath(`/proprete-services/${existingService.slug}`);
    revalidatePath('/gp8x2k4m/services');

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Service',
      resourceId: id,
      resourceName: existingService.title,
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete service error:', error);
    }
    return { success: false, error: 'Une erreur est survenue lors de la suppression du service' };
  }
}

// ============================================
// Toggle Service Published Status
// ============================================
const togglePublishedSchema = deleteServiceSchema; // Same validation: UUID required

export async function toggleServicePublishedAction(
  input: { id: string }
): Promise<ActionResult<{ published: boolean }>> {
  try {
    // Require services:publish permission (EDITOR, ADMIN, SUPER_ADMIN)
    const session = await requirePermission('services:publish');

    // Rate limiting with fallback
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return { success: false, error: 'Trop de requêtes. Réessayez plus tard.' };
    }

    // Validate UUID format
    const result = togglePublishedSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message };
    }

    const { id } = result.data;

    // Get current service
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return { success: false, error: 'Service non trouvé' };
    }

    // Toggle published status
    const service = await prisma.service.update({
      where: { id },
      data: {
        published: !existingService.published,
      },
    });

    // Revalidate affected paths (layout revalidates nav/footer across all pages)
    revalidatePath('/', 'layout');
    revalidatePath('/proprete-services');
    revalidatePath(`/proprete-services/${existingService.slug}`);
    revalidatePath('/gp8x2k4m/services');

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: service.published ? 'PUBLISH' : 'UNPUBLISH',
      resource: 'Service',
      resourceId: id,
      resourceName: existingService.title,
    });

    return { success: true, data: { published: service.published } };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Toggle service published error:', error);
    }
    return { success: false, error: 'Une erreur est survenue' };
  }
}
