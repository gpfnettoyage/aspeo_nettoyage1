/**
 * Primitives visuelles de l'administration (maquette « ASPEO Admin ») : boutons, badges,
 * cartes, champs. Sans état : utilisables côté serveur et côté navigateur.
 */
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'dangerGhost';
const BTN: Record<Variant, string> = {
  primary: 'border-[#06226D] bg-[#06226D] text-white hover:bg-[#0a2f8f]',
  secondary: 'border-gray-200 bg-white text-[#0a0a0a] hover:bg-[#f4f4f5]',
  danger: 'border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]',
  ghost: 'border-transparent bg-transparent text-zinc-700 hover:bg-[#f4f4f5]',
  dangerGhost: 'border-transparent bg-transparent text-[#dc2626] hover:bg-[#fef2f2]',
};
export const btn = (variant: Variant = 'secondary', size: 'sm' | 'md' = 'md') =>
  `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${size === 'sm' ? 'px-2.5 py-[5px] text-[12.5px]' : 'px-3.5 py-2 text-[14px]'} ${BTN[variant]}`;

export function Btn({ variant = 'secondary', size = 'md', className = '', ...p }: ComponentProps<'button'> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return <button type="button" {...p} className={`${btn(variant, size)} ${className}`} />;
}
export function BtnLink({ variant = 'secondary', size = 'md', className = '', ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return <Link {...p} className={`${btn(variant, size)} ${className}`} />;
}

export type Tone = 'green' | 'gray' | 'orange' | 'blue' | 'violet' | 'red';
// Couleurs des pastilles de la maquette (BADGE / LB) : fonds -100, textes -700.
const TONE: Record<Tone, string> = {
  green: 'bg-[#dcfce7] text-[#15803d]', gray: 'bg-[#f4f4f5] text-[#3f3f46]', orange: 'bg-[#ffedd5] text-[#c2410c]', blue: 'bg-[#dbeafe] text-[#1d4ed8]', violet: 'bg-[#ede9fe] text-[#6d28d9]', red: 'bg-[#fee2e2] text-[#b91c1c]',
};
export function Badge({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium ${TONE[tone]}`}>{children}</span>;
}

export function Card({ title, action, children, className = '', pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f1] px-4 py-3.5">
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

export const inputCls = 'block w-full rounded-md border border-gray-200 bg-white px-2.5 py-2 text-[14px] leading-[1.5] text-[#0a0a0a] outline-none placeholder:text-zinc-400 focus:border-[#06226D] focus:shadow-[0_0_0_3px_rgba(6,34,109,.14)] aria-[invalid=true]:border-red-400';

/** Onglets segmentés (« Tous / Publiés / Brouillons »). */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex gap-0.5 rounded-md border border-gray-200 bg-[#fafafa] p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={`whitespace-nowrap rounded px-[11px] py-1.5 text-[13px] font-medium ${value === o.value ? 'bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,.08)]' : 'text-gray-500 hover:text-[#0a0a0a]'}`}>
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
