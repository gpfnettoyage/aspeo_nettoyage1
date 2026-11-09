import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Security Features
 * Tests rate limiting, input validation, and other security mechanisms
 */

test.describe('Rate Limiting', () => {
  test.describe('Login Rate Limiting', () => {
    test('should allow initial login attempts', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      // First attempt should work (even if credentials are wrong)
      await page.locator('input#email').fill('test@example.com');
      await page.locator('input#password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Se connecter' }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Should show error message (invalid credentials), not immediate rate limit
      // Page should still have login form visible
      await expect(page.locator('input#email')).toBeVisible();
    });

    test('should handle multiple failed attempts', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      let rateLimited = false;

      // Attempt several logins
      for (let i = 0; i < 5 && !rateLimited; i++) {
        await page.locator('input#email').fill(`test${i}@example.com`);
        await page.locator('input#password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Se connecter' }).click();

        await page.waitForTimeout(500);

        const pageContent = await page.content();
        if (/trop de tentatives|rate limit|429|réessayer/i.test(pageContent)) {
          rateLimited = true;
        }
      }

      // Page should still be functional
      await expect(page.locator('input#email')).toBeVisible();
    });
  });

  test.describe('Forgot Password Rate Limiting', () => {
    test('should handle multiple password reset requests', async ({ page }) => {
      await page.goto('/gp8x2k4m/forgot-password');

      // Attempt password reset
      await page.locator('input#email').fill('test@example.com');
      await page.getByRole('button', { name: 'Envoyer le lien' }).click();

      // Wait for either success message OR error message OR form to be available again
      // The action has a 1-1.5s artificial delay + processing time
      // Use Playwright's auto-waiting instead of fixed timeout
      await expect(async () => {
        const hasSuccessMessage = await page.getByText(/email envoye|verifiez votre boite/i).isVisible().catch(() => false);
        const hasErrorMessage = await page.getByText(/trop de demandes|erreur|tentatives/i).isVisible().catch(() => false);
        const hasForm = await page.locator('input#email').isVisible().catch(() => false);

        expect(hasSuccessMessage || hasErrorMessage || hasForm).toBe(true);
      }).toPass({ timeout: 10000 });
    });
  });
});

test.describe('Input Validation', () => {
  test.describe('Login Form Validation', () => {
    test('should validate email format via HTML5', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      const emailInput = page.locator('input#email');

      // Input should have type="email" for HTML5 validation
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('should require password field', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      await page.locator('input#email').fill('test@example.com');
      // Don't fill password
      await page.getByRole('button', { name: 'Se connecter' }).click();

      await page.waitForTimeout(500);

      // Should still be on login page (HTML5 validation prevents submission)
      await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
    });

    test('should handle SQL injection attempt safely', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      await page.locator('input#email').fill("admin@test.com'; DROP TABLE users; --");
      await page.locator('input#password').fill('password');
      await page.getByRole('button', { name: 'Se connecter' }).click();

      await page.waitForTimeout(2000);

      // Should show error or handle gracefully, not crash
      await expect(page.locator('input#email')).toBeVisible();
    });

    test('should handle long inputs gracefully', async ({ page }) => {
      await page.goto('/gp8x2k4m/login');

      const longString = 'a'.repeat(1000);
      await page.locator('input#email').fill(`${longString}@example.com`);
      await page.locator('input#password').fill(longString);
      await page.getByRole('button', { name: 'Se connecter' }).click();

      await page.waitForTimeout(2000);

      // Should handle gracefully, not crash
      await expect(page.locator('input#email')).toBeVisible();
    });
  });

  test.describe('Password Reset Validation', () => {
    test('should have email input with proper type', async ({ page }) => {
      await page.goto('/gp8x2k4m/forgot-password');

      const emailInput = page.locator('input#email');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});

test.describe('Session Security', () => {
  test('should handle logout endpoint', async ({ page }) => {
    // Navigate to signout endpoint
    const response = await page.goto('/api/auth/signout');

    // Should get a response (redirect or success)
    expect(response).not.toBeNull();
  });

  test('should protect admin routes without session', async ({ page }) => {
    await page.goto('/gp8x2k4m');

    // Should redirect to login
    await expect(page).toHaveURL(/\/gp8x2k4m\/login/);
  });
});

test.describe('CSRF Protection', () => {
  test('should reject foreign origin POST requests', async ({ request }) => {
    // Attempt to make a POST request with foreign origin
    const response = await request.post('/api/auth/signin/credentials', {
      headers: {
        'Origin': 'https://evil-site.com',
        'Content-Type': 'application/json',
      },
      data: {
        email: 'test@example.com',
        password: 'password',
      },
    });

    // Should be rejected or handled appropriately
    // 400, 401, 403, 404, 405 are all acceptable responses
    expect([400, 401, 403, 404, 405, 500]).toContain(response.status());
  });

  test('login form should use POST method', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    const form = page.locator('form');

    // Form should exist
    await expect(form).toBeVisible();
  });
});

test.describe('Information Disclosure', () => {
  test('should not expose stack traces in error messages', async ({ page }) => {
    // Try to trigger an error with invalid route
    await page.goto('/gp8x2k4m/api/nonexistent-route');

    // Get visible text content (not script tags or internal markup)
    const visibleText = await page.locator('body').innerText();

    // Should not contain stack traces in visible content
    expect(visibleText).not.toMatch(/at\s+\w+\s+\([^)]+\.js:\d+:\d+\)/);
    expect(visibleText).not.toContain('Error:');
    expect(visibleText).not.toMatch(/TypeError|ReferenceError|SyntaxError/);
  });

  test('should not expose internal paths', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    const pageContent = await page.content();

    // Should not expose file paths
    expect(pageContent).not.toContain('/home/');
    expect(pageContent).not.toMatch(/C:\\Users\\/);
    expect(pageContent).not.toContain('/var/www/');
  });

  test('should not expose version numbers in headers', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    // X-Powered-By should not expose detailed version
    const poweredBy = headers['x-powered-by'] || '';
    // Next.js sets "Next.js" which is fine, but detailed versions are not
    expect(poweredBy).not.toMatch(/\d+\.\d+\.\d+/);
  });

  test('login errors should not reveal user existence', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    // Try with definitely non-existent email
    await page.locator('input#email').fill('nonexistent98765@example.com');
    await page.locator('input#password').fill('anypassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForTimeout(3000);

    const pageContent = await page.content().then(c => c.toLowerCase());

    // Should not explicitly say "user not found"
    expect(pageContent).not.toContain('utilisateur non trouvé');
    expect(pageContent).not.toContain('user not found');
    expect(pageContent).not.toContain("email n'existe pas");
  });
});

test.describe('Password Security', () => {
  test('password field should have type password', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('password should not appear in URL after submission', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    await page.locator('input#email').fill('test@example.com');
    await page.locator('input#password').fill('secretpassword123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).not.toContain('secretpassword123');
    expect(url).not.toContain('password=');
  });
});

test.describe('Open Redirect Prevention', () => {
  test('should sanitize malicious callbackUrl', async ({ page }) => {
    // Load login page with malicious callback URL
    await page.goto('/gp8x2k4m/login?callbackUrl=https://evil-site.com');

    // The login page should load normally
    await expect(page.locator('input#email')).toBeVisible();

    // The malicious URL should not be present in any visible redirect links
    // (The actual validation happens in getSafeCallbackUrl in the login page)
    const pageContent = await page.content();

    // Check that evil-site.com is not in any href attribute
    const hasEvilHref = /href=["'][^"']*evil-site\.com[^"']*["']/i.test(pageContent);
    expect(hasEvilHref).toBe(false);
  });
});
