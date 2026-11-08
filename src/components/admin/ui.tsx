/**
 * Primitives visuelles de l'administration (maquette « ASPEO Admin ») : boutons, badges,
 * cartes, champs. Sans état : utilisables côté serveur et côté navigateur.
 */
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'dangerGhost';
const BTN: Record<Variant, string> = {
  primary: 'border-[#06226D] bg-[#06226D] text-white hover:bg-[#0b2f8a]',
  secondary: 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
  danger: 'border-red-200 bg-white text-red-600 hover:bg-red-50',
  ghost: 'border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100',
  dangerGhost: 'border-transparent bg-transparent text-red-600 hover:bg-red-50',
};
export const btn = (variant: Variant = 'secondary', size: 'sm' | 'md' = 'md') =>
  `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${size === 'sm' ? 'h-8 px-2.5 text-[13.5px]' : 'h-9 px-3.5 text-[14.5px]'} ${BTN[variant]}`;

export function Btn({ variant = 'secondary', size = 'md', className = '', ...p }: ComponentProps<'button'> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return <button type="button" {...p} className={`${btn(variant, size)} ${className}`} />;
}
export function BtnLink({ variant = 'secondary', size = 'md', className = '', ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return <Link {...p} className={`${btn(variant, size)} ${className}`} />;
}

export type Tone = 'green' | 'gray' | 'orange' | 'blue' | 'red';
const TONE: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700', gray: 'bg-zinc-100 text-zinc-600', orange: 'bg-orange-50 text-[#C74700]', blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700',
};
export function Badge({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium ${TONE[tone]}`}>{children}</span>;
}

export function Card({ title, action, children, className = '', pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-lg border border-zinc-200 bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3.5">
          {title && <h2 className="m-0 text-[15px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

export function Notice({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'orange' | 'red' | 'green' }) {
  const cls = { blue: 'border-blue-100 bg-blue-50/60 text-[#06226D]', orange: 'border-orange-200 bg-orange-50 text-[#8a3300]', red: 'border-red-200 bg-red-50 text-red-800', green: 'border-green-200 bg-green-50 text-green-800' }[tone];
  return <div className={`rounded-lg border px-4 py-3 text-[14px] ${cls}`}>{children}</div>;
}

export const inputCls = 'block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[14px] text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-[#06226D] focus:ring-2 focus:ring-[#06226D]/15 aria-[invalid=true]:border-red-400';

/** Onglets segmentés (« Tous / Publiés / Brouillons »). */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded px-3 py-1.5 text-[13.5px] ${value === o.value ? 'bg-white font-medium text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>
          {o.label}{o.count !== undefined && <span className="ml-1.5 text-[12px] text-zinc-400">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export const fmtDate = (v: unknown, withTime = false) => {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Europe/Paris' });
};

export function relativeTime(v: Date | string) {
  const d = new Date(v);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'à l’instant';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 172800) return 'hier';
  if (s < 30 * 86400) return `il y a ${Math.floor(s / 86400)} jours`;
  return fmtDate(d);
}
