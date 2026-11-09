'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Inbox, UserRoundSearch, PanelsTopLeft, FileText, Folder, MapPin, Camera, Newspaper, Mic, Star, BriefcaseBusiness, CircleHelp,
  Image as ImageIcon, Building2, Menu as MenuIcon, Search, Images, Gauge, Shield, Users, ExternalLink, LogOut, X, ArrowLeftRight,
} from 'lucide-react';
import type { Role } from '@prisma/client';
import { hasPermission, type Permission } from '@/lib/permissions';
import { logoutAction } from '@/actions/auth/auth.actions';
import { ADMIN_BASE_PATH as B } from '@/lib/constants/admin';

interface Item { label: string; href: string; icon: typeof LayoutDashboard; permission: Permission; badge?: 'leads' | 'applications' }
const GROUPS: { title: string; items: Item[] }[] = [
  { title: 'Général', items: [
    { label: 'Tableau de bord', href: B, icon: LayoutDashboard, permission: 'dashboard:view' },
    { label: 'Demandes de devis', href: `${B}/demandes`, icon: Inbox, permission: 'leads:view', badge: 'leads' },
    { label: 'Candidatures', href: `${B}/candidatures`, icon: UserRoundSearch, permission: 'leads:view', badge: 'applications' },
  ] },
  { title: 'Site web', items: [
    { label: 'Pages', href: `${B}/pages`, icon: PanelsTopLeft, permission: 'content:view' },
    { label: 'Services', href: `${B}/contenus/services`, icon: FileText, permission: 'content:view' },
    { label: 'Catégories', href: `${B}/contenus/categories`, icon: Folder, permission: 'content:view' },
    { label: 'Pages villes', href: `${B}/contenus/villes`, icon: MapPin, permission: 'content:view' },
  ] },
  { title: 'Contenus', items: [
    { label: 'Réalisations', href: `${B}/contenus/realisations`, icon: Camera, permission: 'content:view' },
    { label: 'Articles Médias', href: `${B}/contenus/articles`, icon: Newspaper, permission: 'content:view' },
    { label: 'Presse', href: `${B}/contenus/presse`, icon: Mic, permission: 'content:view' },
    { label: 'Avis clients', href: `${B}/contenus/avis`, icon: Star, permission: 'content:view' },
    { label: 'Offres d’emploi', href: `${B}/contenus/emplois`, icon: BriefcaseBusiness, permission: 'content:view' },
    { label: 'FAQ', href: `${B}/contenus/faq`, icon: CircleHelp, permission: 'content:view' },
  ] },
  { title: 'Réglages', items: [
    { label: 'Logo & identité', href: `${B}/reglages/identity`, icon: ImageIcon, permission: 'settings:view' },
    { label: 'Informations de l’entreprise', href: `${B}/reglages/company`, icon: Building2, permission: 'settings:view' },
    { label: 'Menu & pied de page', href: `${B}/reglages/navigation`, icon: MenuIcon, permission: 'settings:view' },
    { label: 'Chiffres & notifications', href: `${B}/reglages/stats`, icon: Gauge, permission: 'settings:view' },
    { label: 'Référencement', href: `${B}/referencement`, icon: Search, permission: 'settings:view' },
    { label: 'Redirections', href: `${B}/redirections`, icon: ArrowLeftRight, permission: 'settings:view' },
    { label: 'Bibliothèque d’images', href: `${B}/medias`, icon: Images, permission: 'media:view' },
  ] },
  { title: 'Administration', items: [
    { label: 'Sécurité', href: `${B}/security`, icon: Shield, permission: 'security:view' },
    { label: 'Utilisateurs', href: `${B}/users`, icon: Users, permission: 'users:view' },
  ] },
];

const itemCls = (active: boolean) =>
  `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] text-[#0a0a0a] no-underline transition-colors ${active ? 'bg-[#ececee] font-semibold' : 'hover:bg-[#ececee]'}`;

export default function AdminNav({ role, counts }: { role: Role; counts: { leads: number; applications: number } }) {
  const pathname = usePathname() || B;
  const [open, setOpen] = useState(false);
  // Fermeture du menu mobile à chaque changement de page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(false); }
  const isActive = (href: string) => (href === B ? pathname === B : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Navigation de l’administration">
      <div className="flex-1 overflow-y-auto">
        {GROUPS.map((g) => {
          const items = g.items.filter((i) => hasPermission(role, i.permission));
          if (!items.length) return null;
          return (
            <div key={g.title} className="px-2 pb-0.5 pt-3">
              <div className="px-2.5 pb-1.5 text-[12px] font-medium text-gray-500">{g.title}</div>
              <ul className="m-0 flex list-none flex-col gap-px p-0">
                {items.map((i) => {
                  const n = i.badge ? counts[i.badge] : 0;
                  return (
                    <li key={i.href}>
                      <Link href={i.href} className={itemCls(isActive(i.href))} aria-current={isActive(i.href) ? 'page' : undefined}>
                        <i.icon className="h-4 w-4 flex-none" aria-hidden="true" />
                        <span className="flex-1 truncate">{i.label}</span>
                        {n > 0 && <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5C00] px-1.5 text-[11.5px] font-bold text-white" aria-label={`${n} nouvelles`}>{n}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-px border-t border-gray-200 p-2">
        <a href="/" target="_blank" rel="noopener" className={itemCls(false)}><ExternalLink className="h-4 w-4" aria-hidden="true" />Voir le site</a>
        <form action={logoutAction}>
          <button type="submit" className={`${itemCls(false)} w-full border-0 bg-transparent text-left !text-[#dc2626]`}><LogOut className="h-4 w-4" aria-hidden="true" />Déconnexion</button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed left-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white lg:hidden" aria-label="Ouvrir le menu">
        <MenuIcon className="h-4 w-4" />
      </button>
      <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-64 border-r border-gray-200 bg-[#fafafa] lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute bottom-0 left-0 top-0 w-72 bg-white shadow-xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md" aria-label="Fermer le menu"><X className="h-4 w-4" /></button>
            <div className="pt-10 h-full">{nav}</div>
          </aside>
        </div>
      )}
    </>
  );
}
