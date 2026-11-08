/* eslint-disable @next/next/no-img-element -- logo SVG officiel */
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { canAccessAdmin, getRoleDisplayName } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';
import AdminNav from './AdminNav';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

const initials = (s: string) => s.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

/**
 * Cadre de l'administration (maquette « ASPEO Admin ») : barre supérieure, navigation
 * groupée, en-tête de page. Vérifie la session en profondeur (en plus de chaque page/action).
 */
export default async function AdminShell({ children, title, description, actions, hideHeader = false }: AdminShellProps) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.user.role)) redirect(`${ADMIN_BASE_PATH}/login`);

  const [leads, applications] = await Promise.all([
    prisma.quoteRequest.count({ where: { status: 'NEW' } }).catch(() => 0),
    prisma.jobApplication.count({ where: { status: 'NEW' } }).catch(() => 0),
  ]);
  const name = session.user.name || session.user.email;

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-950 antialiased [font-family:var(--font-inter),Inter,system-ui,sans-serif]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white pl-14 pr-4 lg:pl-4">
        <a href={ADMIN_BASE_PATH} className="flex items-center gap-4 no-underline">
          <img src="/img/brand/logo-aspeo-couleur.svg" alt="ASPEO" className="h-7 w-auto" width={130} height={28} />
          <span className="hidden border-l border-zinc-200 pl-4 text-[14px] text-zinc-500 sm:inline">Administration</span>
        </a>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#06226D] text-[12px] font-semibold text-white" aria-hidden="true">{initials(name)}</span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13.5px] font-semibold">{name}</span>
            <span className="text-[11.5px] uppercase tracking-wide text-zinc-500">{getRoleDisplayName(session.user.role)}</span>
          </span>
        </div>
      </header>
      <AdminNav role={session.user.role} counts={{ leads, applications }} />
      <div className="pt-14 lg:pl-64">
        {!hideHeader && (title || actions) && (
          <div className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-8">
            <div>
              {title && <h1 className="m-0 text-[19px] font-semibold tracking-tight">{title}</h1>}
              {description && <p className="m-0 mt-0.5 text-[13.5px] text-zinc-500">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        )}
        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
