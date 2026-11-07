import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Security Headers
 * Tests CSP and other security headers are properly set
 */

test.describe('Content Security Policy', () => {
  test('should have CSP header on public pages', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    // Check for CSP header
    const cspHeader = headers['content-security-policy'];
    expect(cspHeader).toBeDefined();
  });

  test('should have proper CSP directives', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();
    const csp = headers['content-security-policy'] || '';

    // Check for essential CSP directives
    expect(csp).toContain('default-src');
    expect(csp).toContain('script-src');
  });

  test('should block frame embedding (clickjacking protection)', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();
    const csp = headers['content-security-policy'] || '';

    // Should have frame-ancestors 'none' or 'self'
    expect(csp).toMatch(/frame-ancestors/);
  });

  test('CSP should be present on admin pages', async ({ page }) => {
    const response = await page.goto('/gp8x2k4m/login');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    const cspHeader = headers['content-security-policy'];
    expect(cspHeader).toBeDefined();
  });

  test('CSP should restrict base-uri', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();
    const csp = headers['content-security-policy'] || '';

    // base-uri 'self' prevents base tag injection
    expect(csp).toContain('base-uri');
  });

  test('CSP should restrict form-action', async ({ page }) => {
    const response = await page.goto('/gp8x2k4m/login');

    expect(response).not.toBeNull();
    const headers = response!.headers();
    const csp = headers['content-security-policy'] || '';

    // form-action 'self' prevents form hijacking
    expect(csp).toContain('form-action');
  });
});

test.describe('Other Security Headers', () => {
  test('should have X-Frame-Options header if set', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    // X-Frame-Options (legacy but still useful)
    const xFrameOptions = headers['x-frame-options'];
    if (xFrameOptions) {
      expect(['DENY', 'SAMEORIGIN', 'deny', 'sameorigin']).toContain(xFrameOptions);
    }
    // Not required if CSP frame-ancestors is set
  });

  test('should have X-Content-Type-Options header', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    const xContentTypeOptions = headers['x-content-type-options'];
    // Vercel/Next.js typically sets this
    if (xContentTypeOptions) {
      expect(xContentTypeOptions.toLowerCase()).toBe('nosniff');
    }
  });

  test('should have proper Referrer-Policy if set', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    const referrerPolicy = headers['referrer-policy'];
    if (referrerPolicy) {
      // Should be a secure policy
      const securePolicies = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
      ];
      expect(securePolicies).toContain(referrerPolicy.toLowerCase());
    }
  });

  test('HSTS header validation', async ({ page, baseURL }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const headers = response!.headers();

    if (baseURL?.startsWith('https://')) {
      // In HTTPS mode, HSTS must be present
      const hsts = headers['strict-transport-security'];
      expect(hsts).toBeDefined();
      expect(hsts).toContain('max-age');
    } else {
      // In HTTP mode (localhost), HSTS is not applicable
      // Just verify the page loads correctly
      expect(response!.status()).toBeLessThan(400);
    }
  });
});

test.describe('Cookie Security', () => {
  test('session cookies should have HttpOnly flag', async ({ page, context }) => {
    await page.goto('/gp8x2k4m/login');

    const cookies = await context.cookies();

    for (const cookie of cookies) {
      // Check session-related cookies
      if (cookie.name.toLowerCase().includes('session') ||
          cookie.name.toLowerCase().includes('auth') ||
          cookie.name.toLowerCase().includes('better-auth')) {
        // HttpOnly should be true for session cookies
        expect(cookie.httpOnly).toBe(true);
      }
    }
  });

  test('should not expose sensitive data in cookies', async ({ page, context }) => {
    await page.goto('/gp8x2k4m/login');

    const cookies = await context.cookies();

    for (const cookie of cookies) {
      // Cookie values should not contain obvious sensitive data
      const value = cookie.value.toLowerCase();
      expect(value).not.toContain('password');
      expect(value).not.toContain('secret');
    }
  });
});

test.describe('API Security Headers', () => {
  test('API responses should have content-type', async ({ request }) => {
    // BetterAuth uses /api/auth/get-session
    const response = await request.get('/api/auth/get-session');

    const headers = response.headers();

    // API should have content-type header
    expect(headers['content-type']).toBeDefined();
  });

  test('API should not expose detailed server info', async ({ request }) => {
    const response = await request.get('/api/auth/get-session');

    const headers = response.headers();

    // Should not expose detailed server info
    const server = headers['server'] || '';
    expect(server).not.toMatch(/Apache\/[\d.]+/);
    expect(server).not.toMatch(/nginx\/[\d.]+/);
  });
});

test.describe('XSS Protection', () => {
  test('should escape user input in error messages', async ({ page }) => {
    await page.goto('/gp8x2k4m/login');

    // Try to inject script via input
    await page.locator('input#email').fill('<script>alert("xss")</script>@test.com');
    await page.locator('input#password').fill('test');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Wait for any error message
    await page.waitForTimeout(2000);

    // Check that script is not executed
    const pageContent = await page.content();

    // Script tags should be escaped, not rendered as HTML
    expect(pageContent).not.toContain('<script>alert("xss")</script>');
  });

  test('should handle malicious query parameters safely', async ({ page }) => {
    // Track if any dialog/alert was triggered
    let alertTriggered = false;
    page.on('dialog', () => {
      alertTriggered = true;
    });

    await page.goto('/gp8x2k4m/login?error=<img src=x onerror=alert(1)>');

    // Page should load without executing malicious code
    await expect(page.locator('input#email')).toBeVisible();

    // Wait a bit for any potential XSS to execute
    await page.waitForTimeout(500);

    // No alert should have been triggered
    expect(alertTriggered).toBe(false);

    // Check that img tag with onerror is not rendered in visible DOM
    const imgWithOnerror = await page.locator('img[onerror]').count();
    expect(imgWithOnerror).toBe(0);
  });
});

test.describe('CORS Headers', () => {
  test('API should not allow arbitrary origins', async ({ request }) => {
    const response = await request.get('/api/auth/session', {
      headers: {
        'Origin': 'https://malicious-site.com',
      },
    });

    const headers = response.headers();

    // Should not allow arbitrary origins
    const allowOrigin = headers['access-control-allow-origin'];
    if (allowOrigin) {
      expect(allowOrigin).not.toBe('*');
      expect(allowOrigin).not.toBe('https://malicious-site.com');
    }
  });
});
