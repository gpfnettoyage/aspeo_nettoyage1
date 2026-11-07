'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { logoutAction } from '@/actions/auth/auth.actions';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  LogOut,
  Shield,
  Users,
  ExternalLink,
} from 'lucide-react';
import type { Role } from '@prisma/client';
import { hasPermission, type Permission } from '@/lib/permissions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/gp8x2k4m',
    icon: LayoutDashboard,
    permission: 'dashboard:view',
  },
  {
    label: 'Services',
    href: '/gp8x2k4m/services',
    icon: FileText,
    permission: 'services:view',
  },
  {
    label: 'Categories',
    href: '/gp8x2k4m/categories',
    icon: FolderOpen,
    permission: 'categories:view',
  },
];

const adminNavItems: NavItem[] = [
  {
    label: 'Securite',
    href: '/gp8x2k4m/security',
    icon: Shield,
    permission: 'security:view',
  },
  {
    label: 'Utilisateurs',
    href: '/gp8x2k4m/users',
    icon: Users,
    permission: 'users:view',
  },
];

interface AdminSidebarProps {
  userRole?: Role;
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/gp8x2k4m') {
      return pathname === '/gp8x2k4m';
    }
    return pathname.startsWith(href);
  };

  const filterByPermission = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.permission) return true;
      if (!userRole) return false;
      return hasPermission(userRole, item.permission);
    });
  };

  const filteredMainItems = filterByPermission(mainNavItems);
  const filteredAdminItems = filterByPermission(adminNavItems);

  return (
    <Sidebar collapsible="icon" className="top-14 sm:top-16 h-[calc(100svh-3.5rem)] sm:h-[calc(100svh-4rem)]">
      <SidebarHeader className="h-14 flex items-center justify-center border-b px-2 group-data-[collapsible=icon]:px-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/gp8x2k4m">
              
                  <Image
                    src="/icons/icon-48x48.png"
                    alt="ASPEO"
                    width={32}
                    height={32}
                  />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ASPEO</span>
                  <span className="truncate text-xs text-muted-foreground">Administration</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section (if user has any admin permissions) */}
        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voir le site">
              <Link href="/" target="_blank">
                <ExternalLink className="size-4" />
                <span>Voir le site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logoutAction} className="w-full">
              <SidebarMenuButton
                type="submit"
                tooltip="Deconnexion"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="size-4" />
                <span>Deconnexion</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
