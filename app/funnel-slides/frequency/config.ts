import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type FrequencyStepConfig = {
  translationNamespace: string
}

const CONFIG: { workout: FrequencyStepConfig } & Partial<Record<FunnelKey, FrequencyStepConfig>> = {
  workout: {
    translationNamespace: 'Frequency',
  },
}

export function getFrequencyConfig(funnel: FunnelKey): FrequencyStepConfig {
  return pickFunnel(funnel, CONFIG)
}
