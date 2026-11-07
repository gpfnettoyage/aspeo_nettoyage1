'use server';

import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import {
  canActOnUser,
  canAssignRole,
} from '@/lib/permissions';
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserSchema,
  deleteUserSchema,
  sendPasswordResetSchema,
  changeOwnPasswordSchema,
  type CreateUserInput,
  type UpdateUserRoleInput,
  type UpdateUserInput,
  type DeleteUserInput,
  type SendPasswordResetInput,
  type ChangeOwnPasswordInput,
} from './schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendAdminPasswordResetEmail } from '@/lib/email';
import {
  type PaginatedResponse,
  type PaginationParams,
  DEFAULT_PAGE_SIZES,
  calculatePagination,
  getSkip,
} from '@/types/pagination';

// ============================================
// User Management Server Actions
// ============================================
// All actions require SUPER_ADMIN role (users:* permissions)
// These actions are protected by the permission system

/**
 * User type returned by list/get actions
 */
export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    sessions: number;
  };
}

/**
 * Get all users (SUPER_ADMIN only) - Legacy non-paginated version
 * @deprecated Use getUsersPaginatedAction for better performance
 */
export async function getUsersAction(): Promise<UserListItem[]> {
  await requirePermission('users:view');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: [
      // Order by role hierarchy (highest first), then by creation date
      { role: 'asc' }, // SUPER_ADMIN first in enum order
      { createdAt: 'asc' },
    ],
  });

  return users;
}

/**
 * Get users with pagination (SUPER_ADMIN only)
 */
export async function getUsersPaginatedAction(
  params: PaginationParams = {}
): Promise<PaginatedResponse<UserListItem>> {
  await requirePermission('users:view');

  const page = params.page || 1;
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZES.users;
  const skip = getSkip(page, pageSize);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
      skip,
      take: pageSize,
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    meta: calculatePagination(page, pageSize, total),
  };
}

/**
 * Get a single user by ID (SUPER_ADMIN only)
 */
export async function getUserByIdAction(userId: string): Promise<UserListItem | null> {
  await requirePermission('users:view');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sessions: true,
        },
      },
    },
  });

  return user;
}

/**
 * Create a new user (SUPER_ADMIN only)
 */
export async function createUserAction(
  input: CreateUserInput
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const session = await requirePermission('users:create');

  // Validate input
  const validation = createUserSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { email, name, password, role } = validation.data;

  // SECURITY: Cannot create user with role >= own (use centralized helper)
  if (!canAssignRole(session.user.role, role as Role)) {
    return { success: false, error: 'Impossible de créer un utilisateur avec un rôle supérieur ou égal au vôtre' };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'Cette adresse email est déjà utilisée' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and account in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: name || null,
          role: role as Role,
          emailVerified: true, // Admin-created users are pre-verified
        },
      });

      // Create credential account (BetterAuth stores passwords in account table)
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.id,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      return newUser;
    });

    revalidatePath('/gp8x2k4m/users');
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: 'Erreur lors de la création de l\'utilisateur' };
  }
}

/**
 * Update user role (SUPER_ADMIN only)
 */
export async function updateUserRoleAction(
  input: UpdateUserRoleInput
): Promise<{ success: boolean; error?: string }> {
  const session = await requirePermission('users:change_role');

  // Validate input
  const validation = updateUserRoleSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { userId, role } = validation.data;

  // SECURITY: Cannot modify own role
  if (userId === session.user.id) {
    return { success: false, error: 'Impossible de modifier votre propre rôle' };
  }

  // SECURITY: Cannot assign role >= own (use centralized helper)
  if (!canAssignRole(session.user.role, role as Role)) {
    return { success: false, error: 'Impossible d\'attribuer un rôle supérieur ou égal au vôtre' };
  }

  try {
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // SECURITY: Cannot modify user with role >= own (use centralized helper)
    if (!canActOnUser(session.user.role, targetUser.role)) {
      return { success: false, error: 'Impossible de modifier le rôle de cet utilisateur' };
    }

    // Update role
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    revalidatePath('/gp8x2k4m/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user role:', error);
    return { success: false, error: 'Erreur lors de la mise à jour du rôle' };
  }
}

/**
 * Update user info (SUPER_ADMIN only)
 */
export async function updateUserAction(
  input: UpdateUserInput
): Promise<{ success: boolean; error?: string }> {
  const session = await requirePermission('users:update');

  // Validate input
  const validation = updateUserSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { userId, name, email } = validation.data;

  try {
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // SECURITY: Cannot modify user with role >= own, unless modifying self (use centralized helper)
    if (userId !== session.user.id && !canActOnUser(session.user.role, targetUser.role)) {
      return { success: false, error: 'Impossible de modifier cet utilisateur' };
    }

    // Check email uniqueness if changing email
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return { success: false, error: 'Cette adresse email est déjà utilisée' };
      }
    }

    // Build update data
    const updateData: { name?: string | null; email?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (email) updateData.email = email;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath('/gp8x2k4m/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' };
  }
}

/**
 * Delete a user (SUPER_ADMIN only)
 */
export async function deleteUserAction(
  input: DeleteUserInput
): Promise<{ success: boolean; error?: string }> {
  const session = await requirePermission('users:delete');

  // Validate input
  const validation = deleteUserSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { userId } = validation.data;

  // SECURITY: Cannot delete self
  if (userId === session.user.id) {
    return { success: false, error: 'Impossible de supprimer votre propre compte' };
  }

  try {
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // SECURITY: Cannot delete user with role >= own (use centralized helper)
    if (!canActOnUser(session.user.role, targetUser.role)) {
      return { success: false, error: 'Impossible de supprimer cet utilisateur' };
    }

    // Delete user (cascades to sessions and accounts)
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/gp8x2k4m/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' };
  }
}

/**
 * Send password reset email to a user (admin action)
 * SECURITY: Does not directly set password - sends email for user to reset themselves
 */
export async function sendPasswordResetAction(
  input: SendPasswordResetInput
): Promise<{ success: boolean; error?: string }> {
  const session = await requirePermission('users:update');

  // Validate input
  const validation = sendPasswordResetSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { userId } = validation.data;

  try {
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // SECURITY: Cannot send reset to user with role >= own
    if (!canActOnUser(session.user.role, targetUser.role)) {
      return { success: false, error: 'Impossible d\'envoyer un lien de réinitialisation à cet utilisateur' };
    }

    // Use BetterAuth API to send password reset email
    const headersList = await headers();
    await auth.api.requestPasswordReset({
      body: {
        email: targetUser.email,
        redirectTo: '/gp8x2k4m/reset-password',
      },
      headers: headersList,
    });

    // Also send a custom notification that it was triggered by an admin
    await sendAdminPasswordResetEmail(
      targetUser.email,
      session.user.email,
      targetUser.name || undefined
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset:', error);
    return { success: false, error: 'Erreur lors de l\'envoi du lien de réinitialisation' };
  }
}

/**
 * Change own password (requires current password + 2FA)
 * SECURITY: User must verify identity with current password AND 2FA code
 */
export async function changeOwnPasswordAction(
  input: ChangeOwnPasswordInput
): Promise<{ success: boolean; error?: string }> {
  const headersList = await headers();

  // Get current session
  const sessionData = await auth.api.getSession({
    headers: headersList,
  });

  if (!sessionData) {
    return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' };
  }

  // Validate input
  const validation = changeOwnPasswordSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { currentPassword, newPassword, totpCode } = validation.data;

  try {
    // Check if user has 2FA enabled
    const user = await prisma.user.findUnique({
      where: { id: sessionData.user.id },
      select: { twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled) {
      return { success: false, error: 'La 2FA doit être activée pour changer votre mot de passe.' };
    }

    // Verify current password using BetterAuth's verifyPassword endpoint
    try {
      await auth.api.verifyPassword({
        body: {
          password: currentPassword,
        },
        headers: headersList,
      });
    } catch {
      return { success: false, error: 'Mot de passe actuel incorrect.' };
    }

    // Verify 2FA code
    const twoFactor = await prisma.twoFactor.findFirst({
      where: { userId: sessionData.user.id },
      select: { secret: true },
    });

    if (!twoFactor) {
      return { success: false, error: 'Configuration 2FA introuvable.' };
    }

    // Use BetterAuth to verify TOTP (we need to decrypt and verify manually)
    // Since we can't easily call verifyTOTP without the pending 2FA state,
    // we'll use the same TOTP library that BetterAuth uses
    const { createOTP } = await import('@better-auth/utils/otp');
    const { symmetricDecrypt } = await import('better-auth/crypto');

    const secret = await symmetricDecrypt({
      key: process.env.BETTER_AUTH_SECRET!,
      data: twoFactor.secret,
    });

    const isValidCode = await createOTP(secret, {
      period: 30,
      digits: 6,
    }).verify(totpCode);

    if (!isValidCode) {
      return { success: false, error: 'Code 2FA incorrect.' };
    }

    // All verifications passed - update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.account.updateMany({
      where: {
        userId: sessionData.user.id,
        providerId: 'credential',
      },
      data: {
        password: hashedPassword,
      },
    });

    // Invalidate all OTHER sessions for security
    await prisma.session.deleteMany({
      where: {
        userId: sessionData.user.id,
        id: { not: sessionData.session.id },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to change password:', error);
    return { success: false, error: 'Erreur lors du changement de mot de passe.' };
  }
}

/**
 * Get user count by role (for dashboard stats)
 */
export async function getUserCountByRoleAction(): Promise<Record<Role, number>> {
  await requirePermission('users:view');

  const counts = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      id: true,
    },
  });

  // Initialize with zeros
  const result: Record<Role, number> = {
    SUPER_ADMIN: 0,
    ADMIN: 0,
    EDITOR: 0,
    VIEWER: 0,
    USER: 0,
  };

  // Fill with actual counts
  for (const count of counts) {
    result[count.role] = count._count.id;
  }

  return result;
}
