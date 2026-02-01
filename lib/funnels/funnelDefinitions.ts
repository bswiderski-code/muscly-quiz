import { STEP_SLUGS, type LocalizedStringMap } from '../steps/stepSlugs'
import type { StepId } from '../steps/stepIds'
import type { Locale } from '@/i18n/config'

export type LocalePricingKey = Locale

type OfferPricing = {
  amount: number
  description: string
}

type LocalePricing = {
  currency: string
  workout_solo: OfferPricing
  workout_bundle: OfferPricing
  calisthenics_solo: OfferPricing
  calisthenics_bundle: OfferPricing
}

export type SkipRule = {
  trigger: {
    step: StepId
    value: string
  }[] // Changed to array for AND logic
  skip: StepId[]
}

export type ResultTemplate = 'standard'

/**
 * Funnel definition with all configuration in one place.
 * 
 * - `slug`: URL segment for the funnel (e.g., `/plan`)
 * - `resultSlug`: URL segment for results page (e.g., `/wynik/plan/...`)
 * - `translationNamespace`: Translation namespace for landing page (e.g., 'PlanPage', 'DomPage')
 * - `allowedDomains`: Optional list of domains where this funnel is available. If undefined/empty, available on all domains.
 * - `steps.order`: Array of step IDs in the order they appear in the funnel
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
  order,
  slugs: STEP_SLUGS,
  skipRules,
})

// Shared pricing configuration (can be reused across funnels)
const sharedPricing: Partial<Record<LocalePricingKey, LocalePricing>> = {
  pl: {
    currency: 'PLN',
    workout_solo: { amount: 35.99, description: 'workout_solo' },
    workout_bundle: { amount: 39.99, description: 'workout_bundle' },
    calisthenics_solo: { amount: 35.99, description: 'calisthenics_solo' },
    calisthenics_bundle: { amount: 39.99, description: 'calisthenics_bundle' },
  },
  en: {
    currency: 'USD',
    workout_solo: { amount: 9.99, description: 'workout_solo' },
    workout_bundle: { amount: 11.99, description: 'workout_bundle' },
    calisthenics_solo: { amount: 9.99, description: 'calisthenics_solo' },
    calisthenics_bundle: { amount: 11.99, description: 'calisthenics_bundle' },
  },
  de: {
    currency: 'EUR',
    workout_solo: { amount: 9.99, description: 'workout_solo' },
    workout_bundle: { amount: 11.99, description: 'workout_bundle' },
    calisthenics_solo: { amount: 9.99, description: 'calisthenics_solo' },
    calisthenics_bundle: { amount: 11.99, description: 'calisthenics_bundle' },
  },
  fr: {
    currency: 'EUR',
    workout_solo: { amount: 9.99, description: 'workout_solo' },
    workout_bundle: { amount: 11.99, description: 'workout_bundle' },
    calisthenics_solo: { amount: 9.99, description: 'calisthenics_solo' },
    calisthenics_bundle: { amount: 11.99, description: 'calisthenics_bundle' },
  },
  ro: {
    currency: 'RON',
    workout_solo: { amount: 39.99, description: 'workout_solo' },
    workout_bundle: { amount: 44.99, description: 'workout_bundle' },
    calisthenics_solo: { amount: 39.99, description: 'calisthenics_solo' },
    calisthenics_bundle: { amount: 44.99, description: 'calisthenics_bundle' },
  },
}

/**
 * Funnel definitions - all configuration in one place.
 * 
 * To add a new funnel:
 * 1. Add a new entry here with all required fields
 * 2. Add translation namespace entries in i18n/translations/*.json (see funnels.md guide)
 * 3. Add SEO entries in config/domains/seo.ts (see seo.md guide)
 * 
 * Notes:
 * - Keys become the `FunnelKey` union type.
 * - `slug` controls the URL segment for the funnel (e.g., `/plan`).
 * - `resultSlug` controls the URL segment used on `/wynik/[funnel]/...`.
 * - `translationNamespace` must match the key in translation files (e.g., 'PlanPage', 'DomPage').
 * - `allowedDomains` restricts funnel to specific domains. Leave undefined for all domains.
 * - `steps.order` must be a list of valid StepId values.
 */
export const funnelDefinitions = {
  workout: {
    slug: { pl: 'workout', en: 'workout', fr: 'workout', de: 'workout', ro: 'workout' },
    resultSlug: { pl: 'workout', en: 'workout', fr: 'workout', de: 'workout', ro: 'workout' },
    translationNamespace: 'WorkoutPage',
    allowedDomains: undefined, // Available on all domains
    item: 'plan_treningowy',
    pricePLN: 3999, // 39.99 PLN; change anytime
    currency: 'PLN',
    pricing: sharedPricing,
    steps: stepsFor(
      [
        'gender',
        'diet_goal',
        'height',
        'weight',
        'age',
        'bodyfat',
        'bmi',
        'activity',
        'location',
        'equipment',
        'experience',
        'difficulty',
        'priority',
        'frequency',
        'duration',
        'fitness',
        'sleep',
        'pushups',
        'pullups',
        'calistenic_experience',
      ] as const,
      [
        {
          trigger: [{ step: 'location', value: 'gym' }],
          skip: ['equipment']
        },
        {
          trigger: [
            { step: 'gender', value: 'M' },
            { step: 'location', value: 'house' }
          ],
          skip: ['pullups', 'calistenic_experience']
        }
      ]
    ),
    resultTemplate: 'standard',
  },
} satisfies Record<string, FunnelDefinition>
