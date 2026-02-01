import type { FunnelKey } from '@/lib/funnels/funnels'

/**
 * Pick a funnel-specific config, falling back to `plan`.
 * Keep configs explicit per funnel (easy to manage all funnels in one file).
 */
export function pickFunnel<T>(funnel: FunnelKey, byFunnel: { plan: T } & Partial<Record<FunnelKey, T>>): T {
  return byFunnel[funnel] ?? byFunnel.plan
}

/**
 * Resolve `{locale}` placeholders in asset paths.
 */
export function withLocale(pathTemplate: string, locale: string): string {
  return pathTemplate.replaceAll('{locale}', locale)
}




