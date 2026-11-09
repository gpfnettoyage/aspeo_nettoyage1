import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Vercel Cron Job - GDPR Data Cleanup
 *
 * This endpoint is called by Vercel's cron scheduler to clean up expired data
 * in compliance with GDPR data minimization principle (Art. 5.1.c).
 *
 * Schedule: Daily at 3:00 AM UTC (4:00 or 5:00 AM Paris time depending on DST)
 *
 * Data Retention Policy:
 * - Device verifications: 10 minutes (security codes) - cleaned here
 * - Expired sessions: immediate cleanup
 * - Trusted devices inactive > 1 year: removed (GDPR data minimization)
 * - Audit logs: 90 days (managed by Redis TTL)
 * - Banned IPs: ban duration (managed by Redis TTL)
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for cleanup

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[CRON] Unauthorized cleanup attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    deviceVerifications: 0,
    expiredSessions: 0,
    inactiveTrustedDevices: 0,
  };

  try {
    // 1. Clean up expired device verifications
    const expiredVerifications = await prisma.deviceVerification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    results.deviceVerifications = expiredVerifications.count;

    // 2. Clean up expired sessions
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    results.expiredSessions = expiredSessions.count;

    // 3. Clean up trusted devices inactive for more than 1 year (GDPR data minimization)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const inactiveDevices = await prisma.trustedDevice.deleteMany({
      where: {
        lastUsedAt: { lt: oneYearAgo },
      },
    });
    results.inactiveTrustedDevices = inactiveDevices.count;

    const duration = Date.now() - startTime;



    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      cleaned: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Cleanup failed:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
