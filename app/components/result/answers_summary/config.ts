import type { FunnelKey } from '@/lib/funnels/funnels'
import type { StepId } from '@/lib/steps/stepIds'

/**
 * Configuration for which answer labels should be visible in the answers summary
 * for each funnel type. Some answers are hidden by default (like BMI calculations),
 * and some are only shown for specific funnel conditions (like equipment for home plans).
 */
export type AnswersSummaryConfig = {
  /** Step IDs that should be hidden globally */
  hiddenKeys: Set<StepId | string>
  /** Step IDs that should be visible for this funnel (undefined means show all non-hidden) */
  visibleKeys?: Set<StepId | string>
  /** Special rules for conditional visibility */
  conditionalRules?: {
    /** Only show equipment answers when it's a home plan */
    equipmentOnlyForHome?: boolean
  }
}

const CONFIG: { workout: AnswersSummaryConfig } & Partial<Record<FunnelKey, AnswersSummaryConfig>> = {
  workout: {
    hiddenKeys: new Set(['bmi', 'usedMetric', 'weight_raw', 'weight_goal_raw', 'height_raw']),
    conditionalRules: {
      equipmentOnlyForHome: true,
    },
  },
}

/**
 * Get the answers summary configuration for a specific funnel
 */
export function getAnswersSummaryConfig(funnel: FunnelKey): AnswersSummaryConfig {
  return CONFIG[funnel] || CONFIG.workout
}
