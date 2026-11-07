import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { CACHE_TAGS } from './cache';
import { DEFAULT_SETTINGS, SETTINGS_SCHEMAS, type SettingKey, type SettingsMap } from './settings-defaults';

/**
 * Réglages du site : valeurs enregistrées en base, validées, complétées par les valeurs par défaut.
 * Une valeur invalide en base n'interrompt jamais l'affichage : la valeur par défaut est utilisée.
 */
const loadSettings = unstable_cache(
  async (): Promise<SettingsMap> => {
    const rows = await prisma.siteSetting.findMany();
    const out = { ...DEFAULT_SETTINGS } as Record<SettingKey, unknown>;
    for (const row of rows) {
      const key = row.key as SettingKey;
      if (!(key in SETTINGS_SCHEMAS)) continue;
      const merged = { ...(DEFAULT_SETTINGS[key] as object), ...(row.value as object) };
      const parsed = SETTINGS_SCHEMAS[key].safeParse(merged);
      if (parsed.success) out[key] = parsed.data;
      else console.error(`[settings] réglage « ${key} » invalide, valeur par défaut utilisée`, parsed.error.flatten());
    }
    return out as SettingsMap;
  },
  ['site-settings'],
  { tags: [CACHE_TAGS.settings], revalidate: 3600 },
);

export const getSettings = cache(async (): Promise<SettingsMap> => {
  try {
    return await loadSettings();
  } catch (error) {
    console.error('[settings] lecture impossible, valeurs par défaut utilisées', error);
    return DEFAULT_SETTINGS;
  }
});
