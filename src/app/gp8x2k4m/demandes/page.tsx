import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { quoteRows } from '@/lib/admin/leads';
import AdminShell from '@/components/admin/AdminShell';
import LeadsBoard from '@/components/admin/LeadsBoard';

export const dynamic = 'force-dynamic';

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await requirePermission('leads:view');
  const { id } = await searchParams;
  const rows = await prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  const role = session.user.role;
  return (
    <AdminShell title="Demandes de devis">
      <p className="m-0 mb-5 text-[14px] text-gray-500">Toutes les demandes envoyées depuis les formulaires du site, avec leurs photos.</p>
      <LeadsBoard kind="devis" rows={quoteRows(rows)} columns={{ need: 'Besoin', frequency: 'Fréquence' }} openId={id}
        can={{ update: hasPermission(role, 'leads:update'), delete: hasPermission(role, 'leads:delete') }} />
    </AdminShell>
  );
}
