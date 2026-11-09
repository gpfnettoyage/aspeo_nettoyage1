import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import './site.css';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import GoogleTrack from '@/components/common/analytics/GoogleAnalytics';
import HotJar from '@/components/common/analytics/HotJar';
import { Analytics } from '@vercel/analytics/next';
import { COMPANY } from '@/constants/company';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-montserrat', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 };

// Métadonnées par défaut : chaque page publique les remplace via generateMetadata
// (titres/descriptions administrables, cf. src/lib/site/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.website),
  title: 'Nettoyage professionnel Loire & Rhône | ASPEO',
  description:
    'Nettoyage de bureaux, commerces, sites industriels et chantiers, interventions Diogène et logements insalubres en Loire et Rhône. Devis gratuit après visite.',
  // Le manifeste est servi par src/app/manifest.ts (/manifest.webmanifest, lien ajouté par Next.js).
  authors: [{ name: COMPANY.name }],
  // Icônes générées depuis le pictogramme officiel (scripts/generate-icons.mjs).
  // favicon.ico est servi automatiquement depuis src/app.
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <CookieConsentProvider>
          {children}
          <HotJar />
          <GoogleTrack />
          <Analytics />
          <Toaster />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
