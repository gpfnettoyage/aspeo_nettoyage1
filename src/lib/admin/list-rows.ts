import 'server-only';
import type { CollectionDef } from './fields';
import { getPath } from './values';
import { isLive } from './repository';
import type { ListRow } from '@/components/admin/EntryList';
import type { Tone } from '@/components/admin/ui';

const fmt = (v: unknown) => {
  if (!v) return '—';
  const d = new Date(String(v instanceof Date ? v.toISOString() : v));
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });
};

export function stateOf(def: CollectionDef, row: Record<string, unknown>): 'live' | 'offline' | 'archived' {
  if (def.status === 'content' && row.status === 'ARCHIVED') return 'archived';
  return isLive(def, row) ? 'live' : 'offline';
}

const STATUS: Record<string, [string, Tone]> = { live: ['Publié', 'green'], offline: ['Brouillon', 'gray'], archived: ['Archivé', 'gray'] };

/** Lignes de la liste d'administration (valeurs déjà formatées pour le navigateur). */
export function toListRows(def: CollectionDef, rows: Record<string, unknown>[]): ListRow[] {
  return rows.map((row) => {
    const state = stateOf(def, row);
    const imgRaw = def.list.image ? getPath(row, def.list.image) : null;
    return {
      id: String(row.id),
      title: String(getPath(row, def.list.title) ?? ''),
      subtitle: def.list.subtitle ? String(getPath(row, def.list.subtitle) ?? '') : '',
      image: typeof imgRaw === 'string' && imgRaw ? imgRaw : null,
      state,
      pending: !!row.draft && typeof row.draft === 'object',
      filter: def.list.filter ? String(getPath(row, def.list.filter.path) ?? '') : undefined,
      search: def.list.search.map((p) => String(getPath(row, p) ?? '')).join(' '),
      cells: def.list.columns.map((c) => {
        const v = getPath(row, c.path);
        if (c.kind === 'status') return { text: STATUS[state]![0], tone: STATUS[state]![1] };
        if (c.kind === 'date') return { text: fmt(v) };
        if (c.kind === 'badge') return { text: v ? String(v) : '—', badge: !!v };
        return { text: v === null || v === undefined || v === '' ? '—' : String(v) };
      }),
    };
  });
}
