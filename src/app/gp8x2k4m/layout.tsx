export const metadata = {
  title: 'Administration | ASPEO',
  description: 'Panneau d\'administration ASPEO',
  robots: 'noindex, nofollow',
};

/**
 * Admin Layout
 *
 * SECURITY ARCHITECTURE:
 * ----------------------
 * 1. proxy.ts: Optimistic session cookie check (edge, fast)
 *    - Redirects to /gp8x2k4m/login if no cookie present
 *    - Does NOT verify session validity or user role
 *
 * 2. requireAdmin() / requirePermission(): Server-side verification
 *    - Called in each page/action that needs protection
 *    - Verifies session is valid AND user has correct role/permission
 *    - This is the REAL security check (defense in depth)
 *
 * 3. This layout: Provides shared UI wrapper only
 *    - Cannot enforce auth (login page needs to be accessible)
 *
 * WHY NOT CENTRALIZE AUTH HERE?
 * - /gp8x2k4m/login must be accessible without auth
 * - Layout applies to ALL child routes including login
 * - Moving login outside /gp8x2k4m would break URL structure
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
