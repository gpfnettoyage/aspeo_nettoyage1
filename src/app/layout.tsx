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
  manifest: '/manifest.json',
  authors: [{ name: COMPANY.name }],
  icons: {
    icon: [
      { url: '/img/brand/aspeo-icone.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/icons/icon-32x32.png',
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
