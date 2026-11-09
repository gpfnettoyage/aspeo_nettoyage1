import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { listMediaAction } from '@/actions/admin/media.actions';
import AdminShell from '@/components/admin/AdminShell';
import MediaLibrary from '@/components/admin/MediaLibrary';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const session = await requirePermission('media:view');
  const items = await listMediaAction('', 1000);
  const role = session.user.role;
  return (
    <AdminShell title="Bibliothèque d’images">
      <p className="m-0 mb-5 text-[14px] text-gray-500">Toutes les images du site. Ajoutez un texte alternatif à chacune : c’est utile pour Google et pour l’accessibilité.</p>
      <MediaLibrary items={items} can={{ upload: hasPermission(role, 'media:upload'), delete: hasPermission(role, 'media:delete') }} />
    </AdminShell>
  );
}
