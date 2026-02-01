import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type SleepStepConfig = {
  translationNamespace: 'Sleep'
}

const CONFIG: { workout: SleepStepConfig } & Partial<Record<FunnelKey, SleepStepConfig>> = {
  workout: { translationNamespace: 'Sleep' },
}

export function getSleepConfig(funnel: FunnelKey): SleepStepConfig {
  return pickFunnel(funnel, CONFIG)
}
