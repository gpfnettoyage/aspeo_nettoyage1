import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import RedirectsManager from '@/components/admin/RedirectsManager';

export const dynamic = 'force-dynamic';

export default async function RedirectsPage() {
  const session = await requirePermission('settings:view');
  const rows = await prisma.redirect.findMany({ orderBy: [{ updatedAt: 'desc' }] });
  return (
    <AdminShell title="Redirections">
      <p className="m-0 mb-5 text-[14px] text-gray-500">Les anciennes adresses du site sont redirigées vers les nouvelles pour conserver le référencement. Les redirections sont créées automatiquement quand l’adresse d’un contenu publié change ou quand il est supprimé. Une page publiée reste toujours prioritaire sur une redirection.</p>
      <RedirectsManager canEdit={hasPermission(session.user.role, 'redirects:manage')}
        rows={rows.map((r) => ({ id: r.id, source: r.source, destination: r.destination, permanent: r.permanent, enabled: r.enabled, hits: r.hits, note: r.note ?? '', updatedAt: r.updatedAt.toISOString() }))} />
    </AdminShell>
  );
}
