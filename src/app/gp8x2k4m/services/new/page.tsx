import { requireAdmin } from '@/lib/auth';
import { getCategoryOptions } from '@/lib/categories';
import AdminShell from '@/components/admin/AdminShell';
import ServiceEditor from '@/components/admin/services/ServiceEditor';

export default async function NewServicePage() {
  await requireAdmin();

  const categories = await getCategoryOptions();

  return (
    <AdminShell
      title="Nouveau service"
      description="Créer un nouveau service"
      hideHeader
    >
      <ServiceEditor mode="create" categories={categories} />
    </AdminShell>
  );
}
