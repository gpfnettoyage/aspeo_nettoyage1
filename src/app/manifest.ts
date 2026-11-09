import { MetadataRoute } from 'next';
import { COMPANY } from '@/constants/company';

/** Tailles générées depuis le pictogramme officiel ASPEO (scripts/generate-icons.mjs). */
const SIZES = [16, 32, 48, 72, 96, 144, 192, 256, 384, 512];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY.name,
    short_name: 'ASPEO',
    description: 'Services de nettoyage professionnel en Loire et Rhône',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    // Orange de la charte ASPEO (identique au pictogramme officiel).
    theme_color: '#ff5c00',
    icons: [
      ...SIZES.map((s) => ({ src: `/icons/icon-${s}x${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'any' as const })),
      // Fond blanc et zone de sécurité : utilisées par Android pour les icônes adaptatives.
      { src: '/icons/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' as const },
      { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' as const },
    ],
  };
}
