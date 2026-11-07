import { requireAdmin } from '@/lib/auth';
import { getCategoriesWithCountPaginated } from '@/lib/categories';
import AdminShell from '@/components/admin/AdminShell';
import CategoriesTable from '@/components/admin/CategoriesTable';
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

async function CategoriesList({ page, pageSize }: { page: number; pageSize: number }) {
  const result = await getCategoriesWithCountPaginated({ page, pageSize });

  return (
    <>
      <CategoriesTable categories={result.data} />
      <Pagination
        meta={result.meta}
        pageSizeOptions={[10, 15, 25, 50]}
      />
    </>
  );
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = parseInt(params.pageSize || '', 10) || DEFAULT_PAGE_SIZES.categories;

  return (
    <AdminShell
      title="Catégories"
      description="Gérez les catégories de services"
      actions={
        <Button asChild>
          <Link href="/gp8x2k4m/categories/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Link>
        </Button>
      }
    >
      <Suspense fallback={<TableSkeleton columnCount={4} rowCount={pageSize} />}>
        <CategoriesList page={page} pageSize={pageSize} />
      </Suspense>
    </AdminShell>
  );
}
