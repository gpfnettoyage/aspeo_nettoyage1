import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getCollection } from '@/lib/admin/collections';
import { getEntry, publicUrl, relationOptions } from '@/lib/admin/repository';
import { stateOf } from '@/lib/admin/list-rows';
import { recordToValues, getPath, deepMerge } from '@/lib/admin/values';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';
import { COMPANY } from '@/constants/company';
import AdminShell from '@/components/admin/AdminShell';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : typeof v === 'string' ? v : null);

export default async function EntryPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const def = getCollection(collection);
  if (!def) notFound();
  const isNew = id === 'nouveau';
  const session = await requirePermission(isNew ? 'content:create' : 'content:view');
  const row = isNew ? null : await getEntry(def, id);
  if (!isNew && !row) notFound();

  // Les modifications en attente (brouillon d'un contenu en ligne) sont chargées dans le formulaire.
  const pending = row && def.draft && row.draft && typeof row.draft === 'object' ? (row.draft as Record<string, unknown>) : null;
  const merged = row && pending ? (deepMerge(row, pending) as Record<string, unknown>) : row;
  const relations = await relationOptions();
  const role = session.user.role;
  const title = row ? String(getPath(merged, def.list.title) ?? '') || def.singular : `Nouve${def.gender === 'f' ? 'lle' : 'au'} ${def.singular}`;
  const path = row ? publicUrl(def, merged!) : null;

  return (
    <AdminShell hideHeader>
      <ContentEditor
        key={`${def.key}-${id}`}
        target={{ kind: 'entry', collection: def.key, id: isNew ? null : id, statusMode: def.status, draftMode: def.draft, slugFrom: def.slugFrom }}
        backHref={`${ADMIN_BASE_PATH}/contenus/${def.key}`}
        backLabel={def.label}
        title={title}
        singular={def.singular}
        intro={def.intro}
        groups={def.groups}
        initialValues={recordToValues(def, merged)}
        relations={relations}
        state={row ? stateOf(def, row) : 'new'}
        hasPendingDraft={!!pending}
        publishedAt={iso(row?.publishedAt)}
        updatedAt={iso(row?.updatedAt)}
        previewPath={path && !path.includes('#') ? path : null}
        siteUrl={COMPANY.website}
        can={{ publish: hasPermission(role, 'content:publish'), delete: hasPermission(role, 'content:delete') }}
      />
    </AdminShell>
  );
}
