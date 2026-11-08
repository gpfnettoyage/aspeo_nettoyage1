/**
 * Conversion entre enregistrements Prisma et valeurs de formulaire (par chemin « a.b.c »),
 * avec validation. Module pur (sans accès base), testé unitairement.
 */
import type { AdminField, CollectionDef } from './fields';
import { allAdminFields } from './fields';

export type FormValue = string | boolean | string[] | Record<string, string>[];
export type FormValues = Record<string, FormValue>;

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let cur = obj;
  keys.slice(0, -1).forEach((k) => {
    if (!cur[k] || typeof cur[k] !== 'object' || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  });
  cur[keys[keys.length - 1]!] = value;
}

/** Fusion profonde (les objets sont fusionnés, les tableaux et valeurs remplacés). */
export function deepMerge(base: unknown, patch: unknown): unknown {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch;
  const out: Record<string, unknown> = base && typeof base === 'object' && !Array.isArray(base) ? { ...(base as Record<string, unknown>) } : {};
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) out[k] = v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) ? deepMerge(out[k], v) : v;
  return out;
}

export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);

const toInputDate = (v: unknown) => {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

function fieldToForm(field: AdminField, raw: unknown): FormValue {
  switch (field.type) {
    case 'toggle': return raw === true;
    case 'lines': return Array.isArray(raw) ? raw.map(String).join('\n') : typeof raw === 'string' ? raw : '';
    case 'gallery': return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
    case 'date': return toInputDate(raw);
    case 'number': return raw === null || raw === undefined ? '' : String(raw);
    case 'list': return Array.isArray(raw) ? raw.map((item) => Object.fromEntries((field.itemFields ?? []).map((sf) => [sf.name, item && typeof item === 'object' && (item as Record<string, unknown>)[sf.name] != null ? String((item as Record<string, unknown>)[sf.name]) : '']))) : [];
    default: return raw === null || raw === undefined ? '' : String(raw);
  }
}

/** Valeurs de formulaire à partir d'un enregistrement (et de son brouillon éventuel). */
export function recordToValues(def: CollectionDef, row: Record<string, unknown> | null): FormValues {
  const values: FormValues = {};
  for (const field of allAdminFields(def)) values[field.name] = fieldToForm(field, row ? getPath(row, field.name) : undefined);
  return values;
}

export interface ValidationResult { data: Record<string, unknown>; errors: Record<string, string> }

function coerce(field: AdminField, v: FormValue | undefined, errors: Record<string, string>): unknown {
  const str = typeof v === 'string' ? v.trim() : '';
  switch (field.type) {
    case 'toggle': return v === true;
    case 'lines': return str ? str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
    case 'gallery': return Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === 'string' && x.trim() !== '').slice(0, field.maxItems ?? 20) : [];
    case 'number': {
      if (!str) return null;
      const n = Number(str.replace(',', '.'));
      if (!Number.isFinite(n)) { errors[field.name] = 'Nombre invalide.'; return null; }
      if (field.min !== undefined && n < field.min) errors[field.name] = `Minimum : ${field.min}.`;
      if (field.max !== undefined && n > field.max) errors[field.name] = `Maximum : ${field.max}.`;
      return n;
    }
    case 'date': {
      if (!str) return null;
      const d = new Date(`${str}T09:00:00`);
      if (Number.isNaN(d.getTime())) { errors[field.name] = 'Date invalide.'; return null; }
      return d;
    }
    case 'list': {
      const items = Array.isArray(v) ? (v as Record<string, string>[]) : [];
      return items
        .map((item) => {
          const out: Record<string, unknown> = {};
          for (const sf of field.itemFields ?? []) {
            const raw = typeof item[sf.name] === 'string' ? item[sf.name]!.trim() : '';
            out[sf.name] = sf.type === 'number' ? (raw ? Number(raw.replace(',', '.')) : null) : raw;
          }
          return out;
        })
        .filter((o) => Object.values(o).some((x) => x !== '' && x !== null))
        .slice(0, field.maxItems ?? 50);
    }
    case 'slug': return slugify(str);
    case 'url': return str;
    default:
      if (field.max && str.length > field.max) errors[field.name] = `${field.max} caractères maximum (actuellement ${str.length}).`;
      return str || null;
  }
}

/**
 * Valide les valeurs et construit les données Prisma (chemins imbriqués reconstitués).
 * Les champs JSON (content, faq…) sont fusionnés avec la valeur existante : les clés non
 * présentes dans le formulaire (contenus historiques) sont conservées.
 */
export function valuesToData(def: CollectionDef, values: FormValues, existing: Record<string, unknown> | null): ValidationResult {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};
  for (const field of allAdminFields(def)) {
    const value = coerce(field, values[field.name], errors);
    const empty = value === null || value === '' || (Array.isArray(value) && value.length === 0);
    if (field.required && empty) errors[field.name] = 'Champ obligatoire.';
    if (field.type === 'list' && Array.isArray(value)) {
      (value as Record<string, unknown>[]).forEach((item, i) => (field.itemFields ?? []).forEach((sf) => {
        if (sf.required && (item[sf.name] === '' || item[sf.name] === null)) errors[field.name] = `${field.itemLabel ?? 'Élément'} ${i + 1} : « ${sf.label} » est obligatoire.`;
      }));
    }
    setPath(data, field.name, value);
  }
  if (def.slugFrom && !data.slug) data.slug = slugify(String(getPath(data, def.slugFrom) ?? ''));
  if (def.slugFrom && !data.slug) errors.slug = 'Adresse obligatoire.';
  // Fusion des objets JSON avec l'existant
  if (existing) for (const [k, v] of Object.entries(data)) {
    const prev = existing[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && prev && typeof prev === 'object' && !Array.isArray(prev)) data[k] = deepMerge(prev, v);
  }
  return { data, errors };
}
