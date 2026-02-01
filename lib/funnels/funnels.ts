import { defaultLocale, type Locale, getEffectiveHost, getMarketForLocale } from '@/i18n/config'
import { getDomainLookupHost } from '@/lib/domain/host'
import type { LocalizedStringMap } from '../steps/stepSlugs'
import type { StepId } from '../steps/stepIds'
import { funnelDefinitions, type FunnelDefinition } from './funnelDefinitions'

export type FunnelKey = keyof typeof funnelDefinitions
export const FUNNELS: Record<FunnelKey, FunnelDefinition> = funnelDefinitions

const fallback = <T>(map: LocalizedStringMap | undefined, locale?: string): T | undefined => {
  if (!map) return undefined
  return (map[(locale as Locale) ?? defaultLocale] ?? map[defaultLocale] ?? Object.values(map)[0]) as T | undefined
}

export const getFunnelSlug = (funnel: FunnelKey, locale?: string): string => {
  const slug = fallback<string>(FUNNELS[funnel]?.slug, locale)
  if (!slug) throw new Error(`Unknown funnel slug for '${funnel}'`)
  return slug
}

export const getResultSlug = (funnel: FunnelKey, locale?: string): string => {
  const slug = fallback<string>(FUNNELS[funnel]?.resultSlug ?? FUNNELS[funnel]?.slug, locale)
  if (!slug) throw new Error(`Unknown result slug for '${funnel}'`)
  return slug
}

export const getStepOrder = (funnel: FunnelKey): readonly StepId[] => {
  const order = FUNNELS[funnel]?.steps.order
  if (!order) throw new Error(`Unknown funnel '${funnel}'`)
  return order
}

export const getStepSlug = (funnel: FunnelKey, stepId: StepId, locale?: string): string => {
  const slug = fallback<string>(FUNNELS[funnel]?.steps.slugs[stepId], locale)
  if (!slug) throw new Error(`Unknown step slug for '${stepId}' in funnel '${funnel}'`)
  return slug
}

export const resolveFunnelKey = (slug: string, locale?: string): FunnelKey | null => {
  return (Object.keys(FUNNELS) as FunnelKey[]).find((key) => {
    const target = fallback<string>(FUNNELS[key].slug, locale)
    return target === slug
  }) ?? null
}

export const resolveFunnelKeyByResultSlug = (slug: string, locale?: string): FunnelKey | null => {
  return (Object.keys(FUNNELS) as FunnelKey[]).find((key) => {
    const target = fallback<string>(FUNNELS[key].resultSlug ?? FUNNELS[key].slug, locale)
    return target === slug
  }) ?? null
}

export const resolveStepId = (funnel: FunnelKey, slug: string, locale?: string): StepId | null => {
  const entries = Object.entries(FUNNELS[funnel]?.steps.slugs ?? {}) as [StepId, LocalizedStringMap][]
  for (const [stepId, slugs] of entries) {
    if (fallback<string>(slugs, locale) === slug) return stepId
  }
  return null
}

export const getFirstStep = (funnel: FunnelKey): StepId => {
  const order = getStepOrder(funnel)
  return order[0]
}

/**
 * Get the default funnel for a locale.
 */
export const getDefaultFunnelForLocale = (locale: Locale): FunnelKey => {
  const marketInfo = getMarketForLocale(locale);
  if (marketInfo.funnels && marketInfo.funnels.length > 0) {
    const firstFunnel = marketInfo.funnels[0] as FunnelKey;
    if (FUNNELS[firstFunnel]) return firstFunnel;
  }
  return 'workout'; // Ultimate fallback
}

/**
 * Deprecated: use getDefaultFunnelForLocale instead.
 */
export const getDefaultFunnelForHost = (host: string | null | undefined): FunnelKey => {
  return 'workout'; 
}

/**
 * Check if a funnel is allowed on the given domain/locale.
 * Since we have one domain now, we primarily check if the funnel exists
 * and if it's assigned to the market/locale.
 */
export const isFunnelAllowedOnDomain = (funnel: FunnelKey, host: string | null | undefined): boolean => {
  return !!FUNNELS[funnel];
}
