'use client';
import Script from 'next/script';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

const HotJar: React.FC = () => {
  const { consentGiven } = useCookieConsent();

  if (!consentGiven) {
    return null;
  }

  return (
    <Script
      id="hotjar-snippet"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
            h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
            h._hjSettings = {hjid: ${process.env.NEXT_PUBLIC_HOTJAR_ID}, hjsv: 6};
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
          })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
        `,
      }}
    />
  );
};

export default HotJar;
