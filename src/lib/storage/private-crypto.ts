import 'server-only';
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'crypto';

/**
 * Chiffrement des fichiers confidentiels (CV, photos jointes aux demandes) avant stockage.
 *
 * Le magasin Vercel Blob du site est public : un fichier y est lisible par toute personne qui
 * connaît son adresse. Les fichiers confidentiels y sont donc déposés chiffrés (AES-256-GCM) et ne
 * sont lisibles qu'à travers la route d'administration, après vérification de la session.
 *
 * Clé :
 * - FILES_ENCRYPTION_KEY (recommandé en production) : 32 octets encodés en base64 ou en hexadécimal ;
 * - à défaut, clé dérivée de BETTER_AUTH_SECRET (HKDF, usage dédié). Si ce secret change, les fichiers
 *   chiffrés avec la clé dérivée deviennent illisibles : définir FILES_ENCRYPTION_KEY évite ce lien.
 * L'identifiant de la clé est enregistré dans chaque fichier, ce qui permet de lire les deux.
 *
 * Format : "ASPF" | version (1) | identifiant de clé (1) | IV (12) | données chiffrées | tag (16).
 * Les données chiffrées contiennent : longueur des métadonnées (2) | métadonnées JSON | contenu.
 */
const MAGIC = Buffer.from('ASPF', 'ascii');
const VERSION = 1;
const KEY_DEDICATED = 1;
const KEY_DERIVED = 2;

export interface PrivateFileMeta { contentType: string; name: string }

function dedicatedKey(): Buffer | null {
  const raw = process.env.FILES_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('FILES_ENCRYPTION_KEY doit contenir 32 octets (64 caractères hexadécimaux ou base64).');
  return key;
}

function derivedKey(): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('Clé de chiffrement des fichiers indisponible : définir FILES_ENCRYPTION_KEY ou BETTER_AUTH_SECRET.');
  return Buffer.from(hkdfSync('sha256', secret, 'aspeo-fichiers-prives', 'chiffrement-v1', 32));
}

function keyFor(id: number): Buffer {
  if (id === KEY_DEDICATED) {
    const k = dedicatedKey();
    if (!k) throw new Error('Fichier chiffré avec FILES_ENCRYPTION_KEY, qui n’est pas définie.');
    return k;
  }
  if (id === KEY_DERIVED) return derivedKey();
  throw new Error('Clé de chiffrement inconnue.');
}

export const isEncryptedFile = (buf: Buffer) => buf.length > 34 && buf.subarray(0, 4).equals(MAGIC) && buf[4] === VERSION;

export function encryptPrivateFile(content: Buffer, meta: PrivateFileMeta): Buffer {
  const dedicated = dedicatedKey();
  const keyId = dedicated ? KEY_DEDICATED : KEY_DERIVED;
  const key = dedicated ?? derivedKey();
  const metaBuf = Buffer.from(JSON.stringify({ contentType: meta.contentType, name: meta.name.slice(0, 200) }), 'utf8');
  const len = Buffer.alloc(2); len.writeUInt16BE(metaBuf.length);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(Buffer.concat([len, metaBuf, content])), cipher.final()]);
  return Buffer.concat([MAGIC, Buffer.from([VERSION, keyId]), iv, body, cipher.getAuthTag()]);
}

/** Déchiffre un fichier ; lève une erreur si la clé est mauvaise ou le fichier altéré. */
export function decryptPrivateFile(buf: Buffer): { content: Buffer; meta: PrivateFileMeta } {
  if (!isEncryptedFile(buf)) throw new Error('Fichier non chiffré.');
  const key = keyFor(buf[5]!);
  const iv = buf.subarray(6, 18);
  const tag = buf.subarray(buf.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(buf.subarray(18, buf.length - 16)), decipher.final()]);
  const metaLen = plain.readUInt16BE(0);
  const meta = JSON.parse(plain.subarray(2, 2 + metaLen).toString('utf8')) as PrivateFileMeta;
  return { content: plain.subarray(2 + metaLen), meta };
}
