import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type ActivityStepConfig = {
  translationNamespace: 'Activity'
}

const CONFIG: { workout: ActivityStepConfig } & Partial<Record<FunnelKey, ActivityStepConfig>> = {
  workout: { translationNamespace: 'Activity' },
}

export function getActivityConfig(funnel: FunnelKey): ActivityStepConfig {
  return pickFunnel(funnel, CONFIG)
}
