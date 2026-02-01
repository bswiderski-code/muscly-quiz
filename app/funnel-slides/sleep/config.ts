import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type SleepStepConfig = {
  translationNamespace: 'Sleep' | 'KalistenikaSleep'
}

const CONFIG: { plan: SleepStepConfig } & Partial<Record<FunnelKey, SleepStepConfig>> = {
  plan: { translationNamespace: 'Sleep' },
  kalistenika: { translationNamespace: 'KalistenikaSleep' },
}

export function getSleepConfig(funnel: FunnelKey): SleepStepConfig {
  return pickFunnel(funnel, CONFIG)
}
