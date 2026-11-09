import { describe, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/redis', () => ({ redis: {} }));
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import { checkSpam, createFormToken, HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/forms/antispam';
import { detectType, isImageType } from '@/lib/storage/images';
import { checkRequiredColumns } from '@/lib/admin/repository';
import { withDraft } from '@/lib/site/preview';
import { buildCsp } from '../../../csp.mjs';

const form = (fields: Record<string, string>) => { const fd = new FormData(); Object.entries(fields).forEach(([k, v]) => fd.set(k, v)); return fd; };

describe('anti-spam', () => {
  const t0 = 1_800_000_000_000;
  it('accepte un envoi humain (jeton valide, plus de 3 s)', async () => {
    expect(await checkSpam(form({ [TOKEN_FIELD]: createFormToken(t0) }), '1.1.1.1', t0 + 10_000)).toEqual({ ok: true });
  });
  it('refuse champ piège, envoi trop rapide, jeton expiré ou falsifié', async () => {
    const tok = createFormToken(t0);
    expect(await checkSpam(form({ [TOKEN_FIELD]: tok, [HONEYPOT_FIELD]: 'x' }), 'ip', t0 + 10_000)).toMatchObject({ reason: 'honeypot' });
    expect(await checkSpam(form({ [TOKEN_FIELD]: tok }), 'ip', t0 + 1_000)).toMatchObject({ reason: 'too-fast' });
    expect(await checkSpam(form({ [TOKEN_FIELD]: tok }), 'ip', t0 + 25 * 3600_000)).toMatchObject({ reason: 'expired' });
    expect(await checkSpam(form({ [TOKEN_FIELD]: `${t0 - 60_000}.${tok.split('.')[1]}` }), 'ip', t0 + 10_000)).toMatchObject({ reason: 'token' });
    expect(await checkSpam(form({}), 'ip', t0)).toMatchObject({ reason: 'token' });
  });
});

describe('détection du type réel des fichiers', () => {
  it('reconnaît les signatures et ignore l’extension', () => {
    expect(detectType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('image/jpeg');
    expect(detectType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))).toBe('image/png');
    expect(detectType(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]))).toBe('image/webp');
    expect(detectType(Buffer.concat([Buffer.alloc(4), Buffer.from('ftypheic'), Buffer.alloc(4)]))).toBe('image/heic');
    expect(detectType(Buffer.from('%PDF-1.4 ........'))).toBe('application/pdf');
    expect(detectType(Buffer.from('<?php echo 1; ?>....'))).toBeNull();
    expect(isImageType('application/pdf')).toBe(false);
  });
});

describe('administration : colonnes obligatoires', () => {
  it('retire les nulls des colonnes avec valeur par défaut et signale les autres', () => {
    const r = checkRequiredColumns('articles', { title: 'A', body: null, status: null, image: null });
    expect(r.errors).toEqual({ body: 'Champ obligatoire.' });
    expect(r.data).toEqual({ title: 'A', image: null });
  });
});

describe('brouillons et prévisualisation', () => {
  it('ne transmet jamais la colonne draft', () => {
    const row = { title: 'En ligne', draft: { title: 'Brouillon' } };
    expect(withDraft(row, false)).toEqual({ title: 'En ligne' });
    expect(withDraft(row, true)).toEqual({ title: 'Brouillon' });
  });
});

describe('Content-Security-Policy', () => {
  it('interdit l’affichage en cadre sauf pour l’aperçu, sur le même site', () => {
    expect(buildCsp()).toContain("frame-ancestors 'none'");
    expect(buildCsp({ allowSameOriginFrame: true })).toContain("frame-ancestors 'self'");
    expect(buildCsp()).toContain("default-src 'self'");
  });
});
