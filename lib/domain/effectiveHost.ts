import { getDomainLookupHost, normalizeHost } from '@/lib/domain/host';
import { CANONICAL_HOST } from '@/config/site';

function normalizeEnvHost(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // Accept values like:
  // - "example.com"
  // - "example.com:3000"
  // - "https://example.com/some/path"
  // - "http://example.com:3000"
  let candidate = trimmed;
  try {
    if (candidate.includes('://')) {
      candidate = new URL(candidate).host;
    }
  } catch {
    // ignore parse errors and fallback to string ops
  }
  candidate = candidate.split('/')[0] ?? candidate;
  return normalizeHost(candidate);
}

function splitEnvList(raw: string): string[] {
  return raw
    .split(/[\s,]+/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

function isLocalhostNormalizedHost(normalizedHost: string): boolean {
  return (
    normalizedHost === '' ||
    normalizedHost === 'localhost' ||
    normalizedHost.endsWith('.localhost') ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost.startsWith('127.0.0.1.') ||
    normalizedHost === '[::1]'
  );
}

function isWildcardSuffixToken(token: string): boolean {
  return token.startsWith('*.') || token.startsWith('.');
}

function normalizeSuffixToken(token: string): string {
  const t = token.trim().toLowerCase();
  if (t.startsWith('*.')) return t.slice(1); // "*.foo.com" -> ".foo.com"
  return t; // ".foo.com" stays ".foo.com"
}

/**
 * Dev-only: allow running on a dev host (DEV_URL) while treating the app as if it was accessed via CANONICAL_HOST.
 *
 * Env:
 * - DEV_URL: where you actually access the dev server (e.g. ngrok host). Can be a comma/space-separated list.
 *            Also supports wildcard suffix tokens like "*.ngrok-free.app" (or ".ngrok-free.app").
 * - SPOOFING: set to "true" to enable this behavior.
 *
 * Notes:
 * - In production, spoofing is always disabled.
 * - On localhost/127.0.0.1/[::1], spoofing is allowed as long as SPOOFING is "true".
 * - On non-localhost hosts, spoofing only applies when DEV_URL matches the current host (or a wildcard suffix).
 */
export function getEffectiveHost(host: string | null | undefined): string | null {
  if (!host) return host ?? null;

  // Never spoof in production.
  if (process.env.NODE_ENV === 'production') return host;

  // Explicitly check for SPOOFING flag
  if (process.env.SPOOFING !== 'true') return host;

  const normalizedSpoofed = normalizeEnvHost(CANONICAL_HOST);
  if (!normalizedSpoofed) return host;

  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) return host;

  // Localhost development: if SPOOFING is "true", always allow spoofing.
  if (isLocalhostNormalizedHost(normalizedHost)) {
    return normalizedSpoofed;
  }

  // Non-localhost: only spoof when DEV_URL matches the current host.
  const devUrlRaw = process.env.DEV_URL ?? '';
  const devTokens = splitEnvList(devUrlRaw);
  if (devTokens.length === 0) return host;

  // We compare lookup hosts to ignore "www." and configured prefixes (like "start.").
  const lookupHost = getDomainLookupHost(normalizedHost) ?? normalizedHost;

  for (const token of devTokens) {
    if (isWildcardSuffixToken(token)) {
      const suffix = normalizeSuffixToken(token);
      if (suffix && normalizedHost.endsWith(suffix)) return normalizedSpoofed;
      continue;
    }

    const normalizedDevUrl = normalizeEnvHost(token);
    if (!normalizedDevUrl) continue;

    const lookupDevUrl = getDomainLookupHost(normalizedDevUrl) ?? normalizedDevUrl;
    if (lookupHost === lookupDevUrl) return normalizedSpoofed;
  }

  return host;
}

