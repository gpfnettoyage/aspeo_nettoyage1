'use client';

import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

const GoogleTrack: React.FC = () => {
  const { consentGiven } = useCookieConsent();

  if (!consentGiven) {
    return null;
  }

  return (
    <>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || ''} />
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />
    </>
  );
};

export default GoogleTrack;
