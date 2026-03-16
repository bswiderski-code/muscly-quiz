import { STEP_SLUGS, type LocalizedStringMap } from './stepSlugs'
import type { StepId } from './stepIds'
import type { Locale } from '@/i18n/config'
import { DISABLED_STEPS, FUNNEL_STEPS_ORDER, FUNNEL_SKIP_RULES, type SkipRule } from '@/config/quiz'

export type { SkipRule }

export type LocalePricingKey = Locale

type OfferPricing = {
  amount: number
  description: string
}

type LocalePricing = {
  currency: string
  workout_solo: OfferPricing
  workout_bundle: OfferPricing
}

export type ResultTemplate = 'standard'

/**
 * Funnel definition — all configuration in one place.
 *
 * - `slug`: URL segment for the funnel (e.g., `/plan`)
 * - `resultSlug`: URL segment for results page
 * - `translationNamespace`: Translation namespace for the landing page
 * - `allowedDomains`: Optional list of domains where this funnel is available. If undefined, available on all domains.
 * - `steps.order`: Array of step IDs in funnel order
 * - `steps.skipRules`: Conditional logic to skip steps based on answers
 */
export type FunnelDefinition = {
  slug: LocalizedStringMap
  resultSlug?: LocalizedStringMap
  translationNamespace: string
  allowedDomains?: string[]
  item: string
  pricePLN: number
  currency: string
  pricing?: Partial<Record<LocalePricingKey, LocalePricing>>
  resultTemplate?: ResultTemplate
  forcedAnswers?: Record<string, string | number>
  steps: {
    order: readonly StepId[]
    slugs: Record<StepId, LocalizedStringMap>
    skipRules?: SkipRule[]
  }
}

const stepsFor = (order: readonly StepId[], skipRules?: SkipRule[]): FunnelDefinition['steps'] => ({
  order: order.filter(stepId => !DISABLED_STEPS.includes(stepId)),
  slugs: STEP_SLUGS,
  skipRules,
})

const sharedPricing: Partial<Record<LocalePricingKey, LocalePricing>> = {
  pl: {
    currency: 'PLN',
    workout_solo: { amount: 39.99, description: 'workout_solo' },
    workout_bundle: { amount: 45.99, description: 'workout_bundle' },
  },
  en: {
    currency: 'USD',
    workout_solo: { amount: 12.99, description: 'workout_solo' },
    workout_bundle: { amount: 14.99, description: 'workout_bundle' },
  },
  cz: {
    currency: 'CZK',
    workout_solo: { amount: 249, description: 'workout_solo' },
    workout_bundle: { amount: 289, description: 'workout_bundle' },
  },
  hu: {
    currency: 'HUF',
    workout_solo: { amount: 3990, description: 'workout_solo' },
    workout_bundle: { amount: 4590, description: 'workout_bundle' },
  },
  bg: {
    currency: 'EUR',
    workout_solo: { amount: 10.99, description: 'workout_solo' },
    workout_bundle: { amount: 13.99, description: 'workout_bundle' },
  },
  ro: {
    currency: 'RON',
    workout_solo: { amount: 44.99, description: 'workout_solo' },
    workout_bundle: { amount: 54.99, description: 'workout_bundle' },
  },
}

/**
 * All funnel definitions in one place.
 *
 * To add a new funnel:
 * 1. Add a new entry here
 * 2. Add translation namespace entries in i18n/translations/*.json
 * 3. Add SEO entries in config/domains/seo.ts
 */
export const funnelDefinitions = {
  workout: {
    slug: 'workout',
    resultSlug: 'workout',
    translationNamespace: 'WorkoutPage',
    allowedDomains: undefined,
    item: 'plan_treningowy',
    pricePLN: 3999,
    currency: 'PLN',
    pricing: sharedPricing,
    steps: stepsFor(FUNNEL_STEPS_ORDER, FUNNEL_SKIP_RULES),
    resultTemplate: 'standard',
  },
} satisfies Record<string, FunnelDefinition>
