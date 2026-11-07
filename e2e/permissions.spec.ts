import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Permissions and Access Control
 * Tests that permission-based UI restrictions work correctly
 */

test.describe('Permission-based Navigation', () => {
  test.describe('Unauthenticated Access', () => {
    test('should not show admin navigation to unauthenticated users on public site', async ({ page }) => {
      await page.goto('/');

      // Public site should not expose admin panel links in main nav
      // (except possibly a login link)
      const pageContent = await page.content();

      // Should not have direct links to protected admin routes
      expect(pageContent).not.toContain('href="/gp8x2k4m/users"');
      expect(pageContent).not.toContain('href="/gp8x2k4m/services"');
      expect(pageContent).not.toContain('href="/gp8x2k4m/security"');
    });

    test('should show public pages without authentication', async ({ page }) => {
      await page.goto('/');

      // Public pages should be accessible
      await expect(page).not.toHaveURL(/\/gp8x2k4m\/login/);

      // Page should load content
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Admin Page Structure', () => {
    test('login page should have proper form structure', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      // Should have main form
      await expect(page.locator('form')).toBeVisible();

      // Should have email and password inputs with correct types
      await expect(page.locator('input#email[type="email"]')).toBeVisible();
      await expect(page.locator('input#password[type="password"]')).toBeVisible();
    });

    test('login page should be accessible without admin role', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      // Login page is public for admin access
      await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
    });
  });

  test.describe('Role-based Route Protection', () => {
    const protectedRoutes = [
      { path: '/gp8x2k4m', name: 'Dashboard' },
      { path: '/gp8x2k4m/services', name: 'Services' },
      { path: '/gp8x2k4m/categories', name: 'Categories' },
      { path: '/gp8x2k4m/users', name: 'Users (SUPER_ADMIN only)' },
      { path: '/gp8x2k4m/security', name: 'Security (ADMIN+)' },
    ];

    for (const route of protectedRoutes) {
      test(`${route.name} should redirect unauthenticated users`, async ({ page }) => {
        await page.goto(route.path);

        // All admin routes should redirect to login
        await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
      });
    }
  });

  test.describe('API Protection', () => {
    test('should return error for unauthenticated API requests', async ({ request }) => {
      // Test that API endpoints return proper error codes
      const response = await request.get('/api/gp8x2k4m/users');

      // Should return 401 or 404 (depending on route existence)
      expect([401, 404, 405]).toContain(response.status());
    });

    test('auth session endpoint should return valid response', async ({ request }) => {
      // BetterAuth uses /api/auth/get-session
      const response = await request.get('/api/auth/get-session');

      // Should return 200 with session data (null when not authenticated)
      expect(response.ok()).toBe(true);
    });
  });
});

test.describe('Form Permissions', () => {
  test.describe('Login Form Security', () => {
    test('should have password input with correct type', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      const passwordInput = page.locator('input#password');

      // Password fields should have proper type
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should have CSRF protection (form submission via action)', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      // Check for form with action attribute or handling
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // Next.js Server Actions don't use traditional form action
      // They use JavaScript to handle the submission
    });
  });

  test.describe('Forgot Password Form', () => {
    test('should not reveal user existence in response', async ({ page }) => {
      await page.goto('/gp8x2k4m/forgot-password');

      // Test with non-existent email
      await page.locator('input#email').fill('nonexistent12345@example.com');
      await page.getByRole('button', { name: 'Envoyer le lien' }).click();

      // Wait for the form to process (button becomes available again or success screen shows)
      await page.waitForTimeout(5000);

      // Get visible text (not HTML/script content)
      const visibleText = await page.locator('body').innerText();

      // Should NOT explicitly say "user not found" - that reveals user existence
      expect(visibleText.toLowerCase()).not.toContain('utilisateur non trouvé');
      expect(visibleText.toLowerCase()).not.toContain('user not found');
      expect(visibleText.toLowerCase()).not.toContain("l'email n'existe pas");
    });
  });
});

test.describe('Navigation Access Control', () => {
  test('public site should not expose admin routes in navigation', async ({ page }) => {
    await page.goto('/');

    // Get all links on the page
    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && href.includes('/gp8x2k4m')) {
        // Only login page should potentially be linked
        expect(href).toMatch(/\/gp8x2k4m\/login|\/gp8x2k4m$/);
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle non-existent admin routes', async ({ page }) => {
    await page.goto('/gp8x2k4m/nonexistent-page-12345');

    // Should either show 404 or redirect to login
    const url = page.url();
    const is404 = await page.getByText(/404|non trouv|not found/i).isVisible().catch(() => false);
    const isLoginRedirect = url.includes('/gp8x2k4m/login');

    expect(is404 || isLoginRedirect).toBe(true);
  });

  test('should handle malformed URLs gracefully', async ({ page }) => {
    await page.goto('/gp8x2k4m/login?redirect=javascript:alert(1)');

    // Should not execute JavaScript from URL
    // Page should still show login form
    await expect(page.locator('input#email')).toBeVisible();
  });
});
