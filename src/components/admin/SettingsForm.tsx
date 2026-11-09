'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { AdminFieldGroup } from '@/lib/admin/fields';
import type { FormValue, FormValues } from '@/lib/admin/values';
import { saveSettingsAction } from '@/actions/admin/settings.actions';
import FieldInput from './FieldInput';
import { useToast } from './feedback';
import { Btn } from './ui';

export interface SettingsSection { key: string; groups: AdminFieldGroup[]; values: FormValues }

/** Formulaire de réglages : onglets (un par groupe) et enregistrement direct en ligne. */
export default function SettingsForm({ sections, canEdit, aside }: { sections: SettingsSection[]; canEdit: boolean; aside?: React.ReactNode }) {
  const router = useRouter();
  const { say, node: toast } = useToast();
  const [values, setValues] = useState<Record<string, FormValues>>(() => Object.fromEntries(sections.map((s) => [s.key, s.values])));
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, start] = useTransition();
  const tabs = sections.flatMap((s) => s.groups.map((g, i) => ({ id: `${s.key}-${i}`, key: s.key, group: g })));
  const [tab, setTab] = useState(tabs[0]?.id);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key: string, name: string, v: FormValue) => {
    setDirty(true);
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [name]: v } }));
  };

  const save = () => start(async () => {
    const res = await saveSettingsAction(sections.map((s) => ({ key: s.key, values: values[s.key]! })));
    if (!res.ok) {
      setErrors(res.errors);
      say(res.message, true);
      const first = tabs.find((t) => t.group.fields.some((f) => res.errors[t.key]?.[f.name]));
      if (first) setTab(first.id);
      return;
    }
    setErrors({}); setDirty(false); say(res.message); router.refresh();
  });

  const current = tabs.find((t) => t.id === tab) ?? tabs[0]!;
  const errCount = (t: (typeof tabs)[number]) => t.group.fields.filter((f) => errors[t.key]?.[f.name]).length;

  return (
    <div className={aside ? 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]' : ''}>
      <div>
        {tabs.length > 1 && (
          <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
            {tabs.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={t.id === current.id} onClick={() => setTab(t.id)}
                className={`-mb-px whitespace-nowrap border-0 border-b-2 bg-transparent px-3 py-[11px] text-[14px] font-medium ${t.id === current.id ? 'border-[#06226D] text-[#0a0a0a]' : 'border-transparent text-gray-500 hover:text-[#0a0a0a]'}`}>
                {t.group.title}{errCount(t) > 0 && <span className="ml-1.5 rounded-full bg-red-100 px-1.5 text-[11.5px] text-red-700">{errCount(t)}</span>}
              </button>
            ))}
          </div>
        )}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          {tabs.length === 1 && <h2 className="m-0 mb-1 text-[15px] font-semibold">{current.group.title}</h2>}
          {current.group.description && <p className="m-0 mb-4 text-[13.5px] text-gray-500">{current.group.description}</p>}
          <fieldset disabled={!canEdit} className="m-0 grid gap-5 border-0 p-0 sm:grid-cols-2">
            {current.group.fields.map((f) => (
              <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                <FieldInput field={f} idPrefix={current.key} value={values[current.key]?.[f.name]} onChange={(v) => set(current.key, f.name, v)} error={errors[current.key]?.[f.name]} />
              </div>
            ))}
          </fieldset>
        </section>
        {canEdit && (
          <div className="mt-4 flex items-center gap-3">
            <Btn variant="primary" onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer et publier'}</Btn>
            {dirty && <span className="text-[13px] text-[#C74700]">Modifications non enregistrées</span>}
          </div>
        )}
      </div>
      {aside}
      {toast}
    </div>
  );
}
