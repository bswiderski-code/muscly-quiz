import type { FunnelKey } from '@/lib/funnels/funnels'

/**
 * Pick a funnel-specific config, falling back to `workout`.
 * Keep configs explicit per funnel (easy to manage all funnels in one file).
 */
export function pickFunnel<T>(funnel: FunnelKey, byFunnel: { workout: T } & Partial<Record<FunnelKey, T>>): T {
  return byFunnel[funnel] ?? byFunnel.workout
}

/**
 * Resolve `{locale}` placeholders in asset paths.
 */
export function withLocale(pathTemplate: string, locale: string): string {
  return pathTemplate.replaceAll('{locale}', locale)
}




