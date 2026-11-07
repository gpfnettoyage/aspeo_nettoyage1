import SiteHeader from '@/components/site/layout/SiteHeader';
import SiteFooter from '@/components/site/layout/SiteFooter';
import PreviewBanner from '@/components/site/layout/PreviewBanner';
import CookieConsent from '@/components/common/CookieConsent';
import type { HeaderData, MenuGroup } from '@/components/site/layout/header-types';
import { getArticles, getCatalog } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { isPreview } from '@/lib/site/preview';
import type { CategoryWithServices } from '@/lib/site/types';

// Les pages publiques sont régénérées au plus tard toutes les heures, et immédiatement
// après une modification enregistrée dans l'administration (cf. lib/site/cache.ts).
export const revalidate = 3600;

const PROMO_IMAGE =
  'https://gerrrw8pnhgmo9jz.public.blob.vercel-storage.com/services/nettoyage-de-bureaux-sieges-sociaux/equipe-aspeo-nettoyage-tertiaire-stfoylargentiere-1774252402514-924eee13.webp';

/** Les catégories marquées « colonne séparée » (par défaut : Services annexes) forment la colonne « Autres services ». */
const isSeparateColumn = (c: CategoryWithServices) => (typeof c.content.separateColumn === 'boolean' ? c.content.separateColumn : c.slug === 'services-annexes');

function toGroup(c: CategoryWithServices, limit: number): MenuGroup {
  const all = c.services.map((s) => ({ title: s.title, short: s.short, href: s.href }));
  return { label: c.name, href: c.href, items: all.slice(0, limit), allItems: all };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, catalog, articles, preview] = await Promise.all([getSettings(), getCatalog(), getArticles(), isPreview()]);
  const columns = catalog.categories.filter((c) => !isSeparateColumn(c));
  const others = catalog.categories.find(isSeparateColumn) ?? null;

  const header: HeaderData = {
    logo: settings.identity.logo,
    phone: settings.company.phone,
    phoneIntl: settings.company.phoneIntl,
    ctaLabel: settings.navigation.ctaLabel,
    topbar: settings.navigation.topbar.filter((l) => l.visible),
    poles: [
      { key: 'professionnel', label: 'Nettoyage Professionnel', groups: columns.filter((c) => c.pole === 'professionnel').map((c) => toGroup(c, 3)) },
      { key: 'specialise', label: 'Interventions Spécialisées', groups: columns.filter((c) => c.pole === 'specialise').map((c) => toGroup(c, 3)) },
    ].filter((p) => p.groups.length),
    others: others ? toGroup(others, 4) : null,
    articles: articles.slice(0, 2).map((a) => ({ title: a.title.length > 76 ? `${a.title.slice(0, 73)}…` : a.title, category: a.category ?? 'Actualité', image: a.image, href: a.href })),
    promoImage: PROMO_IMAGE,
  };
  // Pied de page : 8 premières prestations, dans l'ordre des activités
  const footerServices = catalog.categories.flatMap((c) => c.services).slice(0, 8).map((s) => ({ title: s.title, href: s.href }));

  return (
    <div className="asp-site">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-white focus:p-3 focus:text-navy">Aller au contenu</a>
      {preview && <PreviewBanner />}
      <SiteHeader data={header} />
      <div id="contenu">{children}</div>
      <SiteFooter settings={settings} services={footerServices} />
      <CookieConsent />
    </div>
  );
}
