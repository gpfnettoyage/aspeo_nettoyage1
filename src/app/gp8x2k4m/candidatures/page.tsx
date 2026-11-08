import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { applicationRows } from '@/lib/admin/leads';
import AdminShell from '@/components/admin/AdminShell';
import LeadsBoard from '@/components/admin/LeadsBoard';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await requirePermission('leads:view');
  const { id } = await searchParams;
  const rows = await prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' }, take: 500, include: { job: { select: { title: true } } } });
  const role = session.user.role;
  return (
    <AdminShell title="Candidatures">
      <p className="m-0 mb-5 text-[14px] text-gray-500">Candidatures reçues depuis la page « Nous rejoindre ». Les CV sont stockés de façon privée.</p>
      <LeadsBoard kind="candidature" rows={applicationRows(rows)} columns={{ need: 'Poste' }} openId={id}
        can={{ update: hasPermission(role, 'leads:update'), delete: hasPermission(role, 'leads:delete') }} />
    </AdminShell>
  );
}
