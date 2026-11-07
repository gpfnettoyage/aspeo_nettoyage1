import { requireAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import CategoryForm from '@/components/admin/CategoryForm';

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Nouvelle catégorie"
      description="Créer une nouvelle catégorie de services"
    >
      <CategoryForm mode="create" />
    </AdminShell>
  );
}
