import { getDomainLookupHost, normalizeHost } from '@/lib/domain/host';

function splitEnvList(raw: string): string[] {
  return raw
    .split(/[\s,]+/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeEnvHost(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

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

function isWildcardSuffixToken(token: string): boolean {
  return token.startsWith('*.') || token.startsWith('.');
}

function normalizeSuffixToken(token: string): string {
  const t = token.trim().toLowerCase();
  if (t.startsWith('*.')) return t.slice(1); // "*.foo.com" -> ".foo.com"
  return t; // ".foo.com" stays ".foo.com"
}

function firstHeaderValue(raw: string | null): string | null {
  const v = (raw ?? '').split(',')[0]?.trim();
  return v ? v : null;
}

function matchesDevUrl(candidateHost: string, devTokens: string[]): boolean {
  const normalizedCandidate = normalizeHost(candidateHost);
  if (!normalizedCandidate) return false;

  const lookupCandidate = getDomainLookupHost(normalizedCandidate) ?? normalizedCandidate;

  for (const token of devTokens) {
    if (isWildcardSuffixToken(token)) {
      const suffix = normalizeSuffixToken(token);
      if (suffix && normalizedCandidate.endsWith(suffix)) return true;
      continue;
    }

    const normalizedDev = normalizeEnvHost(token);
    if (!normalizedDev) continue;
    const lookupDev = getDomainLookupHost(normalizedDev) ?? normalizedDev;
    if (lookupCandidate === lookupDev) return true;
  }

  return false;
}

/**
 * Returns the "incoming" host for the request, in a dev-aware way.
 *
 * Why:
 * - In production, `x-forwarded-host` is typically the canonical "real host".
 * - In development (ngrok / reverse proxies / Caddy), `x-forwarded-host` can sometimes be the canonical
 *   website domain, while `host` is the dev tunnel domain. When that happens we must pick the dev domain
 *   so spoofing (DEV_URL -> CANONICAL_HOST) can activate reliably.
 *
 * Behavior:
 * - Production: prefer `x-forwarded-host`, fallback to `host`.
 * - Development: if DEV_URL is set and either header matches it, return the matching one; otherwise prefer
 *   `x-forwarded-host`, fallback to `host`.
 */
export function getIncomingHost(h: Headers): string | null {
  const forwarded = firstHeaderValue(h.get('x-forwarded-host'));
  const host = firstHeaderValue(h.get('host'));

  if (process.env.NODE_ENV === 'production') {
    return forwarded ?? host ?? null;
  }

  const devTokens = splitEnvList(process.env.DEV_URL ?? '');
  if (devTokens.length > 0) {
    if (host && matchesDevUrl(host, devTokens)) return host;
    if (forwarded && matchesDevUrl(forwarded, devTokens)) return forwarded;
  }

  return forwarded ?? host ?? null;
}

