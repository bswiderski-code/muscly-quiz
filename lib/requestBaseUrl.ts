import { headers } from 'next/headers';
import { defaultLocale, getBaseUrlForLocale, getEffectiveHost, type Locale } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';

/**
 * Builds a base URL (scheme + host) from forwarded headers.
 * Note: This reflects the *incoming* host. For SEO canonicals, prefer using
 * a configured canonical base URL (from config/domains) if you want strict host normalization.
 */
export async function getBaseUrlFromHeaders(): Promise<string | undefined> {
  const h = await headers();
  const defaultProto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const proto = (h.get('x-forwarded-proto') ?? defaultProto).split(',')[0]?.trim();
  let host = getIncomingHost(h) ?? '';
  if (!host) return undefined;
  if (!proto || !/^https?$/.test(proto)) return undefined;
  if (host.includes('\n') || host.includes('\r')) return undefined;

  // Dev-only: optionally spoof the effective host to test domain-specific config on another URL.
  // We use this for logic (market, locale, etc.) but for some things (like payment callbacks)
  // we might need the real host.
  const effectiveHost = getEffectiveHost(host) ?? host;

  // Local dev exception: do not enforce canonical host logic.
  const hostLower = effectiveHost.toLowerCase();
  const isLocalDev = hostLower.endsWith('.local') || hostLower.includes('.local:');

  let finalHost = effectiveHost;
  // Production rule: www is never canonical.
  if (!isLocalDev) {
    finalHost = finalHost.replace(/^www\./i, '');
  }

  return `${proto}://${finalHost}`;
}

/**
 * Returns the REAL base URL of the incoming request, bypassing any spoofing.
 * Crucial for payment notifications/callbacks to reach the current environment.
 */
export async function getRealBaseUrl(): Promise<string | undefined> {
  const h = await headers();
  const defaultProto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const proto = (h.get('x-forwarded-proto') ?? defaultProto).split(',')[0]?.trim();
  let host = getIncomingHost(h) ?? '';
  if (!host) return undefined;
  if (!proto || !/^https?$/.test(proto)) return undefined;
  if (host.includes('\n') || host.includes('\r')) return undefined;

  return `${proto}://${host}`;
}

/**
 * Best-effort base URL resolver:
 * - Prefer the incoming request host (x-forwarded-host/host) so each domain behaves as its own website.
 * - Fallback to the configured domain for the locale (from config/domains.json).
 * - Final fallback: localhost (dev safety).
 */
export async function getBaseUrl(preferredLocale?: Locale): Promise<string> {
  return (
    (await getBaseUrlFromHeaders()) ||
    getBaseUrlForLocale(preferredLocale ?? defaultLocale) ||
    'http://localhost:3000'
  );
}
