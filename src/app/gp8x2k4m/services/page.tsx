import { requireAdmin } from '@/lib/auth';
import { getAllServicesPaginated } from '@/lib/services';
import AdminShell from '@/components/admin/AdminShell';
import ServicesTable from '@/components/admin/ServicesTable';
import TableSkeleton from '@/components/admin/TableSkeleton';
import Pagination from '@/components/admin/Pagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { DEFAULT_PAGE_SIZES } from '@/types/pagination';

interface PageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

async function ServicesList({ page, pageSize }: { page: number; pageSize: number }) {
  const result = await getAllServicesPaginated({ page, pageSize });

  return (
    <>
      <ServicesTable services={result.data} />
      <Pagination
        meta={result.meta}
        pageSizeOptions={[10, 15, 25, 50]}
      />
    </>
  );
}

export default async function AdminServicesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = parseInt(params.pageSize || '', 10) || DEFAULT_PAGE_SIZES.services;

  return (
    <AdminShell
      title="Services"
      description="Gérez les services de nettoyage"
      actions={
        <Button asChild>
          <Link href="/gp8x2k4m/services/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau service
          </Link>
        </Button>
      }
    >
      <Suspense fallback={<TableSkeleton columnCount={6} rowCount={pageSize} />}>
        <ServicesList page={page} pageSize={pageSize} />
      </Suspense>
    </AdminShell>
  );
}
