import 'server-only';
import sharp from 'sharp';

/**
 * Détection du type réel d'un fichier par sa signature (on ne se fie jamais à l'extension
 * ni au type annoncé par le navigateur), puis traitement des images :
 * conversion HEIC/HEIF (photos iPhone) -> JPEG, rotation EXIF, redimensionnement, WebP.
 */
export type DetectedType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/avif' | 'image/heic' | 'application/pdf' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function detectType(buf: Buffer): DetectedType | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif';
  if (buf.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('ascii');
    if (['avif', 'avis'].includes(brand)) return 'image/avif';
    if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1'].includes(brand)) return 'image/heic';
  }
  if (buf.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  if (buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return 'application/msword';
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf.includes(Buffer.from('word/'))) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return null;
}

export const isImageType = (t: DetectedType | null) => !!t && t.startsWith('image/');

export interface ProcessedImage { buffer: Buffer; width: number; height: number; contentType: 'image/webp'; extension: '.webp' }

/** Convertit une photo HEIC/HEIF en JPEG (sharp ne décode pas le HEVC des iPhone). */
async function heicToJpeg(buf: Buffer): Promise<Buffer> {
  const convert = (await import('heic-convert')).default;
  const out = await convert({ buffer: new Uint8Array(buf), format: 'JPEG', quality: 0.92 });
  return Buffer.from(out);
}

/**
 * Normalise une image : HEIC -> JPEG, orientation EXIF appliquée (puis métadonnées supprimées,
 * dont la géolocalisation), plus grand côté limité, export WebP.
 */
export async function processImage(input: Buffer, type: DetectedType, maxSide = 2400, quality = 82): Promise<ProcessedImage> {
  const source = type === 'image/heic' ? await heicToJpeg(input) : input;
  const pipeline = sharp(source, { failOn: 'error', animated: false }).rotate().resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true }).webp({ quality });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height, contentType: 'image/webp', extension: '.webp' };
}
