/** Données sérialisables transmises du serveur à l'en-tête (composant client). */
export interface MenuService { title: string; short: string; href: string }
export interface MenuGroup { label: string; href: string; items: MenuService[]; allItems: MenuService[] }
export interface MenuPole { key: string; label: string; groups: MenuGroup[] }
export interface MenuArticle { title: string; category: string; image: string | null; href: string }

export interface HeaderData {
  logo: string;
  phone: string;
  phoneIntl: string;
  ctaLabel: string;
  /** Menu principal (ordre, libellés et visibilité réglés dans l'administration). */
  main: { label: string; href: string; key?: 'services' | 'medias' }[];
  topbar: { label: string; href: string }[];
  poles: MenuPole[];
  others: MenuGroup | null;
  articles: MenuArticle[];
  promoImage: string;
}
