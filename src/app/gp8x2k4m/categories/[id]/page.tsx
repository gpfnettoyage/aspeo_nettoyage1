import { requireAdmin } from '@/lib/auth';
import { getCategoryById } from '@/lib/categories';
import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import CategoryForm from '@/components/admin/CategoryForm';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await requireAdmin();

  const { id } = await params;

  // Validate UUID format to prevent injection
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <AdminShell
      title="Modifier la catégorie"
      description={`Modification de "${category.name}"`}
    >
      <CategoryForm category={category} mode="edit" />
    </AdminShell>
  );
}
