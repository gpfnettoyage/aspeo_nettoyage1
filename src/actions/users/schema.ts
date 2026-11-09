import { z } from 'zod';

// ============================================
// User Management Schemas
// ============================================
// Validation schemas for user CRUD operations
// Only SUPER_ADMIN can access these actions

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide')
    .max(255, 'Email trop long'),
  name: z
    .string()
    .max(100, 'Nom trop long')
    .optional()
    .nullable(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', 'USER'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
});

/**
 * Schema for updating user role
 */
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', 'USER'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
});

/**
 * Schema for updating user info
 */
export const updateUserSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  name: z
    .string()
    .max(100, 'Nom trop long')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('Adresse email invalide')
    .max(255, 'Email trop long')
    .optional(),
});

/**
 * Schema for deleting a user
 */
export const deleteUserSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
});

/**
 * Schema for sending password reset email to a user (admin action)
 */
export const sendPasswordResetSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
});

/**
 * Schema for changing own password (requires old password + 2FA)
 */
export const changeOwnPasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z.string(),
  totpCode: z
    .string()
    .length(6, 'Le code 2FA doit contenir 6 chiffres')
    .regex(/^\d+$/, 'Le code 2FA ne doit contenir que des chiffres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Types inferred from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type SendPasswordResetInput = z.infer<typeof sendPasswordResetSchema>;
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>;
