import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type DifficultyStepConfig = {
  translationNamespace: 'Difficulty'
}

const CONFIG: { plan: DifficultyStepConfig } & Partial<Record<FunnelKey, DifficultyStepConfig>> = {
  plan: { translationNamespace: 'Difficulty' },
  kalistenika: { translationNamespace: 'Difficulty' },
}

export function getDifficultyConfig(funnel: FunnelKey): DifficultyStepConfig {
  return pickFunnel(funnel, CONFIG)
}
