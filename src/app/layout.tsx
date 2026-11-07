import type { Metadata } from 'next';
// import { League_Spartan } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/nav/Nav';
import Footer from '@/components/layout/footer/Footer';
import { Toaster } from '@/components/ui/sonner';
// import SocialSidebar from '@/components/layout/SocialSidebar';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import CookieConsent from '@/components/common/CookieConsent';
import GoogleTrack from '@/components/common/analytics/GoogleAnalytics';
import { Analytics } from "@vercel/analytics/next"
import HotJar from '@/components/common/analytics/HotJar';
import { COMPANY } from '@/constants/company';
import { getServices, getServicesForNav } from '@/lib/services';

// const leagueSpartan = League_Spartan({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.website),
  title: 'ASPEO Nettoyage Loire & Rhône - Entreprise de Nettoyage Professionnel',
  description:
    'ASPEO offre des services de nettoyage professionnel pour bureaux, commerces et industries en Loire (42) et Rhône (69). Contactez-nous pour un devis gratuit.',
  keywords: [
    // Services principaux
    'nettoyage bâtiment',
    'nettoyage vitres',
    'nettoyage logement insalubre',
    'nettoyage piscine',
    'nettoyage panneaux photovoltaïques',
    'nettoyage bureaux',
    'nettoyage locaux commerciaux',
    'nettoyage après sinistre',
    'nettoyage après décès',
    'nettoyage après travaux',

    // Expertise
    'nettoyage après chantier',
    'nettoyage industriel',
    'nettoyage fin de chantier',
    'désinfection locaux',
    'nettoyage moquette',

    // Localisation
    'nettoyage Saint-Étienne',
    'nettoyage Roanne',
    'nettoyage Firminy',
    'nettoyage Montbrison',
    'nettoyage 42',
    'nettoyage 69',
    'entreprise de nettoyage Saint-Étienne',
    'nettoyage Lyon',
    'nettoyage Clermont-Ferrand',
    'nettoyage Auvergne-Rhône-Alpes',

    // Services spécifiques
    'nettoyage régulier',
    'nettoyage ponctuel',
    'prestations de nettoyage',
    'entretien de locaux',

    // Secteurs d'activité
    'nettoyage entreprises',
    'nettoyage commerces',
    'nettoyage bureaux Loire',
    'services de propreté entreprises',

    // Mots-clés généraux
    'Aspeo',
    'nettoyage professionnel',
    'services de nettoyage',
    'nettoyage de bureaux',
    'désinfection',
    'nettoyage à domicile',
    'nettoyage de façades',
  ].join(', '),
  manifest: '/manifest.json',
  authors: [{ name: COMPANY.name }],
  openGraph: {
    title: 'ASPEO Nettoyage Loire & Rhône - Entreprise de Nettoyage Professionnel',
    description:
      'ASPEO offre des services de nettoyage professionnel pour bureaux, commerces et industries en Loire (42) et Rhône (69). Contactez-nous pour un devis gratuit.',
    url: COMPANY.website,
    siteName: COMPANY.name,
    images: [
      {
        url: `${COMPANY.website}/img/logo/logo.png`,
        alt: `${COMPANY.name} Logo`,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASPEO Nettoyage Loire & Rhône - Entreprise de Nettoyage Professionnel',
    description:
      'ASPEO offre des services de nettoyage professionnel pour bureaux, commerces et industries en Loire (42) et Rhône (69). Contactez-nous pour un devis gratuit.',
    images: [
      {
        url: `${COMPANY.website}/img/logo/logo.png`,
        alt: `${COMPANY.name} Logo`,
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-32x32.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch services for Footer and Nav
  const [services, navCategories] = await Promise.all([
    getServices(),
    getServicesForNav(),
  ]);

  return (
    <html lang="fr">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/icons/icon-256x256.png" />
        <link rel="icon" type="image/png" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body className={``}>
        <CookieConsentProvider>
          <Navbar categories={navCategories} />
          <main>
            {children}
          </main>
          <CookieConsent />
          <HotJar />
          <GoogleTrack />
          <Analytics />
          <Footer services={services} />
          <Toaster />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
