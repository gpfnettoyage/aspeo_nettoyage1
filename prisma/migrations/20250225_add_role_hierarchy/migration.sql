-- Migration: Add role hierarchy to existing Role enum
-- This migration adds SUPER_ADMIN, EDITOR, and VIEWER roles to the existing enum

-- Step 1: Add new enum values to the existing Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN' BEFORE 'ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR' AFTER 'ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER' AFTER 'EDITOR';

-- Step 2: Add index on role column for performance
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user"("role");

-- Step 3: Upgrade the first ADMIN to SUPER_ADMIN (in separate transaction - handled by Prisma)
-- Note: This was applied separately due to PostgreSQL enum constraints
