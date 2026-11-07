import { getSession } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import AdminSidebar from './AdminSidebar';
import { cookies } from 'next/headers';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default async function AdminShell({
  children,
  title,
  description,
  actions,
  hideHeader = false,
}: AdminShellProps) {
  const session = await getSession();

  // SECURITY: Defense-in-depth - verify session exists and user can access admin
  // Parent pages should also call requireAdmin() but this provides an extra layer
  if (!session || !canAccessAdmin(session.user.role)) {
    redirect('/gp8x2k4m/login');
  }

  // Get sidebar state from cookie
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar userRole={session?.user.role} />
      <SidebarInset className="pt-14 sm:pt-16">
        {/* Header with trigger and title - sticky for better UX */}
        {!hideHeader && (
          <header className="sticky top-14 sm:top-16 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {title && (
              <div className="flex-1">
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
            )}
            {actions && <div className="flex gap-3">{actions}</div>}
          </header>
        )}

        {/* Minimal header with just sidebar trigger when hideHeader is true */}
        {hideHeader && (
          <header className="sticky top-14 sm:top-16 z-10 flex h-10 shrink-0 items-center gap-2 bg-background px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 sm:px-6 lg:px-8">
          {!hideHeader && description && (
            <p className="text-sm text-muted-foreground mb-6">{description}</p>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
