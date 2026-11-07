/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * Used here to validate environment variables at startup.
 */

export async function register() {
  // Validate environment variables at server startup
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/lib/env');
  }
}
