import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { getPageDefinition } from '@/lib/site/pages-registry';
import { PAGE_CONTENT_MODELS } from '@/lib/site/page-content';
import { pageGroups, pageToValues } from '@/lib/admin/page-forms';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';
import { COMPANY } from '@/constants/company';
import AdminShell from '@/components/admin/AdminShell';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';

export default async function PageEditor({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const def = getPageDefinition(key);
  const model = PAGE_CONTENT_MODELS[key];
  if (!def || !model) notFound();
  const session = await requirePermission('content:view');
  const row = await prisma.page.findUnique({ where: { key } });
  const pending = row?.draft && typeof row.draft === 'object' ? (row.draft as Record<string, unknown>) : null;
  const source = { ...(row ?? {}), ...(pending ?? {}) } as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const role = session.user.role;

  return (
    <AdminShell hideHeader>
      <ContentEditor
        key={key}
        target={{ kind: 'page', key }}
        backHref={`${ADMIN_BASE_PATH}/pages`}
        backLabel="Pages"
        title={def.title}
        singular="page"
        intro={key === 'blocs-communs' ? 'Ces blocs sont repris sur plusieurs pages du site : une modification s’applique partout.' : 'Chaque section correspond à un bloc de la page. Modifiez les textes et les images, puis cliquez sur « Publier ». Un champ vidé reprend le texte d’origine.'}
        groups={pageGroups(model)}
        initialValues={pageToValues(model, source.content)}
        state="live"
        hasPendingDraft={!!pending}
        publishedAt={row?.publishedAt?.toISOString() ?? null}
        updatedAt={row?.updatedAt?.toISOString() ?? null}
        previewPath={key === 'blocs-communs' ? '/' : def.path}
        siteUrl={COMPANY.website}
        can={{ publish: hasPermission(role, 'content:publish'), delete: false }}
        pageSeo={key === 'blocs-communs' ? undefined : { seoTitle: str(source.seoTitle), seoDesc: str(source.seoDesc), ogImage: str(source.ogImage), noindex: source.noindex === true, defaultTitle: def.seoTitle, defaultDesc: def.seoDesc }}
      />
    </AdminShell>
  );
}
