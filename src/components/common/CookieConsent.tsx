'use client';
import { CookieIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CookieConsent({
  demo = false,
  onAcceptCallback = () => { },
  onDeclineCallback = () => { },
}) {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const { giveConsent, revokeConsent } = useCookieConsent();

  useEffect(() => {
    const showConsent = () => {
      // Pas de bandeau dans l'aperçu intégré à l'administration (page affichée en cadre).
      if (window.self !== window.top) return;
      const cookieConsent = document.cookie.includes('cookieConsent=true');
      if (!cookieConsent || demo) {
        setIsVisible(true);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        showConsent();
      });
    } else {
      setTimeout(showConsent, 1500);
    }
  }, [demo]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName === 'opacity' && !isVisible) {
        e.currentTarget.remove();
      }
    },
    [isVisible],
  );

  const accept = () => {
    setIsVisible(false);
    giveConsent();
    onAcceptCallback();
    window.dispatchEvent(new Event('activateHotjar'));
  };

  const decline = () => {
    setIsVisible(false);
    revokeConsent();
    onDeclineCallback();
  };

  if (!isVisible) return null;

  if (isMobile) {
    return (
      <Drawer open={isVisible} onOpenChange={setIsVisible}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <DrawerTitle>Le site utilise des cookies</DrawerTitle>
                <CookieIcon className="size-6" />
              </div>
              <DrawerDescription className="text-start">
                Le site utilise des cookies pour améliorer votre expérience. Ces
                cookies aident à comprendre comment vous interagissez avec le
                contenu et à optimiser le site pour vous offrir une navigation
                fluide et personnalisée.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <p className="text-xs">
                En cliquant sur
                <span className="font-medium"> Accepter</span>, vous acceptez
                l&apos;utilisation des cookies.
              </p>
              <Link
                href="/politique-des-cookies"
                className="mt-2 inline-block text-xs underline"
                tabIndex={isVisible ? 0 : -1}
              >
                En savoir plus.
              </Link>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button
                  onClick={decline}
                  className="w-full"
                  variant="secondary"
                  tabIndex={isVisible ? 0 : -1}
                >
                  Refuser
                </Button>
                <Button 
                  onClick={accept} 
                  className="w-full"
                  tabIndex={isVisible ? 0 : -1}
                >
                  Accepter
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 right-0 z-20 w-full max-w-sm transition-all duration-300 ease-in-out md:max-w-md',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className="m-2 rounded-lg border bg-background"
        style={{
          contain: 'paint',
          contentVisibility: 'auto',
        }}
      >
        <div className="grid gap-2">
          <div className="flex h-14 items-center justify-between border-b border-border p-4">
            <p className="text-lg font-medium">Le site utilise des cookies</p>
            <CookieIcon className="size-6" />
          </div>
          <div className="p-4">
            <p
              className="text-sm font-normal"
              style={{ contentVisibility: 'auto' }}
            >
              <span className="block text-muted-foreground">
                Le site utilise des cookies pour améliorer votre expérience. Ces
                cookies aident à comprendre comment vous interagissez avec le
                contenu et à optimiser le site pour vous offrir une navigation
                fluide et personnalisée.
              </span>
              <span className="mt-4 block text-xs">
                En cliquant sur
                <span className="font-medium"> Accepter</span>, vous acceptez
                l&apos;utilisation des cookies.
              </span>
              <Link
                href="/politique-des-cookies"
                className="mt-2 inline-block text-xs underline"
                tabIndex={isVisible ? 0 : -1}
              >
                En savoir plus.
              </Link>
            </p>
          </div>
          <div className="flex gap-2 border-t border-border bg-background/20 p-4 py-5">
            <Button 
              onClick={decline} 
              className="w-full" 
              variant="secondary"
              tabIndex={isVisible ? 0 : -1}
            >
              Refuser
            </Button>
            <Button 
              onClick={accept} 
              className="w-full"
              tabIndex={isVisible ? 0 : -1}
            >
              Accepter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
