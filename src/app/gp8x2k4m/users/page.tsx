import { requirePermission } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import UsersTable from '@/components/admin/UsersTable';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import TableSkeleton from '@/components/admin/TableSkeleton';
import Pagination from '@/components/admin/Pagination';
import { getUsersPaginatedAction } from '@/actions/users/users.actions';
import { Suspense } from 'react';
import { DEFAULT_PAGE_SIZES } from '@/types/pagination';

interface PageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

async function UsersList({
  currentUserId,
  currentUserRole,
  page,
  pageSize,
}: {
  currentUserId: string;
  currentUserRole: string;
  page: number;
  pageSize: number;
}) {
  const result = await getUsersPaginatedAction({ page, pageSize });

  return (
    <>
      <UsersTable
        users={result.data}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER'}
      />
      <Pagination
        meta={result.meta}
        pageSizeOptions={[10, 15, 25, 50]}
      />
    </>
  );
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requirePermission('users:view');
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = parseInt(params.pageSize || '', 10) || DEFAULT_PAGE_SIZES.users;

  return (
    <AdminShell
      title="Utilisateurs"
      description="Gerez les utilisateurs et leurs roles d'acces au back-office"
      actions={<CreateUserDialog currentUserRole={session.user.role} />}
    >
      <Suspense fallback={<TableSkeleton columnCount={5} rowCount={pageSize} />}>
        <UsersList
          currentUserId={session.user.id}
          currentUserRole={session.user.role}
          page={page}
          pageSize={pageSize}
        />
      </Suspense>
    </AdminShell>
  );
}
