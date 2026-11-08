import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getSettings } from '@/lib/site/settings';
import type { SettingKey } from '@/lib/site/settings-defaults';
import { SETTINGS_FORMS, settingsToValues } from '@/lib/admin/settings-forms';
import AdminShell from '@/components/admin/AdminShell';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

const PAGES: Record<string, { title: string; description: string; keys: SettingKey[] }> = {
  identity: { title: 'Logo & identité', description: 'Logos, icône et image de partage du site.', keys: ['identity'] },
  company: { title: 'Informations de l’entreprise', description: 'Coordonnées, horaires, réseaux et mentions légales : saisis une seule fois, repris partout sur le site.', keys: ['company'] },
  navigation: { title: 'Menu & pied de page', description: 'Renommez, réordonnez ou masquez les liens de navigation.', keys: ['navigation'] },
  stats: { title: 'Chiffres & notifications', description: 'Compteurs affichés sur le site et destinataires des e-mails des formulaires.', keys: ['stats', 'notifications'] },
};

export default async function SettingsPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const page = PAGES[key];
  if (!page) notFound();
  const session = await requirePermission('settings:view');
  const settings = await getSettings();
  return (
    <AdminShell title={page.title}>
      <p className="m-0 mb-5 text-[14px] text-zinc-500">{page.description}</p>
      <SettingsForm canEdit={hasPermission(session.user.role, 'settings:update')}
        sections={page.keys.map((k) => ({ key: k, groups: SETTINGS_FORMS[k], values: settingsToValues(k, settings[k] as unknown as Record<string, unknown>) }))} />
    </AdminShell>
  );
}
