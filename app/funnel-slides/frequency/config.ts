import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type FrequencyStepConfig = {
  translationNamespace: string
}

const CONFIG: { plan: FrequencyStepConfig } & Partial<Record<FunnelKey, FrequencyStepConfig>> = {
  plan: {
    translationNamespace: 'Frequency',
  },
  kalistenika: {
    translationNamespace: 'KalistenikaFrequency',
  },
}

export function getFrequencyConfig(funnel: FunnelKey): FrequencyStepConfig {
  return pickFunnel(funnel, CONFIG)
}
