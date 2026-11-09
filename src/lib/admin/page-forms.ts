/**
 * Formulaires des pages fixes générés depuis les modèles PageContentModel (module pur).
 * Les valeurs sont « à plat » (« hero.title ») comme dans Page.content. Seules les valeurs
 * différentes du texte de la maquette sont enregistrées : un champ vidé revient au texte par défaut.
 */
import type { FieldDef, PageContentModel, PageValues } from '@/lib/site/page-content/types';
import type { AdminField, AdminFieldGroup } from './fields';
import type { FormValues } from './values';

function toAdminField(f: FieldDef): AdminField {
  if (f.type === 'list') {
    return { name: f.key, label: f.label, type: 'list', itemLabel: f.itemLabel, maxItems: f.max ?? 20, help: f.help, itemFields: f.itemFields.map((s) => ({ name: s.key, label: s.label, type: s.type === 'url' ? 'text' : s.type, rows: 3 })) };
  }
  return { name: f.key, label: f.label, type: f.type, max: f.maxLength, help: f.help, rows: f.type === 'textarea' ? 4 : undefined };
}

export const pageGroups = (model: PageContentModel): AdminFieldGroup[] =>
  model.sections.map((s) => ({ title: s.title, fields: s.fields.map(toAdminField) }));

/** Valeurs affichées : valeur enregistrée, sinon texte de la maquette. */
export function pageToValues(model: PageContentModel, stored: unknown): FormValues {
  const values = (stored && typeof stored === 'object' ? stored : {}) as PageValues;
  const out: FormValues = {};
  for (const s of model.sections) for (const f of s.fields) {
    const v = values[f.key];
    if (f.type === 'list') out[f.key] = Array.isArray(v) ? v.map((it) => Object.fromEntries(f.itemFields.map((x) => [x.key, String(it[x.key] ?? '')]))) : f.default.map((it) => ({ ...it }));
    else out[f.key] = typeof v === 'string' && v.trim() ? v : f.default;
  }
  return out;
}

const sameList = (a: Record<string, string>[], b: Record<string, string>[]) => JSON.stringify(a) === JSON.stringify(b);

/** Contenu à enregistrer : uniquement ce qui diffère de la maquette, valeurs bornées. */
export function valuesToPageContent(model: PageContentModel, values: FormValues): { content: PageValues; errors: Record<string, string> } {
  const content: PageValues = {};
  const errors: Record<string, string> = {};
  for (const s of model.sections) for (const f of s.fields) {
    const v = values[f.key];
    if (f.type === 'list') {
      const items = (Array.isArray(v) ? (v as Record<string, string>[]) : [])
        .map((it) => Object.fromEntries(f.itemFields.map((x) => [x.key, String(it?.[x.key] ?? '').trim().slice(0, x.maxLength ?? 2000)])))
        .filter((it) => Object.values(it).some(Boolean))
        .slice(0, f.max ?? 20);
      if (!sameList(items, f.default)) content[f.key] = items;
    } else {
      const str = typeof v === 'string' ? v.trim() : '';
      if (f.maxLength && str.length > f.maxLength) errors[f.key] = `${f.maxLength} caractères maximum (actuellement ${str.length}).`;
      if (str && str !== f.default) content[f.key] = str.slice(0, 5000);
    }
  }
  return { content, errors };
}
