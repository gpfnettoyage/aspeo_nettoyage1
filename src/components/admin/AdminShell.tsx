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
    <div className="min-h-screen bg-white text-[14px] leading-[normal] text-[#0a0a0a] antialiased [font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white pl-14 pr-4 lg:pl-4">
        <a href={ADMIN_BASE_PATH} className="flex items-center gap-3 no-underline">
          <img src="/img/brand/logo-aspeo-couleur.svg" alt="ASPEO" className="h-7 w-auto" width={130} height={28} />
          <span className="hidden border-l border-gray-200 pl-3 text-[13px] text-gray-500 sm:inline">Administration</span>
        </a>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#06226D] text-[12px] font-semibold text-white" aria-hidden="true">{initials(name)}</span>
          <span className="hidden flex-col leading-[1.2] sm:flex">
            <span className="text-[13.5px] font-semibold">{name}</span>
            <span className="text-[12px] uppercase tracking-wide text-gray-500">{getRoleDisplayName(session.user.role)}</span>
          </span>
        </div>
      </header>
      <AdminNav role={session.user.role} counts={{ leads, applications }} />
      <div className="pt-14 lg:pl-64">
        {!hideHeader && (title || actions) && (
          <div className="sticky top-14 z-10 flex min-h-[60px] flex-wrap items-center gap-3 border-b border-gray-200 bg-white p-[10px_clamp(16px,3vw,32px)]">
            <div className="min-w-0 flex-[1_1_240px]">{title && <h1 className="m-0 text-[18px] font-semibold leading-[1.3]">{title}</h1>}</div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
        <main className="p-[clamp(16px,3vw,32px)]">
          {!hideHeader && description && <p className="m-[0_0_20px] max-w-[760px] text-[14px] leading-[1.5] text-gray-500">{description}</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
