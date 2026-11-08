import type { ComponentProps, ReactNode } from 'react';

/** Champs de formulaire du site (styles de la maquette Contact). */
export const inputCls = 'w-full p-[13px_15px] [border:1px_solid_#d7dee8] font-body text-[length:.98rem] text-navy bg-white outline-none focus:[border-color:#06226D] aria-[invalid=true]:[border-color:#c2410c]';

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-[6px] text-[length:.86rem] font-semibold text-navy">
      <span>{label}{required && ' *'}{hint && <span className="font-normal text-[color:#5b6878]"> {hint}</span>}</span>
      {children}
      {error && <span className="font-normal text-[length:.82rem] text-[color:#c2410c]">{error}</span>}
    </label>
  );
}

export const TextInput = (p: ComponentProps<'input'>) => <input className={inputCls} {...p} />;
export const TextArea = (p: ComponentProps<'textarea'>) => <textarea className={`${inputCls} resize-y`} {...p} />;
export const Select = (p: ComponentProps<'select'>) => <select className={inputCls} {...p} />;
