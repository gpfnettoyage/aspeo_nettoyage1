'use server';

import type { Prisma } from '@prisma/client';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS, SETTINGS_SCHEMAS, type SettingKey } from '@/lib/site/settings-defaults';
import { valuesToSettings } from '@/lib/admin/settings-forms';
import type { FormValues } from '@/lib/admin/values';
import { recordAudit } from '@/lib/admin/audit-log';
import { invalidatePublicSite } from '@/lib/site/cache';

const LABELS: Record<SettingKey, string> = { company: 'Informations de l’entreprise', identity: 'Logo & identité', stats: 'Chiffres clés', notifications: 'Notifications', seo: 'Référencement', navigation: 'Menu & pied de page' };

/** Enregistre et publie un ou plusieurs réglages (validation complète avant toute écriture). */
export async function saveSettingsAction(entries: { key: string; values: FormValues }[]): Promise<{ ok: true; message: string } | { ok: false; message: string; errors: Record<string, Record<string, string>> }> {
  const session = await requirePermission('settings:update');
  const valid: { key: SettingKey; data: Record<string, unknown> }[] = [];
  const errors: Record<string, Record<string, string>> = {};
  for (const { key, values } of entries) {
    if (!(key in SETTINGS_SCHEMAS)) return { ok: false, message: 'Réglage inconnu.', errors: {} };
    const k = key as SettingKey;
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    const current = { ...(DEFAULT_SETTINGS[k] as Record<string, unknown>), ...((row?.value as Record<string, unknown>) ?? {}) };
    const res = valuesToSettings(k, values, current);
    if (res.ok) valid.push({ key: k, data: res.data }); else errors[key] = res.errors;
  }
  if (Object.keys(errors).length) return { ok: false, message: 'Certains champs sont à corriger.', errors };
  for (const { key, data } of valid) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value: data as Prisma.InputJsonValue, updatedBy: session.user.id }, create: { key, value: data as Prisma.InputJsonValue, updatedBy: session.user.id } });
    await recordAudit(session, 'settings', 'reglages', key, LABELS[key]);
  }
  invalidatePublicSite();
  return { ok: true, message: 'Enregistré : les modifications sont en ligne.' };
}
