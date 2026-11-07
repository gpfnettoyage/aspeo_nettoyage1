import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { getSession, auth } from '@/lib/auth';
import { ADMIN_BASE_PATH, COOKIE_PREFIX } from '@/lib/constants/admin';

/**
 * Login Layout - Server-side session validation
 *
 * Handles the edge case where a session cookie exists but the database session
 * has been deleted (e.g., admin revoked session, manual DB cleanup).
 *
 * Flow:
 * 1. Check if session is valid in database
 * 2. If valid → redirect to dashboard (already authenticated)
 * 3. If cookie exists but session invalid → clear cookies and show login
 * 4. If no cookie → show login normally
 */
export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get actual session from database (not just cookie check)
  const session = await getSession();

  if (session) {
    // User has valid session, redirect to dashboard
    redirect(ADMIN_BASE_PATH);
  }

  // Check if cookie exists but session is invalid (orphan cookie)
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie');

  // Parse cookies to check for session cookie
  const hasSessionCookie = cookieHeader?.includes(`${COOKIE_PREFIX}.session_token`) ||
                           cookieHeader?.includes(`${COOKIE_PREFIX}_session_token`);

  if (hasSessionCookie) {
    // Cookie exists but session is invalid - clear the orphan cookie
    // Use BetterAuth's signOut to properly clear all auth cookies
    try {
      await auth.api.signOut({ headers: headersList });
    } catch {
      // If signOut fails, manually clear cookies
      const cookieStore = await cookies();

      // Clear all possible session cookie variations
      const cookieNames = [
        `${COOKIE_PREFIX}.session_token`,
        `${COOKIE_PREFIX}_session_token`,
        `${COOKIE_PREFIX}.session`,
        `${COOKIE_PREFIX}_session`,
      ];

      for (const name of cookieNames) {
        try {
          cookieStore.delete(name);
        } catch {
          // Cookie might not exist, ignore
        }
      }
    }
  }

  return <>{children}</>;
}
