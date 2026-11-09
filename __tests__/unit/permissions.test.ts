import {
  ROLE_HIERARCHY,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasHigherOrEqualRole,
  canAccessAdmin,
  canActOnUser,
  canAssignRole,
  getPermissions,
  Permission,
} from '@/lib/permissions';

describe('permissions', () => {
  // ============================================
  // ROLE_HIERARCHY tests
  // ============================================
  describe('ROLE_HIERARCHY', () => {
    it('should have USER at the lowest level (0)', () => {
      expect(ROLE_HIERARCHY.USER).toBe(0);
    });

    it('should have VIEWER at level 1', () => {
      expect(ROLE_HIERARCHY.VIEWER).toBe(1);
    });

    it('should have EDITOR at level 2', () => {
      expect(ROLE_HIERARCHY.EDITOR).toBe(2);
    });

    it('should have ADMIN at level 3', () => {
      expect(ROLE_HIERARCHY.ADMIN).toBe(3);
    });

    it('should have SUPER_ADMIN at the highest level (4)', () => {
      expect(ROLE_HIERARCHY.SUPER_ADMIN).toBe(4);
    });

    it('should maintain correct hierarchy order: USER < VIEWER < EDITOR < ADMIN < SUPER_ADMIN', () => {
      expect(ROLE_HIERARCHY.USER).toBeLessThan(ROLE_HIERARCHY.VIEWER);
      expect(ROLE_HIERARCHY.VIEWER).toBeLessThan(ROLE_HIERARCHY.EDITOR);
      expect(ROLE_HIERARCHY.EDITOR).toBeLessThan(ROLE_HIERARCHY.ADMIN);
      expect(ROLE_HIERARCHY.ADMIN).toBeLessThan(ROLE_HIERARCHY.SUPER_ADMIN);
    });
  });

  // ============================================
  // hasPermission tests
  // ============================================
  describe('hasPermission', () => {
    describe('USER role', () => {
      it('should have no permissions', () => {
        expect(hasPermission('USER', 'dashboard:view')).toBe(false);
        expect(hasPermission('USER', 'services:view')).toBe(false);
        expect(hasPermission('USER', 'categories:view')).toBe(false);
        expect(hasPermission('USER', 'security:view')).toBe(false);
        expect(hasPermission('USER', 'users:view')).toBe(false);
      });
    });

    describe('VIEWER role', () => {
      it('should be able to view dashboard', () => {
        expect(hasPermission('VIEWER', 'dashboard:view')).toBe(true);
      });

      it('should be able to view services', () => {
        expect(hasPermission('VIEWER', 'services:view')).toBe(true);
      });

      it('should be able to view categories', () => {
        expect(hasPermission('VIEWER', 'categories:view')).toBe(true);
      });

      it('should NOT be able to delete services', () => {
        expect(hasPermission('VIEWER', 'services:delete')).toBe(false);
      });

      it('should NOT be able to create services', () => {
        expect(hasPermission('VIEWER', 'services:create')).toBe(false);
      });

      it('should NOT be able to view security', () => {
        expect(hasPermission('VIEWER', 'security:view')).toBe(false);
      });

      it('should NOT be able to view users', () => {
        expect(hasPermission('VIEWER', 'users:view')).toBe(false);
      });
    });

    describe('EDITOR role', () => {
      it('should be able to view dashboard', () => {
        expect(hasPermission('EDITOR', 'dashboard:view')).toBe(true);
      });

      it('should be able to create services', () => {
        expect(hasPermission('EDITOR', 'services:create')).toBe(true);
      });

      it('should be able to update services', () => {
        expect(hasPermission('EDITOR', 'services:update')).toBe(true);
      });

      it('should be able to publish services', () => {
        expect(hasPermission('EDITOR', 'services:publish')).toBe(true);
      });

      it('should be able to create categories', () => {
        expect(hasPermission('EDITOR', 'categories:create')).toBe(true);
      });

      it('should be able to update categories', () => {
        expect(hasPermission('EDITOR', 'categories:update')).toBe(true);
      });

      it('should NOT be able to delete services', () => {
        expect(hasPermission('EDITOR', 'services:delete')).toBe(false);
      });

      it('should NOT be able to delete categories', () => {
        expect(hasPermission('EDITOR', 'categories:delete')).toBe(false);
      });

      it('should NOT be able to view security', () => {
        expect(hasPermission('EDITOR', 'security:view')).toBe(false);
      });

      it('should NOT be able to view users', () => {
        expect(hasPermission('EDITOR', 'users:view')).toBe(false);
      });
    });

    describe('ADMIN role', () => {
      it('should be able to view dashboard', () => {
        expect(hasPermission('ADMIN', 'dashboard:view')).toBe(true);
      });

      it('should be able to delete services', () => {
        expect(hasPermission('ADMIN', 'services:delete')).toBe(true);
      });

      it('should be able to delete categories', () => {
        expect(hasPermission('ADMIN', 'categories:delete')).toBe(true);
      });

      it('should have access to security:view', () => {
        expect(hasPermission('ADMIN', 'security:view')).toBe(true);
      });

      it('should have access to security:ban_ip', () => {
        expect(hasPermission('ADMIN', 'security:ban_ip')).toBe(true);
      });

      it('should have access to security:unban_ip', () => {
        expect(hasPermission('ADMIN', 'security:unban_ip')).toBe(true);
      });

      it('should have access to audit:view', () => {
        expect(hasPermission('ADMIN', 'audit:view')).toBe(true);
      });

      it('should NOT have access to users:view', () => {
        expect(hasPermission('ADMIN', 'users:view')).toBe(false);
      });

      it('should NOT have access to users:create', () => {
        expect(hasPermission('ADMIN', 'users:create')).toBe(false);
      });

      it('should NOT have access to users:update', () => {
        expect(hasPermission('ADMIN', 'users:update')).toBe(false);
      });

      it('should NOT have access to users:delete', () => {
        expect(hasPermission('ADMIN', 'users:delete')).toBe(false);
      });

      it('should NOT have access to users:change_role', () => {
        expect(hasPermission('ADMIN', 'users:change_role')).toBe(false);
      });
    });

    describe('SUPER_ADMIN role', () => {
      it('should have access to all dashboard permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'dashboard:view')).toBe(true);
      });

      it('should have access to all services permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'services:view')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'services:create')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'services:update')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'services:delete')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'services:publish')).toBe(true);
      });

      it('should have access to all categories permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'categories:view')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'categories:create')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'categories:update')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'categories:delete')).toBe(true);
      });

      it('should have access to all security permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'security:view')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'security:ban_ip')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'security:unban_ip')).toBe(true);
      });

      it('should have access to all users permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'users:view')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'users:create')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'users:update')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'users:delete')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'users:change_role')).toBe(true);
      });

      it('should have access to audit:view', () => {
        expect(hasPermission('SUPER_ADMIN', 'audit:view')).toBe(true);
      });
    });
  });

  // ============================================
  // hasAllPermissions tests
  // ============================================
  describe('hasAllPermissions', () => {
    it('should return true when role has all specified permissions', () => {
      const permissions: Permission[] = ['dashboard:view', 'services:view', 'categories:view'];
      expect(hasAllPermissions('VIEWER', permissions)).toBe(true);
      expect(hasAllPermissions('EDITOR', permissions)).toBe(true);
      expect(hasAllPermissions('ADMIN', permissions)).toBe(true);
      expect(hasAllPermissions('SUPER_ADMIN', permissions)).toBe(true);
    });

    it('should return false when role is missing at least one permission', () => {
      const permissions: Permission[] = ['dashboard:view', 'services:delete'];
      expect(hasAllPermissions('VIEWER', permissions)).toBe(false);
      expect(hasAllPermissions('EDITOR', permissions)).toBe(false);
    });

    it('should return true for ADMIN with all security permissions', () => {
      const securityPermissions: Permission[] = ['security:view', 'security:ban_ip', 'security:unban_ip'];
      expect(hasAllPermissions('ADMIN', securityPermissions)).toBe(true);
    });

    it('should return false for ADMIN with user permissions', () => {
      const userPermissions: Permission[] = ['users:view', 'users:create'];
      expect(hasAllPermissions('ADMIN', userPermissions)).toBe(false);
    });

    it('should return true for SUPER_ADMIN with all permissions', () => {
      const allPermissions: Permission[] = [
        'dashboard:view',
        'services:delete',
        'security:view',
        'users:view',
        'users:change_role',
      ];
      expect(hasAllPermissions('SUPER_ADMIN', allPermissions)).toBe(true);
    });

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions('USER', [])).toBe(true);
      expect(hasAllPermissions('VIEWER', [])).toBe(true);
    });

    it('should return false for USER with any permission', () => {
      expect(hasAllPermissions('USER', ['dashboard:view'])).toBe(false);
    });
  });

  // ============================================
  // hasAnyPermission tests
  // ============================================
  describe('hasAnyPermission', () => {
    it('should return true when role has at least one of the specified permissions', () => {
      const permissions: Permission[] = ['services:delete', 'dashboard:view'];
      expect(hasAnyPermission('VIEWER', permissions)).toBe(true); // has dashboard:view
      expect(hasAnyPermission('ADMIN', permissions)).toBe(true); // has both
    });

    it('should return false when role has none of the specified permissions', () => {
      const permissions: Permission[] = ['users:view', 'users:create', 'users:delete'];
      expect(hasAnyPermission('USER', permissions)).toBe(false);
      expect(hasAnyPermission('VIEWER', permissions)).toBe(false);
      expect(hasAnyPermission('EDITOR', permissions)).toBe(false);
      expect(hasAnyPermission('ADMIN', permissions)).toBe(false);
    });

    it('should return true for SUPER_ADMIN with any permissions', () => {
      const permissions: Permission[] = ['users:view', 'users:change_role'];
      expect(hasAnyPermission('SUPER_ADMIN', permissions)).toBe(true);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermission('SUPER_ADMIN', [])).toBe(false);
      expect(hasAnyPermission('USER', [])).toBe(false);
    });

    it('should return true for EDITOR with create permissions', () => {
      const permissions: Permission[] = ['services:create', 'categories:create'];
      expect(hasAnyPermission('EDITOR', permissions)).toBe(true);
    });

    it('should return false for VIEWER with create/delete permissions', () => {
      const permissions: Permission[] = ['services:create', 'services:delete', 'categories:delete'];
      expect(hasAnyPermission('VIEWER', permissions)).toBe(false);
    });
  });

  // ============================================
  // hasHigherOrEqualRole tests
  // ============================================
  describe('hasHigherOrEqualRole', () => {
    describe('SUPER_ADMIN comparisons', () => {
      it('should be >= all roles', () => {
        expect(hasHigherOrEqualRole('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
        expect(hasHigherOrEqualRole('SUPER_ADMIN', 'ADMIN')).toBe(true);
        expect(hasHigherOrEqualRole('SUPER_ADMIN', 'EDITOR')).toBe(true);
        expect(hasHigherOrEqualRole('SUPER_ADMIN', 'VIEWER')).toBe(true);
        expect(hasHigherOrEqualRole('SUPER_ADMIN', 'USER')).toBe(true);
      });
    });

    describe('ADMIN comparisons', () => {
      it('should be >= EDITOR, VIEWER, USER', () => {
        expect(hasHigherOrEqualRole('ADMIN', 'ADMIN')).toBe(true);
        expect(hasHigherOrEqualRole('ADMIN', 'EDITOR')).toBe(true);
        expect(hasHigherOrEqualRole('ADMIN', 'VIEWER')).toBe(true);
        expect(hasHigherOrEqualRole('ADMIN', 'USER')).toBe(true);
      });

      it('should NOT be >= SUPER_ADMIN', () => {
        expect(hasHigherOrEqualRole('ADMIN', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('EDITOR comparisons', () => {
      it('should be >= VIEWER, USER', () => {
        expect(hasHigherOrEqualRole('EDITOR', 'EDITOR')).toBe(true);
        expect(hasHigherOrEqualRole('EDITOR', 'VIEWER')).toBe(true);
        expect(hasHigherOrEqualRole('EDITOR', 'USER')).toBe(true);
      });

      it('should NOT be >= ADMIN or SUPER_ADMIN', () => {
        expect(hasHigherOrEqualRole('EDITOR', 'ADMIN')).toBe(false);
        expect(hasHigherOrEqualRole('EDITOR', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('VIEWER comparisons', () => {
      it('should be >= USER', () => {
        expect(hasHigherOrEqualRole('VIEWER', 'VIEWER')).toBe(true);
        expect(hasHigherOrEqualRole('VIEWER', 'USER')).toBe(true);
      });

      it('should NOT be >= EDITOR, ADMIN, or SUPER_ADMIN', () => {
        expect(hasHigherOrEqualRole('VIEWER', 'EDITOR')).toBe(false);
        expect(hasHigherOrEqualRole('VIEWER', 'ADMIN')).toBe(false);
        expect(hasHigherOrEqualRole('VIEWER', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('USER comparisons', () => {
      it('should only be >= USER itself', () => {
        expect(hasHigherOrEqualRole('USER', 'USER')).toBe(true);
      });

      it('should NOT be >= any other role', () => {
        expect(hasHigherOrEqualRole('USER', 'VIEWER')).toBe(false);
        expect(hasHigherOrEqualRole('USER', 'EDITOR')).toBe(false);
        expect(hasHigherOrEqualRole('USER', 'ADMIN')).toBe(false);
        expect(hasHigherOrEqualRole('USER', 'SUPER_ADMIN')).toBe(false);
      });
    });
  });

  // ============================================
  // canAccessAdmin tests
  // ============================================
  describe('canAccessAdmin', () => {
    it('should allow VIEWER to access admin', () => {
      expect(canAccessAdmin('VIEWER')).toBe(true);
    });

    it('should allow EDITOR to access admin', () => {
      expect(canAccessAdmin('EDITOR')).toBe(true);
    });

    it('should allow ADMIN to access admin', () => {
      expect(canAccessAdmin('ADMIN')).toBe(true);
    });

    it('should allow SUPER_ADMIN to access admin', () => {
      expect(canAccessAdmin('SUPER_ADMIN')).toBe(true);
    });

    it('should NOT allow USER to access admin', () => {
      expect(canAccessAdmin('USER')).toBe(false);
    });
  });

  // ============================================
  // canActOnUser tests
  // ============================================
  describe('canActOnUser', () => {
    describe('SUPER_ADMIN acting on others', () => {
      it('should allow SUPER_ADMIN to act on ADMIN', () => {
        expect(canActOnUser('SUPER_ADMIN', 'ADMIN')).toBe(true);
      });

      it('should allow SUPER_ADMIN to act on EDITOR', () => {
        expect(canActOnUser('SUPER_ADMIN', 'EDITOR')).toBe(true);
      });

      it('should allow SUPER_ADMIN to act on VIEWER', () => {
        expect(canActOnUser('SUPER_ADMIN', 'VIEWER')).toBe(true);
      });

      it('should allow SUPER_ADMIN to act on USER', () => {
        expect(canActOnUser('SUPER_ADMIN', 'USER')).toBe(true);
      });

      it('should NOT allow SUPER_ADMIN to act on SUPER_ADMIN (same level)', () => {
        expect(canActOnUser('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('ADMIN acting on others', () => {
      it('should NOT allow ADMIN to act on ADMIN (same level)', () => {
        expect(canActOnUser('ADMIN', 'ADMIN')).toBe(false);
      });

      it('should NOT allow ADMIN to act on SUPER_ADMIN', () => {
        expect(canActOnUser('ADMIN', 'SUPER_ADMIN')).toBe(false);
      });

      it('should allow ADMIN to act on EDITOR', () => {
        expect(canActOnUser('ADMIN', 'EDITOR')).toBe(true);
      });

      it('should allow ADMIN to act on VIEWER', () => {
        expect(canActOnUser('ADMIN', 'VIEWER')).toBe(true);
      });

      it('should allow ADMIN to act on USER', () => {
        expect(canActOnUser('ADMIN', 'USER')).toBe(true);
      });
    });

    describe('EDITOR acting on others', () => {
      it('should allow EDITOR to act on VIEWER', () => {
        expect(canActOnUser('EDITOR', 'VIEWER')).toBe(true);
      });

      it('should allow EDITOR to act on USER', () => {
        expect(canActOnUser('EDITOR', 'USER')).toBe(true);
      });

      it('should NOT allow EDITOR to act on EDITOR (same level)', () => {
        expect(canActOnUser('EDITOR', 'EDITOR')).toBe(false);
      });

      it('should NOT allow EDITOR to act on ADMIN', () => {
        expect(canActOnUser('EDITOR', 'ADMIN')).toBe(false);
      });

      it('should NOT allow EDITOR to act on SUPER_ADMIN', () => {
        expect(canActOnUser('EDITOR', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('VIEWER acting on others', () => {
      it('should allow VIEWER to act on USER', () => {
        expect(canActOnUser('VIEWER', 'USER')).toBe(true);
      });

      it('should NOT allow VIEWER to act on VIEWER (same level)', () => {
        expect(canActOnUser('VIEWER', 'VIEWER')).toBe(false);
      });

      it('should NOT allow VIEWER to act on any higher role', () => {
        expect(canActOnUser('VIEWER', 'EDITOR')).toBe(false);
        expect(canActOnUser('VIEWER', 'ADMIN')).toBe(false);
        expect(canActOnUser('VIEWER', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('USER acting on others', () => {
      it('should NOT allow USER to act on any role including USER', () => {
        expect(canActOnUser('USER', 'USER')).toBe(false);
        expect(canActOnUser('USER', 'VIEWER')).toBe(false);
        expect(canActOnUser('USER', 'EDITOR')).toBe(false);
        expect(canActOnUser('USER', 'ADMIN')).toBe(false);
        expect(canActOnUser('USER', 'SUPER_ADMIN')).toBe(false);
      });
    });
  });

  // ============================================
  // canAssignRole tests
  // ============================================
  describe('canAssignRole', () => {
    describe('SUPER_ADMIN assigning roles', () => {
      it('should allow SUPER_ADMIN to assign ADMIN', () => {
        expect(canAssignRole('SUPER_ADMIN', 'ADMIN')).toBe(true);
      });

      it('should allow SUPER_ADMIN to assign EDITOR', () => {
        expect(canAssignRole('SUPER_ADMIN', 'EDITOR')).toBe(true);
      });

      it('should allow SUPER_ADMIN to assign VIEWER', () => {
        expect(canAssignRole('SUPER_ADMIN', 'VIEWER')).toBe(true);
      });

      it('should allow SUPER_ADMIN to assign USER', () => {
        expect(canAssignRole('SUPER_ADMIN', 'USER')).toBe(true);
      });

      it('should NOT allow SUPER_ADMIN to assign SUPER_ADMIN', () => {
        expect(canAssignRole('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('ADMIN assigning roles', () => {
      it('should NOT allow ADMIN to assign ADMIN', () => {
        expect(canAssignRole('ADMIN', 'ADMIN')).toBe(false);
      });

      it('should NOT allow ADMIN to assign SUPER_ADMIN', () => {
        expect(canAssignRole('ADMIN', 'SUPER_ADMIN')).toBe(false);
      });

      it('should allow ADMIN to assign EDITOR', () => {
        expect(canAssignRole('ADMIN', 'EDITOR')).toBe(true);
      });

      it('should allow ADMIN to assign VIEWER', () => {
        expect(canAssignRole('ADMIN', 'VIEWER')).toBe(true);
      });

      it('should allow ADMIN to assign USER', () => {
        expect(canAssignRole('ADMIN', 'USER')).toBe(true);
      });
    });

    describe('EDITOR assigning roles', () => {
      it('should allow EDITOR to assign VIEWER', () => {
        expect(canAssignRole('EDITOR', 'VIEWER')).toBe(true);
      });

      it('should allow EDITOR to assign USER', () => {
        expect(canAssignRole('EDITOR', 'USER')).toBe(true);
      });

      it('should NOT allow EDITOR to assign EDITOR', () => {
        expect(canAssignRole('EDITOR', 'EDITOR')).toBe(false);
      });

      it('should NOT allow EDITOR to assign ADMIN', () => {
        expect(canAssignRole('EDITOR', 'ADMIN')).toBe(false);
      });

      it('should NOT allow EDITOR to assign SUPER_ADMIN', () => {
        expect(canAssignRole('EDITOR', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('VIEWER assigning roles', () => {
      it('should allow VIEWER to assign USER', () => {
        expect(canAssignRole('VIEWER', 'USER')).toBe(true);
      });

      it('should NOT allow VIEWER to assign VIEWER', () => {
        expect(canAssignRole('VIEWER', 'VIEWER')).toBe(false);
      });

      it('should NOT allow VIEWER to assign any higher role', () => {
        expect(canAssignRole('VIEWER', 'EDITOR')).toBe(false);
        expect(canAssignRole('VIEWER', 'ADMIN')).toBe(false);
        expect(canAssignRole('VIEWER', 'SUPER_ADMIN')).toBe(false);
      });
    });

    describe('USER assigning roles', () => {
      it('should NOT allow USER to assign any role', () => {
        expect(canAssignRole('USER', 'USER')).toBe(false);
        expect(canAssignRole('USER', 'VIEWER')).toBe(false);
        expect(canAssignRole('USER', 'EDITOR')).toBe(false);
        expect(canAssignRole('USER', 'ADMIN')).toBe(false);
        expect(canAssignRole('USER', 'SUPER_ADMIN')).toBe(false);
      });
    });
  });

  // ============================================
  // getPermissions tests (bonus)
  // ============================================
  describe('getPermissions', () => {
    it('should return empty array for USER', () => {
      expect(getPermissions('USER')).toEqual([]);
    });

    it('should return correct permissions for VIEWER', () => {
      const permissions = getPermissions('VIEWER');
      expect(permissions).toContain('dashboard:view');
      expect(permissions).toContain('services:view');
      expect(permissions).toContain('categories:view');
      // Refonte : consultation des contenus, demandes, médias et réglages (lecture seule)
      expect(permissions).toEqual(expect.arrayContaining(['content:view', 'leads:view', 'media:view', 'settings:view']));
      expect(permissions.some((p) => /:(create|update|delete|publish|upload|manage)$/.test(p))).toBe(false);
      expect(permissions).toHaveLength(7);
    });

    it('should return more permissions for EDITOR than VIEWER', () => {
      const editorPermissions = getPermissions('EDITOR');
      const viewerPermissions = getPermissions('VIEWER');
      expect(editorPermissions.length).toBeGreaterThan(viewerPermissions.length);
    });

    it('should return more permissions for ADMIN than EDITOR', () => {
      const adminPermissions = getPermissions('ADMIN');
      const editorPermissions = getPermissions('EDITOR');
      expect(adminPermissions.length).toBeGreaterThan(editorPermissions.length);
    });

    it('should return more permissions for SUPER_ADMIN than ADMIN', () => {
      const superAdminPermissions = getPermissions('SUPER_ADMIN');
      const adminPermissions = getPermissions('ADMIN');
      expect(superAdminPermissions.length).toBeGreaterThan(adminPermissions.length);
    });

    it('should include users permissions only for SUPER_ADMIN', () => {
      const superAdminPermissions = getPermissions('SUPER_ADMIN');
      expect(superAdminPermissions).toContain('users:view');
      expect(superAdminPermissions).toContain('users:create');
      expect(superAdminPermissions).toContain('users:update');
      expect(superAdminPermissions).toContain('users:delete');
      expect(superAdminPermissions).toContain('users:change_role');
    });
  });
});
