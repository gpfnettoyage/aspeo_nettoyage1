/**
 * Seed script: Create initial SUPER_ADMIN user (BetterAuth)
 *
 * This script creates the first super administrator for the application.
 * It is idempotent - running it multiple times will skip if user exists.
 *
 * IMPORTANT: The first user MUST be a SUPER_ADMIN to be able to manage other users.
 *
 * Usage:
 * npx tsx scripts/seed-admin.ts
 *
 * Or with custom email/password:
 * ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword npx tsx scripts/seed-admin.ts
 *
 * Role Hierarchy:
 * - SUPER_ADMIN: Full access + user management
 * - ADMIN: Content + security (no user management)
 * - EDITOR: Create/update content (no delete, no security)
 * - VIEWER: Read-only dashboard
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

// Setup Prisma with pg adapter (same as lib/prisma.ts)
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  // SECURITY: Require environment variables - no hardcoded defaults
  if (!email || !password) {
    console.error('\n❌ ERREUR: Variables d\'environnement manquantes!\n');
    console.error('Les variables suivantes sont OBLIGATOIRES:');
    console.error('  - ADMIN_EMAIL: Email du compte super admin');
    console.error('  - ADMIN_PASSWORD: Mot de passe (min 8 caracteres)\n');
    console.error('Exemple:');
    console.error('  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=MonMotDePasse123! npx tsx scripts/seed-admin.ts\n');
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('\n❌ ERREUR: Mot de passe trop court (minimum 8 caracteres)\n');
    process.exit(1);
  }

  console.log('Seeding SUPER_ADMIN user (BetterAuth schema)...\n');
  console.log('Role: SUPER_ADMIN (full access + user management)\n');

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`⏭️  User already exists: ${email}`);
    console.log(`   Current role: ${existingUser.role}`);

    // Upgrade to SUPER_ADMIN if currently ADMIN (migration path)
    if (existingUser.role === 'ADMIN') {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'SUPER_ADMIN' },
      });
      console.log('⬆️  Upgraded role from ADMIN to SUPER_ADMIN');
    }

    // Check if account exists
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: existingUser.id,
        providerId: 'credential',
      },
    });

    if (!existingAccount) {
      // Create account entry with password
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          accountId: existingUser.id,
          providerId: 'credential',
          password: hashedPassword,
        },
      });
      console.log('✅ Created missing account entry.');
    }

    console.log('Skipping user creation.\n');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create super admin user
  // NOTE: emailVerified is set to TRUE because users are ONLY created via seed/DB
  // (no self-registration, no user creation UI). This is intentional for security:
  // - No email verification flow needed since admins create users manually
  // - Users created this way are trusted by default
  // - The login flow still enforces emailVerified check for admin access
  const user = await prisma.user.create({
    data: {
      email,
      emailVerified: true,
      role: 'SUPER_ADMIN',
    },
  });

  // Create account entry with password (BetterAuth stores passwords in account table)
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: hashedPassword,
    },
  });

  console.log('✅ SUPER_ADMIN user created successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: SUPER_ADMIN`);
  console.log(`   ID: ${user.id}`);
  console.log('\n⚠️  IMPORTANT: Change this password after first login!');
  console.log('📝 This user can manage all other users and their roles.\n');
}

async function main() {
  try {
    await seedAdmin();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
