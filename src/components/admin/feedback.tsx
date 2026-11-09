'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Btn } from './ui';

/** Message éphémère (bas de l'écran), annoncé aux lecteurs d'écran. */
export function useToast() {
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = useCallback((text: string, error = false) => {
    clearTimeout(timer.current);
    setToast({ text, error });
    timer.current = setTimeout(() => setToast(null), error ? 6000 : 3200);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
      {toast && <div role={toast.error ? 'alert' : 'status'} className={`pointer-events-auto max-w-lg rounded-md px-4 py-2.5 text-[14px] text-white shadow-lg ${toast.error ? 'bg-red-700' : 'bg-zinc-900'}`}>{toast.text}</div>}
    </div>
  );
  return { say, node };
}

/** Boîte de confirmation (suppression, dépublication…). */
export function ConfirmDialog({ open, title, children, confirmLabel, danger = true, busy, onConfirm, onCancel }: { open: boolean; title: string; children?: ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
        <h2 id="confirm-title" className="m-0 text-[16px] font-semibold">{title}</h2>
        {children && <div className="mt-2 text-[14px] text-zinc-600">{children}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <Btn ref={ref} onClick={onCancel}>Annuler</Btn>
          <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>{busy ? 'Patientez…' : confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
