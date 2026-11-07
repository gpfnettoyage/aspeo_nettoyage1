import { requireAdmin } from '@/lib/auth';
import { getServiceById } from '@/lib/services';
import { getCategoryOptions } from '@/lib/categories';
import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ServiceEditor from '@/components/admin/services/ServiceEditor';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  await requireAdmin();

  const { id } = await params;

  // Validate UUID format to prevent injection
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const [service, categories] = await Promise.all([
    getServiceById(id),
    getCategoryOptions(),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <AdminShell
      title="Modifier le service"
      description={service.title}
      hideHeader
    >
      <ServiceEditor service={service} mode="edit" categories={categories} />
    </AdminShell>
  );
}
