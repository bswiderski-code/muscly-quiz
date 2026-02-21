interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every minute to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000).unref?.();

export interface RateLimitOptions {
  /** Max requests allowed within the window */
  max: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSecs * 1000;

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: opts.max - 1, resetAt: entry.resetAt };
  }

  entry.count++;
  const allowed = entry.count <= opts.max;
  return {
    allowed,
    remaining: Math.max(0, opts.max - entry.count),
    resetAt: entry.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const fwd = (req as any).headers?.get?.('x-forwarded-for') as string | null;
  if (fwd) return fwd.split(',')[0]?.trim() ?? '0.0.0.0';
  const real = (req as any).headers?.get?.('x-real-ip') as string | null;
  if (real) return real.trim();
  return '0.0.0.0';
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
      },
    }
  );
}
