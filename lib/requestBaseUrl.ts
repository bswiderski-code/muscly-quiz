import { headers } from 'next/headers';
import { defaultLocale, getBaseUrlForLocale, type Locale } from '@/i18n/config';
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
  const host = getIncomingHost(h) ?? '';
  if (!host) return undefined;
  if (!proto || !/^https?$/.test(proto)) return undefined;
  if (host.includes('\n') || host.includes('\r')) return undefined;

  const hostLower = host.toLowerCase();
  const isLocalDev = hostLower.endsWith('.local') || hostLower.includes('.local:');

  let finalHost = host;
  if (!isLocalDev) {
    finalHost = finalHost.replace(/^www\./i, '');
  }

  return `${proto}://${finalHost}`;
}

/**
 * Base URL for payment callbacks — same as {@link getBaseUrlFromHeaders} now that host
 * resolution uses the real incoming host only.
 */
export async function getRealBaseUrl(): Promise<string | undefined> {
  return getBaseUrlFromHeaders();
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
    'http://localhost:3003'
  );
}
