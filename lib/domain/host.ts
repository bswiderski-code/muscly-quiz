export function normalizeHost(host: string): string {
  // Header can be: "example.com", "example.com:3000", "[::1]:3000", or a comma-separated list.
  const trimmed = host.split(',')[0]?.trim().toLowerCase() ?? '';
  if (!trimmed) return '';
  if (trimmed.startsWith('[')) {
    const idx = trimmed.indexOf(']');
    return idx >= 0 ? trimmed.slice(0, idx + 1) : trimmed;
  }
  return trimmed.split(':')[0] ?? trimmed;
}

export function getConfiguredSubdomainPrefixes(): string[] {
  return [];
}

/**
 * Normalizes a host and removes alias prefixes like:
 * - "www."
 * - "<configuredPrefix>." (e.g. "start.")
 *
 * This allows treating "start.domain.com" as the same website as "domain.com"
 * without hardcoding the prefix.
 */
export function getDomainLookupHost(host: string | null | undefined): string | null {
  if (!host) return host ?? null;
  const normalized = normalizeHost(host);
  if (!normalized) return null;

  let lookupHost = normalized;

  if (lookupHost.startsWith('www.')) {
    lookupHost = lookupHost.substring(4);
  }

  for (const prefix of getConfiguredSubdomainPrefixes()) {
    const needle = `${prefix}.`;
    if (lookupHost.startsWith(needle)) {
      lookupHost = lookupHost.substring(needle.length);
      break;
    }
  }

  return lookupHost;
}


