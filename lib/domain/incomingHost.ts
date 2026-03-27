function firstHeaderValue(raw: string | null): string | null {
  const v = (raw ?? '').split(',')[0]?.trim();
  return v ? v : null;
}

/**
 * Returns the incoming host for the request: `x-forwarded-host` if present, else `Host`.
 */
export function getIncomingHost(h: Headers): string | null {
  const forwarded = firstHeaderValue(h.get('x-forwarded-host'));
  const host = firstHeaderValue(h.get('host'));
  return forwarded ?? host ?? null;
}
