/**
 * Génère toutes les icônes du site à partir du pictogramme officiel ASPEO
 * (public/img/brand/aspeo-icone.svg, identique à maquettes/assets/aspeo-icone.svg).
 *
 * Le pictogramme n'est ni redessiné ni recoloré : il est seulement recadré sur son
 * contenu puis mis à l'échelle de façon uniforme (proportions conservées), avec une
 * marge adaptée à chaque usage.
 *
 * Usage : node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SOURCE = path.join(ROOT, 'public/img/brand/aspeo-icone.svg');
const OUT = path.join(ROOT, 'public/icons');
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
/** Couleur unique du pictogramme officiel (attribut fill du SVG) = orange de la charte. */
const BRAND_ORANGE = { r: 0xff, g: 0x5c, b: 0x00 };

/** Rendu haute définition du SVG, recadré sur le pictogramme (zone non transparente). */
async function masterMark() {
  const svg = await readFile(SOURCE);
  const big = await sharp(svg, { density: 144 }).resize(4000, 4000).png().toBuffer();
  return sharp(big).trim({ threshold: 1 }).png().toBuffer();
}

/** Icône carrée : pictogramme centré occupant `ratio` du côté, sur fond `background`. */
async function icon(mark, size, ratio, background) {
  const inner = Math.max(1, Math.round(size * ratio));
  // Le pictogramme officiel est d'une seule couleur (#ff5c00) : on garde la forme lissée
  // (canal alpha) et on applique exactement cette couleur, sans dérive due au lissage.
  const alpha = await sharp(mark).resize(inner, inner, { fit: 'contain', background: TRANSPARENT, kernel: 'lanczos3' }).ensureAlpha().extractChannel(3).toBuffer();
  const resized = await sharp({ create: { width: inner, height: inner, channels: 3, background: BRAND_ORANGE } }).joinChannel(alpha).png().toBuffer();
  const offset = Math.floor((size - inner) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: resized, left: offset, top: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Fichier .ico contenant des images PNG (format accepté par tous les navigateurs actuels). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const mark = await masterMark();
await mkdir(OUT, { recursive: true });

// Favicons : le pictogramme remplit presque tout le carré pour rester lisible.
const FAVICON = [16, 32, 48];
// Icônes d'application (fond transparent).
const APP = [72, 96, 144, 192, 256, 384, 512];

for (const size of FAVICON) await writeFile(path.join(OUT, `icon-${size}x${size}.png`), await icon(mark, size, 0.94, TRANSPARENT));
for (const size of APP) await writeFile(path.join(OUT, `icon-${size}x${size}.png`), await icon(mark, size, 0.86, TRANSPARENT));

// Icônes « maskable » Android : fond blanc, pictogramme dans la zone de sécurité (cercle de 80 %).
for (const size of [192, 512]) await writeFile(path.join(OUT, `icon-maskable-${size}x${size}.png`), await icon(mark, size, 0.62, WHITE));

// Apple Touch Icon : opaque (iOS n'accepte pas la transparence), fond blanc.
await writeFile(path.join(OUT, 'apple-touch-icon.png'), await icon(mark, 180, 0.76, WHITE));

// favicon.ico multi-tailles (servi par Next.js depuis src/app).
const icoPngs = [];
for (const size of FAVICON) icoPngs.push({ size, data: await icon(mark, size, 0.94, TRANSPARENT) });
await writeFile(path.join(ROOT, 'src/app/favicon.ico'), ico(icoPngs));

// Favicon SVG : même fichier, même tracé ; seule la zone affichée (viewBox) est resserrée
// sur le pictogramme (qui occupe 238→1262 sur 1500 unités), pour qu'il ne soit pas
// minuscule dans l'onglet du navigateur.
const svgText = await readFile(SOURCE, 'utf8');
const svgIcon = svgText.replace(/<svg\b[^>]*>/, (tag) => tag
  .replace(/\swidth="[^"]*"/, ' width="512"')
  .replace(/\sheight="[^"]*"/, ' height="512"')
  .replace(/\sviewBox="[^"]*"/, ' viewBox="214 214 1072 1072"'));
if (svgIcon === svgText) throw new Error('Balise <svg> introuvable dans le pictogramme officiel.');
await writeFile(path.join(OUT, 'icon.svg'), svgIcon);

console.log('Icônes générées depuis', path.relative(ROOT, SOURCE));
