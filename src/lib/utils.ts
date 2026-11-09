import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;

  // Création d'une nouvelle date pour l'expiration
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  // Formatage de la date d'expiration selon le format RFC
  const expires = date.toUTCString();

  // Configuration du cookie avec les paramètres de sécurité
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
};

export const getCookie = (name: string) => {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find((row) => row.startsWith(name + '='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};