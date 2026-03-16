import type { LocalizedStringMap } from './stepSlugs'
import type { StepId } from './stepIds'
import { funnelDefinitions, type FunnelDefinition } from './funnelDefinitions'
import type { Locale } from '@/i18n/config'

export type FunnelKey = keyof typeof funnelDefinitions
export const FUNNELS: Record<FunnelKey, FunnelDefinition> = funnelDefinitions

export const getFunnelSlug = (funnel: FunnelKey): string => {
  const slug = FUNNELS[funnel]?.slug
  if (!slug) throw new Error(`Unknown funnel slug for '${funnel}'`)
  return slug
}

export const getResultSlug = (funnel: FunnelKey): string => {
  const slug = FUNNELS[funnel]?.resultSlug ?? FUNNELS[funnel]?.slug
  if (!slug) throw new Error(`Unknown result slug for '${funnel}'`)
  return slug
}

export const getStepOrder = (funnel: FunnelKey): readonly StepId[] => {
  const order = FUNNELS[funnel]?.steps.order
  if (!order) throw new Error(`Unknown funnel '${funnel}'`)
  return order
}

export const getStepSlug = (funnel: FunnelKey, stepId: StepId): string => {
  const slug = FUNNELS[funnel]?.steps.slugs[stepId]
  if (!slug) throw new Error(`Unknown step slug for '${stepId}' in funnel '${funnel}'`)
  return slug
}

export const resolveFunnelKey = (slug: string): FunnelKey | null => {
  return (Object.keys(FUNNELS) as FunnelKey[]).find(key => FUNNELS[key].slug === slug) ?? null
}

export const resolveFunnelKeyByResultSlug = (slug: string): FunnelKey | null => {
  return (
    (Object.keys(FUNNELS) as FunnelKey[]).find(key => (FUNNELS[key].resultSlug ?? FUNNELS[key].slug) === slug) ?? null
  )
}

export const resolveStepId = (funnel: FunnelKey, slug: string): StepId | null => {
  const entries = Object.entries(FUNNELS[funnel]?.steps.slugs ?? {}) as [StepId, string][]
  for (const [stepId, stepSlug] of entries) {
    if (stepSlug === slug) return stepId
  }
  return null
}

export const getFirstStep = (funnel: FunnelKey): StepId => getStepOrder(funnel)[0]

export const getDefaultFunnelForLocale = (_locale: Locale): FunnelKey => 'workout'

export const isFunnelAllowedOnDomain = (funnel: FunnelKey, _host: string | null | undefined): boolean =>
  !!FUNNELS[funnel]
