import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

/**
 * Protection anti-spam des formulaires publics, en trois couches :
 * 1. champ piège invisible (« honeypot ») qui doit rester vide ;
 * 2. jeton horodaté signé : un envoi moins de 3 s après l'affichage (robot) ou plus de 24 h après est refusé ;
 * 3. limitation de débit par IP (Upstash Redis si configuré, sinon mémoire du serveur).
 * Cloudflare Turnstile est vérifié en plus si TURNSTILE_SECRET_KEY et NEXT_PUBLIC_TURNSTILE_SITE_KEY sont définis.
 */
export const HONEYPOT_FIELD = 'site_web';
export const TOKEN_FIELD = 'form_ts';
const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 24 * 3600_000;

const secret = () => process.env.FORM_TOKEN_SECRET || process.env.BETTER_AUTH_SECRET || 'aspeo-dev-form-secret';
const sign = (ts: string) => createHmac('sha256', secret()).update(`form:${ts}`).digest('hex').slice(0, 32);

/** Jeton à placer dans un champ caché lors de l'affichage du formulaire. */
export function createFormToken(now = Date.now()): string {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

export type SpamCheck = { ok: true } | { ok: false; reason: 'honeypot' | 'token' | 'too-fast' | 'expired' | 'captcha' };

export async function checkSpam(formData: FormData, ip: string, now = Date.now()): Promise<SpamCheck> {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return { ok: false, reason: 'honeypot' };

  const token = String(formData.get(TOKEN_FIELD) ?? '');
  const [ts, mac] = token.split('.');
  if (!ts || !mac || !/^\d+$/.test(ts)) return { ok: false, reason: 'token' };
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: 'token' };
  const age = now - Number(ts);
  if (age < MIN_AGE_MS) return { ok: false, reason: 'too-fast' };
  if (age > MAX_AGE_MS) return { ok: false, reason: 'expired' };

  // Vérifié seulement si le widget est aussi affiché (clé publique définie) : sinon tous les envois échoueraient.
  if (process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    const response = String(formData.get('cf-turnstile-response') ?? '');
    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response, remoteip: ip }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!json.success) return { ok: false, reason: 'captcha' };
    } catch {
      return { ok: false, reason: 'captcha' };
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------- Limitation de débit

const hasRedis = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const limiters = new Map<string, Ratelimit>();
const memory = new Map<string, number[]>();

/**
 * Limite le nombre d'envois par clé (IP hachée) sur une fenêtre glissante.
 * Sans Redis, repli en mémoire (suffisant en développement ; en production, configurer Upstash).
 */
export async function formRateLimit(scope: string, key: string, max: number, windowSec: number): Promise<boolean> {
  if (hasRedis) {
    let limiter = limiters.get(scope);
    if (!limiter) {
      limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(max, `${windowSec} s`), prefix: `ratelimit:form:${scope}` });
      limiters.set(scope, limiter);
    }
    try {
      return (await limiter.limit(key)).success;
    } catch (error) {
      console.error('[forms] limitation Redis indisponible, repli en mémoire', error);
    }
  }
  const id = `${scope}:${key}`;
  const now = Date.now();
  const hits = (memory.get(id) ?? []).filter((t) => now - t < windowSec * 1000);
  if (hits.length >= max) { memory.set(id, hits); return false; }
  hits.push(now);
  memory.set(id, hits);
  if (memory.size > 5000) memory.clear();
  return true;
}
