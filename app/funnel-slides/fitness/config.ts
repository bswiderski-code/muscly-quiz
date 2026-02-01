import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type FitnessStepConfig = {
  translationNamespace: 'Fitness'
}

const CONFIG: { workout: FitnessStepConfig } & Partial<Record<FunnelKey, FitnessStepConfig>> = {
  workout: { translationNamespace: 'Fitness' },
}

export function getFitnessConfig(funnel: FunnelKey): FitnessStepConfig {
  return pickFunnel(funnel, CONFIG)
}
