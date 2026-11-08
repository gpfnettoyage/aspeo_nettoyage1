import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getSettings } from '@/lib/site/settings';
import type { SettingKey } from '@/lib/site/settings-defaults';
import { SETTINGS_FORMS, settingsToValues } from '@/lib/admin/settings-forms';
import AdminShell from '@/components/admin/AdminShell';
import SettingsForm from '@/components/admin/SettingsForm';
import NavigationEditor from '@/components/admin/NavigationEditor';
import { PAGE_DEFINITIONS } from '@/lib/site/pages-registry';

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
  const canEdit = hasPermission(session.user.role, 'settings:update');
  if (key === 'navigation') {
    const { company, identity } = settings;
    // Pages proposées dans les listes de liens (pages fixes du site, hors pages techniques).
    const options = [...PAGE_DEFINITIONS.filter((p) => p.key !== 'blocs-communs' && p.key !== 'recherche').map((p) => ({ label: p.title, href: p.path })), { label: 'Réalisations', href: '/realisations' }]
      .filter((o, i, all) => all.findIndex((x) => x.href === o.href) === i);
    return (
      <AdminShell title={page.title} description={page.description}>
        <NavigationEditor initial={settings.navigation} options={options} canEdit={canEdit}
          preview={{ logo: identity.logo, logoWhite: identity.logoWhite, phone: company.phone, email: company.email, address: `${company.street}, ${company.postalCode} ${company.city}`,
            hours: company.hours.map((h) => ({ label: h.days, value: h.value })), socials: [company.facebook && 'Facebook', company.instagram && 'Instagram', company.linkedin && 'LinkedIn'].filter(Boolean) as string[] }} />
      </AdminShell>
    );
  }
  return (
    <AdminShell title={page.title} description={page.description}>
      <SettingsForm canEdit={canEdit}
        sections={page.keys.map((k) => ({ key: k, groups: SETTINGS_FORMS[k], values: settingsToValues(k, settings[k] as unknown as Record<string, unknown>) }))} />
    </AdminShell>
  );
}
