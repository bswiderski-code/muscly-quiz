import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type FitnessStepConfig = {
  translationNamespace: 'Fitness' | 'KalistenikaFitness'
}

const CONFIG: { plan: FitnessStepConfig } & Partial<Record<FunnelKey, FitnessStepConfig>> = {
  plan: { translationNamespace: 'Fitness' },
  kalistenika: { translationNamespace: 'KalistenikaFitness' },
}

export function getFitnessConfig(funnel: FunnelKey): FitnessStepConfig {
  return pickFunnel(funnel, CONFIG)
}
