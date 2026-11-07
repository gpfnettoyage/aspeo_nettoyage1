'use client';
import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  FunctionComponent,
  useSyncExternalStore,
} from 'react';
import { getCookie, setCookie, removeCookie } from '@/lib/utils';

type CookieConsentContextType = {
  consentGiven: boolean;
  giveConsent: () => void;
  revokeConsent: () => void;
};

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

export const useCookieConsent = (): CookieConsentContextType => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider',
    );
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

// Cookie consent store for useSyncExternalStore
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return getCookie('cookieConsent') === 'true';
}

function getServerSnapshot() {
  return false; // Default to false on server
}

export const CookieConsentProvider: FunctionComponent<
  CookieConsentProviderProps
> = ({ children }) => {
  // Use useSyncExternalStore to sync with cookie storage
  const consentGiven = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const giveConsent = useCallback(() => {
    setCookie('cookieConsent', 'true', 365); // Set for 1 year
    emitChange();
  }, []);

  const revokeConsent = useCallback(() => {
    removeCookie('cookieConsent');
    emitChange();
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{ consentGiven, giveConsent, revokeConsent }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};
