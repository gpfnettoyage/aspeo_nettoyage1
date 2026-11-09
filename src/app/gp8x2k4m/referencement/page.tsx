import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/site/settings';
import { seoAudit, titleLevel, descLevel } from '@/lib/admin/seo-audit';
import { SETTINGS_FORMS, settingsToValues } from '@/lib/admin/settings-forms';
import AdminShell from '@/components/admin/AdminShell';
import SeoTable from '@/components/admin/SeoTable';
import SettingsForm from '@/components/admin/SettingsForm';
import { BtnLink } from '@/components/admin/ui';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';

export const dynamic = 'force-dynamic';

export default async function SeoPage() {
  const session = await requirePermission('settings:view');
  const [rows, settings, missingAlt] = await Promise.all([seoAudit(), getSettings(), prisma.media.count({ where: { OR: [{ alt: null }, { alt: '' }] } })]);
  const table = rows.map((r) => ({ ...r, titleLevel: titleLevel(r.title), descLevel: descLevel(r.desc) }));
  const ok = table.filter((r) => r.titleLevel === 'ok' && r.descLevel === 'ok').length;
  const long = table.filter((r) => r.titleLevel === 'long' || r.descLevel === 'long').length;
  const missing = table.filter((r) => r.titleLevel === 'missing' || r.descLevel === 'missing').length;
  const card = (label: string, n: number, cls: string) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="m-0 text-[13px] text-gray-500">{label}</p><p className={`m-0 mt-1 text-[26px] font-bold ${cls}`}>{n}</p></div>
  );
  return (
    <AdminShell title="Référencement (SEO)" actions={<BtnLink href={`${ADMIN_BASE_PATH}/redirections`}>Redirections</BtnLink>}>
      <p className="m-0 mb-5 text-[14px] text-gray-500">Titre et description affichés dans Google pour chaque page publiée. Un titre ne doit pas dépasser 60 caractères, une description 160. « Automatique » : généré à partir du contenu, modifiable dans l’onglet « Référencement Google » de l’éditeur.</p>
      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-4">
        {card('Pages correctes', ok, 'text-[#15803d]')}{card('Trop longues', long, 'text-[#c2410c]')}{card('Informations manquantes', missing, 'text-[#b91c1c]')}{card('Images sans texte alternatif', missingAlt, 'text-[#0a0a0a]')}
      </div>
      <SeoTable rows={table} />
      <div className="mt-8">
        <SettingsForm canEdit={hasPermission(session.user.role, 'settings:update')} sections={[{ key: 'seo', groups: SETTINGS_FORMS.seo, values: settingsToValues('seo', settings.seo as unknown as Record<string, unknown>) }]} />
        <p className="m-0 mt-3 text-[13px] text-gray-500">La page de recherche du site n’est jamais indexée. Le plan du site (/sitemap.xml) est mis à jour automatiquement à chaque publication et ne contient que les contenus publiés.</p>
      </div>
    </AdminShell>
  );
}
