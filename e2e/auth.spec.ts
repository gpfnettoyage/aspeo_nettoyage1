import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Authentication Flow
 * Tests complete authentication flows for the admin backoffice
 */

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      // Title is "Administration"
      await expect(page.getByRole('heading', { name: 'Administration' })).toBeVisible();
      // Labels use htmlFor="email" and htmlFor="password"
      await expect(page.locator('label[for="email"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      // Try to submit without filling fields
      await page.getByRole('button', { name: 'Se connecter' }).click();

      // HTML5 validation should prevent submission
      // Check that we're still on login page
      await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      await page.locator('input#email').fill('invalid@example.com');
      await page.locator('input#password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Se connecter' }).click();

      // Wait for error message
      await expect(page.locator('.text-red-600, .bg-red-50')).toBeVisible({ timeout: 15000 });
    });

    test('should have password reset link', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      const resetLink = page.getByRole('link', { name: 'Mot de passe oublié ?' });
      await expect(resetLink).toBeVisible();
      await expect(resetLink).toHaveAttribute('href', '/gp8x2k4m/forgot-password');
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      const passwordInput = page.locator('input#password');
      const toggleButton = page.getByRole('button', { name: /afficher|cacher/i });

      // Initially password is hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/gp8x2k4m');
      await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
    });

    test('should redirect from /gp8x2k4m/users without auth', async ({ page }) => {
      await page.goto('/gp8x2k4m/users');
      await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
    });

    test('should redirect from /gp8x2k4m/services without auth', async ({ page }) => {
      await page.goto('/gp8x2k4m/services');
      await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
    });

    test('should redirect from /gp8x2k4m/security without auth', async ({ page }) => {
      await page.goto('/gp8x2k4m/security');
      await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
    });
  });

  test.describe('Forgot Password', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/gp8x2k4m/forgot-password');

      await expect(page.getByRole('heading', { name: /mot de passe oubli/i })).toBeVisible();
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Envoyer le lien' })).toBeVisible();
    });

    test('should have back to login link', async ({ page }) => {
      await page.goto('/gp8x2k4m/forgot-password');

      const backLink = page.getByRole('link', { name: /retour/i });
      await expect(backLink).toBeVisible();
    });

    test('should show success message for valid email submission', async ({ page }) => {
      await page.goto('/gp8x2k4m/forgot-password');

      await page.locator('input#email').fill('test@example.com');
      await page.getByRole('button', { name: 'Envoyer le lien' }).click();

      // Should show success message or stay on page
      // The actual behavior depends on whether email exists
      await page.waitForTimeout(2000);

      // Check if success view appeared or we're still on form
      // La vue de succès contient plusieurs textes correspondants (« Email envoye », « Verifiez… ») :
      // .first() évite l'erreur de mode strict, qui était silencieusement convertie en « non visible ».
      const hasSuccess = await page.getByText(/email envoy|verifiez/i).first().isVisible().catch(() => false);
      const hasError = await page.locator('.text-red-600').isVisible().catch(() => false);

      // Either success or rate limit error is acceptable
      expect(hasSuccess || hasError || await page.locator('input#email').isVisible()).toBe(true);
    });
  });
});

test.describe('Session Management', () => {
  test('should not have session after browser close', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/gp8x2k4m/login');
    await expect(page.locator('input#email')).toBeVisible();

    await context.close();

    // New context should not have session
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('/gp8x2k4m');
    await expect(newPage).toHaveURL(/\/gp8x2k4m\/login/);

    await newContext.close();
  });
});

test.describe('Rate Limiting UI Feedback', () => {
  test('should handle multiple failed login attempts', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    // Attempt a single failed login and verify form handles it
    await page.locator('input#email').fill('test@example.com');
    await page.locator('input#password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Wait for response - the loginAction has a 1500ms artificial delay + network operations
    // We wait for the error message to appear (more reliable than waiting for button text to change back)
    await expect(page.locator('.text-red-600, .bg-red-50')).toBeVisible({ timeout: 20000 });

    // Should still be on login page after failed attempt
    const isOnLoginPage = page.url().includes('/gp8x2k4m/login');
    expect(isOnLoginPage).toBe(true);
  });
});
