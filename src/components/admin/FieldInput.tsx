'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import type { AdminField } from '@/lib/admin/fields';
import type { FormValue } from '@/lib/admin/values';
import MediaPicker from './MediaPicker';
import { inputCls } from './ui';

export interface RelationOption { id: string; slug: string; label: string }
export type RelationMap = Partial<Record<NonNullable<AdminField['relation']>, RelationOption[]>>;

interface Props { field: AdminField; value: FormValue | undefined; onChange: (v: FormValue) => void; error?: string; relations?: RelationMap; idPrefix?: string }

const counterTone = (len: number, field: AdminField) => {
  if (field.max && len > field.max) return 'text-red-600';
  if (field.recommended && len > 0 && (len < field.recommended[0] || len > field.recommended[1])) return 'text-[#C74700]';
  return 'text-zinc-400';
};

/** Ligne d'étiquette avec compteur de caractères. */
function Label({ field, htmlFor, len }: { field: AdminField; htmlFor: string; len?: number }) {
  const showCount = len !== undefined && (field.max || field.recommended);
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[14px] font-medium leading-[1.35] text-[#0a0a0a]">{field.label}{field.required && <span className="text-[#c2410c]" aria-hidden="true"> *</span>}</label>
      {showCount && <span className={`text-[12px] tabular-nums ${counterTone(len!, field)}`}>{len} / {field.max ?? field.recommended![1]}</span>}
    </div>
  );
}

/** Choix d'une image (bibliothèque ou URL). */
export function ImageInput({ value, onChange, id, label = 'Changer l’image', emptyLabel = 'Choisir une image' }: { value: string; onChange: (v: string) => void; id: string; label?: string; emptyLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="aspect-[4/3] w-[120px] flex-none overflow-hidden rounded-md border border-gray-200 bg-[#f4f4f5]">
        {value && <img src={value} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button id={id} type="button" onClick={() => setOpen(true)} className="rounded-md border border-gray-200 bg-white px-3 py-[7px] text-[13.5px] font-medium text-[#0a0a0a] hover:bg-[#f4f4f5]">{value ? label : emptyLabel}</button>
          {value && <button type="button" onClick={() => onChange('')} className="rounded-md border-0 bg-transparent px-2.5 py-[7px] text-[13.5px] text-gray-500 hover:bg-[#f4f4f5] hover:text-[#0a0a0a]">Retirer</button>}
        </div>
        {value && <p className="m-0 mt-1 max-w-[340px] truncate text-[12px] text-zinc-400" title={value}>{value}</p>}
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(url) => onChange(url)} />
    </div>
  );
}

function move<T>(arr: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

function RowTools({ i, n, onMove, onRemove, label }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void; label: string }) {
  const ic = 'inline-flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-[#0a0a0a] disabled:opacity-30';
  return (
    <div className="flex flex-none items-center">
      <button type="button" className={ic} onClick={() => onMove(-1)} disabled={i === 0} aria-label={`Monter ${label} ${i + 1}`}><ArrowUp className="h-3.5 w-3.5" /></button>
      <button type="button" className={ic} onClick={() => onMove(1)} disabled={i === n - 1} aria-label={`Descendre ${label} ${i + 1}`}><ArrowDown className="h-3.5 w-3.5" /></button>
      <button type="button" className={`${ic} hover:text-red-600`} onClick={onRemove} aria-label={`Supprimer ${label} ${i + 1}`}><X className="h-4 w-4" /></button>
    </div>
  );
}

const AddRow = ({ onClick, disabled, label = 'Ajouter une ligne' }: { onClick: () => void; disabled?: boolean; label?: string }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-1 self-start rounded-md border border-dashed border-zinc-300 bg-white px-3 py-1.5 text-[13px] text-zinc-700 hover:border-[#06226D] hover:text-[#06226D] disabled:opacity-40">
    <Plus className="h-3.5 w-3.5" />{label}
  </button>
);

export default function FieldInput({ field, value, onChange, error, relations, idPrefix = 'f' }: Props) {
  const id = `${idPrefix}-${field.name.replace(/\W/g, '-')}`;
  const str = typeof value === 'string' ? value : '';
  const describedBy = [field.help ? `${id}-help` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined;
  const common = { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy } as const;

  let control: React.ReactNode;
  switch (field.type) {
    case 'toggle':
      return (
        <div className="flex flex-col gap-1.5">
          <button id={id} type="button" role="switch" aria-checked={value === true} aria-describedby={field.help ? `${id}-help` : undefined} onClick={() => onChange(value !== true)}
            className="inline-flex items-center gap-2.5 self-start border-0 bg-transparent px-0 py-0.5 text-left text-[#0a0a0a]">
            <span className={`relative h-[22px] w-[38px] flex-none rounded-full transition-colors ${value === true ? 'bg-[#06226D]' : 'bg-zinc-300'}`} aria-hidden="true">
              <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)] transition-[left] ${value === true ? 'left-[18px]' : 'left-0.5'}`} />
            </span>
            <span className="text-[14px]">{field.label}</span>
          </button>
          {field.help && <p id={`${id}-help`} className="m-0 text-[12.5px] leading-[1.45] text-gray-500">{field.help}</p>}
        </div>
      );
    case 'textarea':
    case 'markdown':
      control = <textarea {...common} rows={field.rows ?? 4} className={`${inputCls} ${field.type === 'markdown' ? 'font-mono text-[13px]' : ''}`} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'select':
      control = (
        <select {...common} className={inputCls} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case 'relation': {
      const opts = (field.relation && relations?.[field.relation]) || [];
      control = (
        <select {...common} className={inputCls} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Aucun —</option>
          {opts.map((o) => <option key={o.id} value={field.valueKey === 'slug' ? o.slug : o.id}>{o.label}</option>)}
        </select>
      );
      break;
    }
    case 'number':
      control = <input {...common} type="number" inputMode="decimal" className={inputCls} value={str} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'date':
      control = <input {...common} type="date" className={`${inputCls} max-w-[220px]`} value={str} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'image':
      control = <ImageInput id={id} value={str} onChange={onChange} />;
      break;
    case 'gallery': {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      const slots = Math.min(field.maxItems ?? 8, Math.max(arr.length + 1, 1));
      control = (
        <div className="flex flex-col gap-[18px]">
          {Array.from({ length: slots }, (_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-medium leading-[1.35] text-[#0a0a0a]">Photo {i + 1}</span>
                {i < arr.length && <RowTools i={i} n={arr.length} label="la photo" onMove={(d) => onChange(move(arr, i, d))} onRemove={() => onChange(arr.filter((_, k) => k !== i))} />}
              </div>
              <div className="min-w-0"><ImageInput id={i === 0 ? id : `${id}-${i}`} value={arr[i] ?? ''} onChange={(url) => {
                const next = arr.slice();
                if (url) next[i] = url; else next.splice(i, 1);
                onChange(next.filter(Boolean));
              }} /></div>
            </div>
          ))}
        </div>
      );
      break;
    }
    case 'lines': {
      const rows = str ? str.split('\n') : [];
      const set = (next: string[]) => onChange(next.join('\n'));
      control = (
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input id={i === 0 ? id : undefined} aria-label={`${field.label} — ligne ${i + 1}`} className={inputCls} value={r} onChange={(e) => { const n = rows.slice(); n[i] = e.target.value.replace(/\n/g, ' '); set(n); }} />
              <RowTools i={i} n={rows.length} label="la ligne" onMove={(d) => set(move(rows, i, d))} onRemove={() => set(rows.filter((_, k) => k !== i))} />
            </div>
          ))}
          <AddRow onClick={() => set([...rows, ''])} />
        </div>
      );
      break;
    }
    case 'list': {
      const items = Array.isArray(value) ? (value as Record<string, string>[]) : [];
      const sub = field.itemFields ?? [];
      const compact = sub.filter((s) => s.type !== 'toggle').length <= 3 && sub.every((s) => s.type === 'text' || s.type === 'number' || s.type === 'textarea' || s.type === 'toggle');
      const cols = sub.filter((s) => s.type !== 'toggle').length;
      const blank = () => Object.fromEntries(sub.map((s) => [s.name, s.type === 'toggle' ? 'true' : '']));
      const setItem = (i: number, k: string, v: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
      control = (
        <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <div key={i} className={compact ? 'flex items-start gap-1.5' : 'rounded-md border border-gray-200 p-3'}>
              {!compact && <div className="mb-2 flex items-center justify-between"><span className="text-[13px] font-medium text-zinc-600">{field.itemLabel} {i + 1}</span><RowTools i={i} n={items.length} label={field.itemLabel ?? 'l’élément'} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, k) => k !== i))} /></div>}
              <div className={compact ? `grid min-w-0 flex-1 gap-1.5 ${cols === 1 ? '' : cols === 2 ? (sub.length > cols ? 'sm:grid-cols-[2fr_3fr_auto]' : 'sm:grid-cols-[2fr_3fr]') : 'sm:grid-cols-3'}` : 'grid gap-3 sm:grid-cols-2'}>
                {sub.map((s) => {
                  const v = it[s.name] ?? '';
                  const sid = `${id}-${i}-${s.name}`;
                  const wide = !compact && (s.type === 'textarea' || s.type === 'markdown');
                  return (
                    <div key={s.name} className={wide ? 'sm:col-span-2' : ''}>
                      {!compact && s.type !== 'toggle' && <label htmlFor={sid} className="mb-1 block text-[13px] font-medium">{s.label}{s.required && <span className="text-red-600">*</span>}</label>}
                      {s.type === 'toggle' ? <label className="inline-flex h-full items-center gap-1.5 whitespace-nowrap text-[13.5px]"><input id={sid} type="checkbox" className="h-4 w-4 accent-[#06226D]" checked={v !== 'false'} onChange={(e) => setItem(i, s.name, e.target.checked ? 'true' : 'false')} />{s.label}</label>
                        : s.type === 'image' ? <ImageInput id={sid} value={v} onChange={(u) => setItem(i, s.name, u)} />
                        : s.type === 'textarea' && !compact ? <textarea id={sid} rows={s.rows ?? 3} className={inputCls} value={v} onChange={(e) => setItem(i, s.name, e.target.value)} />
                        : s.type === 'select' ? <select id={sid} className={inputCls} value={v} onChange={(e) => setItem(i, s.name, e.target.value)}><option value="">—</option>{s.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                        : <input id={sid} aria-label={compact ? `${s.label} ${i + 1}` : undefined} placeholder={compact ? s.label : undefined} type={s.type === 'number' ? 'number' : 'text'} className={inputCls} value={v} onChange={(e) => setItem(i, s.name, e.target.value)} />}
                    </div>
                  );
                })}
              </div>
              {compact && <RowTools i={i} n={items.length} label={field.itemLabel ?? 'l’élément'} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, k) => k !== i))} />}
            </div>
          ))}
          <AddRow onClick={() => onChange([...items, blank()])} disabled={items.length >= (field.maxItems ?? 50)} label={field.addLabel ?? 'Ajouter une ligne'} />
        </div>
      );
      break;
    }
    default:
      control = <input {...common} type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'} className={`${inputCls} ${field.type === 'slug' ? 'font-mono text-[13px]' : ''}`} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }

  const len = ['text', 'textarea', 'slug'].includes(field.type) ? str.length : undefined;
  return (
    <div>
      <Label field={field} htmlFor={id} len={len} />
      {control}
      {field.help && <p id={`${id}-help`} className="m-0 mt-1.5 text-[12.5px] leading-[1.45] text-gray-500">{field.help}</p>}
      {field.type === 'markdown' && <p className="m-0 mt-1 text-[12px] text-zinc-400">Mise en forme : ## Intertitre · **gras** · - liste · [lien](https://…)</p>}
      {error && <p id={`${id}-err`} className="m-0 mt-1 text-[13px] text-red-600" role="alert">{error}</p>}
    </div>
  );
}
