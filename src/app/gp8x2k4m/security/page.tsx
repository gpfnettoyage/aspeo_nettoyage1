import { requireAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import SecurityDashboard from '@/components/admin/SecurityDashboard';

export default async function SecurityPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Sécurité"
      description="Surveillance des tentatives de connexion et gestion des IPs bannies"
    >
      <SecurityDashboard />
    </AdminShell>
  );
}
