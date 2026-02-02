import { defaultLocale, type Locale, getMarketForLocale } from '@/i18n/config'
import type { LocalizedStringMap } from '../steps/stepSlugs'
import type { StepId } from '../steps/stepIds'
import { funnelDefinitions, type FunnelDefinition } from './funnelDefinitions'

export type FunnelKey = keyof typeof funnelDefinitions
export const FUNNELS: Record<FunnelKey, FunnelDefinition> = funnelDefinitions

export const getFunnelSlug = (funnel: FunnelKey, locale?: string): string => {
  const slug = FUNNELS[funnel]?.slug
  if (!slug) throw new Error(`Unknown funnel slug for '${funnel}'`)
  return slug
}

export const getResultSlug = (funnel: FunnelKey, locale?: string): string => {
  const slug = FUNNELS[funnel]?.resultSlug ?? FUNNELS[funnel]?.slug
  if (!slug) throw new Error(`Unknown result slug for '${funnel}'`)
  return slug
}

export const getStepOrder = (funnel: FunnelKey): readonly StepId[] => {
  const order = FUNNELS[funnel]?.steps.order
  if (!order) throw new Error(`Unknown funnel '${funnel}'`)
  return order
}

export const getStepSlug = (funnel: FunnelKey, stepId: StepId, locale?: string): string => {
  const slug = FUNNELS[funnel]?.steps.slugs[stepId]
  if (!slug) throw new Error(`Unknown step slug for '${stepId}' in funnel '${funnel}'`)
  return slug
}

export const resolveFunnelKey = (slug: string, locale?: string): FunnelKey | null => {
  return (Object.keys(FUNNELS) as FunnelKey[]).find((key) => {
    return FUNNELS[key].slug === slug
  }) ?? null
}

export const resolveFunnelKeyByResultSlug = (slug: string, locale?: string): FunnelKey | null => {
  return (Object.keys(FUNNELS) as FunnelKey[]).find((key) => {
    return (FUNNELS[key].resultSlug ?? FUNNELS[key].slug) === slug
  }) ?? null
}

export const resolveStepId = (funnel: FunnelKey, slug: string, locale?: string): StepId | null => {
  const entries = Object.entries(FUNNELS[funnel]?.steps.slugs ?? {}) as [StepId, string][]
  for (const [stepId, stepSlug] of entries) {
    if (stepSlug === slug) return stepId
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
  // Always default to workout since it's the only one for now
  return 'workout';
}

/**
 * Deprecated: use getDefaultFunnelForLocale instead.
 */
export const getDefaultFunnelForHost = (host: string | null | undefined): FunnelKey => {
  return 'workout';
}

/**
 * Check if a funnel is allowed.
 * Since we have one domain now, we primarily check if the funnel exists.
 */
export const isFunnelAllowedOnDomain = (funnel: FunnelKey, host: string | null | undefined): boolean => {
  return !!FUNNELS[funnel];
}
