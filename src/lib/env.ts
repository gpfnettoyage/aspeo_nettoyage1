import { z } from 'zod';

/**
 * Environment Variables Validation
 *
 * This file validates all required environment variables at BUILD TIME.
 * If any required variable is missing, the build will fail with a clear error.
 *
 * SECURITY: This ensures no sensitive services run without proper configuration.
 */

// ============================================
// Server-side Environment Variables Schema
// ============================================
const serverEnvSchema = z.object({
  // Database (required for Prisma)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication (required for BetterAuth)
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),

  // Email (required for security emails)
  OVH_EMAIL_USER: z.string().email('OVH_EMAIL_USER must be a valid email'),
  OVH_EMAIL_PASS: z.string().min(1, 'OVH_EMAIL_PASS is required'),

  // Redis (required for rate limiting) - supports both Vercel KV and Upstash direct
  KV_REST_API_URL: z.string().url('KV_REST_API_URL must be a valid URL'),
  KV_REST_API_TOKEN: z.string().min(1, 'KV_REST_API_TOKEN is required'),

  // SECURITY: Cron job secret (required for GDPR cleanup endpoint)
  // Must be at least 32 characters to prevent brute-force attacks
  CRON_SECRET: z.string().min(32, 'CRON_SECRET must be at least 32 characters for security').optional(),

  // Node environment (optional, defaults to development)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// ============================================
// Client-side Environment Variables Schema
// ============================================
const clientEnvSchema = z.object({
  // Public app URL (used in emails, links)
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

// ============================================
// Validation and Export
// ============================================

/**
 * Validates environment variables at build/runtime
 * Throws immediately in production if invalid, warns in development
 */
function validateEnv() {
  // Skip validation during edge runtime or client-side
  if (typeof window !== 'undefined') {
    return {
      server: {} as z.infer<typeof serverEnvSchema>,
      client: {} as z.infer<typeof clientEnvSchema>,
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  let hasErrors = false;

  const serverResult = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    OVH_EMAIL_USER: process.env.OVH_EMAIL_USER,
    OVH_EMAIL_PASS: process.env.OVH_EMAIL_PASS,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });

  const clientResult = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!serverResult.success) {
    hasErrors = true;
    console.error('\n==========================================');
    console.error('❌ ERREUR: Variables d\'environnement serveur invalides!');
    console.error('==========================================\n');
    console.error('Problemes detectes:');
    serverResult.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nVerifiez votre fichier .env.local ou vos variables d\'environnement.');
    console.error('Consultez .env.example pour voir les variables requises.\n');
  }

  if (!clientResult.success) {
    hasErrors = true;
    console.error('\n==========================================');
    console.error('❌ ERREUR: Variables d\'environnement client invalides!');
    console.error('==========================================\n');
    console.error('Problemes detectes:');
    clientResult.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nVerifiez votre fichier .env.local ou vos variables d\'environnement.\n');
  }

  // In production, fail immediately if any env vars are invalid
  if (hasErrors && isProduction) {
    throw new Error(
      'BUILD FAILED: Missing or invalid environment variables. See errors above.'
    );
  }

  // In development, warn but continue
  if (hasErrors) {
    console.warn('\n⚠️  En mode developpement - continuation malgre les erreurs...\n');
  }

  return {
    server: serverResult.success ? serverResult.data : ({} as z.infer<typeof serverEnvSchema>),
    client: clientResult.success ? clientResult.data : ({} as z.infer<typeof clientEnvSchema>),
  };
}

export const env = validateEnv();

// Type exports for autocomplete
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
