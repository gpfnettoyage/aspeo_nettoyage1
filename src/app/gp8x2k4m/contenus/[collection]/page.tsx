import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getCollection } from '@/lib/admin/collections';
import { listEntries } from '@/lib/admin/repository';
import { toListRows } from '@/lib/admin/list-rows';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';
import AdminShell from '@/components/admin/AdminShell';
import EntryList from '@/components/admin/EntryList';
import { BtnLink, Notice } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = getCollection(collection);
  if (!def) notFound();
  const session = await requirePermission('content:view');
  const role = session.user.role;
  const rows = toListRows(def, await listEntries(def));
  const base = `${ADMIN_BASE_PATH}/contenus/${def.key}`;
  const addLabel = `Ajouter ${def.gender === 'f' ? 'une' : 'un'} ${def.singular}`;

  return (
    <AdminShell title={def.label} actions={hasPermission(role, 'content:create') ? <BtnLink href={`${base}/nouveau`} variant="primary"><Plus className="h-4 w-4" />{addLabel}</BtnLink> : undefined}>
      {def.intro && <div className="mb-5"><Notice>{def.intro}</Notice></div>}
      <EntryList collection={def.key} singular={def.singular} gender={def.gender} basePath={base} columns={def.list.columns.map((c) => c.label)} rows={rows}
        statusMode={def.status} hasImage={!!def.list.image} filter={def.list.filter}
        can={{ publish: hasPermission(role, 'content:publish'), delete: hasPermission(role, 'content:delete') }} />
    </AdminShell>
  );
}
