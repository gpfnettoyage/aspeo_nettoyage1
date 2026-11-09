import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('server-only', () => ({}));

import { decryptPrivateFile, encryptPrivateFile, isEncryptedFile } from '@/lib/storage/private-crypto';
import { isSafePathname, privateHref, privatePathnameOf, PRIVATE_ROUTE } from '@/lib/storage/files';

const pdf = Buffer.from('%PDF-1.4 contenu confidentiel du CV');
const env = { ...process.env };

describe('chiffrement des fichiers confidentiels', () => {
  beforeEach(() => { process.env.BETTER_AUTH_SECRET = 'x'.repeat(40); delete process.env.FILES_ENCRYPTION_KEY; });
  afterEach(() => { process.env = { ...env }; });

  it('chiffre puis restitue le contenu et les métadonnées à l’identique', () => {
    const enc = encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'mon CV é.pdf' });
    expect(isEncryptedFile(enc)).toBe(true);
    expect(enc.includes(Buffer.from('%PDF'))).toBe(false);
    expect(enc.includes(Buffer.from('mon CV'))).toBe(false);
    const { content, meta } = decryptPrivateFile(enc);
    expect(content.equals(pdf)).toBe(true);
    expect(meta).toEqual({ contentType: 'application/pdf', name: 'mon CV é.pdf' });
  });

  it('produit un résultat différent à chaque chiffrement (IV aléatoire)', () => {
    const a = encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'a.pdf' });
    const b = encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'a.pdf' });
    expect(a.equals(b)).toBe(false);
  });

  it('refuse un fichier altéré ou une mauvaise clé', () => {
    const enc = encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'a.pdf' });
    const tampered = Buffer.from(enc); tampered[30] ^= 0xff;
    expect(() => decryptPrivateFile(tampered)).toThrow();
    process.env.BETTER_AUTH_SECRET = 'y'.repeat(40);
    expect(() => decryptPrivateFile(enc)).toThrow();
  });

  it('utilise FILES_ENCRYPTION_KEY si définie et lit encore les fichiers de la clé dérivée', () => {
    const derived = encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'a.pdf' });
    process.env.FILES_ENCRYPTION_KEY = 'ab'.repeat(32);
    const dedicated = encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'b.pdf' });
    expect(dedicated[5]).toBe(1);
    expect(derived[5]).toBe(2);
    expect(decryptPrivateFile(dedicated).content.equals(pdf)).toBe(true);
    expect(decryptPrivateFile(derived).content.equals(pdf)).toBe(true);
    delete process.env.FILES_ENCRYPTION_KEY;
    expect(() => decryptPrivateFile(dedicated)).toThrow(/FILES_ENCRYPTION_KEY/);
  });

  it('rejette une clé dédiée de mauvaise longueur', () => {
    process.env.FILES_ENCRYPTION_KEY = 'trop-courte';
    expect(() => encryptPrivateFile(pdf, { contentType: 'application/pdf', name: 'a.pdf' })).toThrow(/32 octets/);
  });

  it('ne considère pas un fichier en clair comme chiffré', () => {
    expect(isEncryptedFile(pdf)).toBe(false);
  });
});

describe('adresses des fichiers privés', () => {
  it('reconnaît la route protégée et les anciennes URL Vercel Blob du dossier privé', () => {
    expect(privatePathnameOf(`${PRIVATE_ROUTE}prive/devis/abc.bin`)).toBe('prive/devis/abc.bin');
    expect(privatePathnameOf('https://xyz.public.blob.vercel-storage.com/prive/candidatures/cv-abc.pdf')).toBe('prive/candidatures/cv-abc.pdf');
    expect(privatePathnameOf('https://xyz.public.blob.vercel-storage.com/services/photo.webp')).toBeNull();
    expect(privatePathnameOf('https://exemple.com/prive/x.pdf')).toBeNull();
  });

  it('affiche toujours la route protégée, jamais l’URL de stockage', () => {
    expect(privateHref('https://xyz.public.blob.vercel-storage.com/prive/devis/photo-1.webp')).toBe(`${PRIVATE_ROUTE}prive/devis/photo-1.webp`);
  });

  it('refuse les chemins hors du dossier privé ou détournés', () => {
    expect(isSafePathname('prive/devis/abc.bin')).toBe(true);
    for (const bad of ['../.env', 'prive/../../package.json', 'public/uploads/x.webp', 'prive/devis/a b.bin', '/etc/passwd', 'prive\\..\\x']) {
      expect(isSafePathname(bad)).toBe(false);
    }
  });
});
