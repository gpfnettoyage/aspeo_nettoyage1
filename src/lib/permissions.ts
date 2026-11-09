import { Role } from '@prisma/client';

// ============================================
// Permission System
// ============================================
// Centralized permission definitions for all admin actions
// Based on principle of least privilege

/**
 * Role hierarchy (higher number = more privileges)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Permission types for the admin panel
 */
export type Permission =
  // Dashboard
  | 'dashboard:view'
  // Services
  | 'services:view'
  | 'services:create'
  | 'services:update'
  | 'services:delete'
  | 'services:publish'
  // Categories
  | 'categories:view'
  | 'categories:create'
  | 'categories:update'
  | 'categories:delete'
  // Security
  | 'security:view'
  | 'security:ban_ip'
  | 'security:unban_ip'
  // Users (SUPER_ADMIN only)
  | 'users:view'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:change_role'
  // Audit logs
  | 'audit:view'
  // Refonte 2026 : contenus, demandes, médias, réglages
  | 'content:view'
  | 'content:create'
  | 'content:update'
  | 'content:publish'
  | 'content:delete'
  | 'leads:view'
  | 'leads:update'
  | 'leads:delete'
  | 'media:view'
  | 'media:upload'
  | 'media:delete'
  | 'settings:view'
  | 'settings:update'
  | 'redirects:manage';

// Permissions ajoutées par la refonte (contenus, demandes, médias, réglages)
const CONTENT_VIEWER = ['content:view', 'leads:view', 'media:view', 'settings:view'] as Permission[];
const CONTENT_EDITOR = ['content:view', 'content:create', 'content:update', 'content:publish', 'leads:view', 'leads:update', 'media:view', 'media:upload', 'settings:view'] as Permission[];
const CONTENT_ADMIN = ['content:view', 'content:create', 'content:update', 'content:publish', 'content:delete', 'leads:view', 'leads:update', 'leads:delete', 'media:view', 'media:upload', 'media:delete', 'settings:view', 'settings:update', 'redirects:manage'] as Permission[];

/**
 * Permission matrix: which roles have which permissions
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [],
  VIEWER: [
    'dashboard:view',
    'services:view',
    'categories:view',
    ...CONTENT_VIEWER,
  ],

  EDITOR: [
    'dashboard:view',
    'services:view',
    'services:create',
    'services:update',
    'services:publish',
    'categories:view',
    'categories:create',
    'categories:update',
    ...CONTENT_EDITOR,
  ],

  ADMIN: [
    'dashboard:view',
    'services:view',
    'services:create',
    'services:update',
    'services:delete',
    'services:publish',
    'categories:view',
    'categories:create',
    'categories:update',
    'categories:delete',
    'security:view',
    'security:ban_ip',
    'security:unban_ip',
    'audit:view',
    ...CONTENT_ADMIN,
  ],

  SUPER_ADMIN: [
    'dashboard:view',
    'services:view',
    'services:create',
    'services:update',
    'services:delete',
    'services:publish',
    'categories:view',
    'categories:create',
    'categories:update',
    'categories:delete',
    'security:view',
    'security:ban_ip',
    'security:unban_ip',
    'users:view',
    'users:create',
    'users:update',
    'users:delete',
    'users:change_role',
    'audit:view',
    ...CONTENT_ADMIN,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if role A has higher or equal privileges than role B
 */
export function hasHigherOrEqualRole(roleA: Role, roleB: Role): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Minimum role required for admin panel access
 */
export const MINIMUM_ADMIN_ROLE: Role = 'VIEWER';

/**
 * Check if a role can access the admin panel at all
 */
export function canAccessAdmin(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[MINIMUM_ADMIN_ROLE];
}

/**
 * Get human-readable role name in French
 */
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    ADMIN: 'Administrateur',
    EDITOR: 'Éditeur',
    VIEWER: 'Lecteur',
    USER: 'Utilisateur',
  };
  return names[role] ?? role;
}

/**
 * Get role description in French
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    SUPER_ADMIN: 'Accès complet : gestion des utilisateurs, sécurité, contenu',
    ADMIN: 'Gestion du contenu et supervision de la sécurité',
    EDITOR: 'Création et modification du contenu',
    VIEWER: 'Consultation du tableau de bord uniquement',
    USER: 'Accès restreint au site public uniquement',
  };
  return descriptions[role] ?? '';
}

// ============================================
// User Action Permission Helpers
// ============================================
// SECURITY: Centralized helpers to prevent privilege escalation
// These functions are used in users.actions.ts to enforce role hierarchy

/**
 * Check if an actor can perform actions on a target user
 * Actor must have STRICTLY higher role than target (not equal)
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the user being acted upon
 * @returns true if actor can act on target
 *
 * @example
 * canActOnUser('SUPER_ADMIN', 'ADMIN') // true
 * canActOnUser('ADMIN', 'ADMIN') // false (same level)
 * canActOnUser('ADMIN', 'SUPER_ADMIN') // false (lower)
 */
export function canActOnUser(actorRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Check if an actor can assign a specific role to a user
 * Actor can only assign roles that are strictly lower than their own
 *
 * @param actorRole - The role of the user performing the assignment
 * @param roleToAssign - The role to be assigned
 * @returns true if actor can assign this role
 *
 * @example
 * canAssignRole('SUPER_ADMIN', 'ADMIN') // true
 * canAssignRole('ADMIN', 'ADMIN') // false (can't assign same level)
 * canAssignRole('ADMIN', 'SUPER_ADMIN') // false (can't assign higher)
 */
export function canAssignRole(actorRole: Role, roleToAssign: Role): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[roleToAssign];
}
