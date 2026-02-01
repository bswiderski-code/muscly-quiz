import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type DurationStepConfig = {
  translationNamespace: 'DurationStep'
  durationValues: readonly string[]
  recommendedValue?: string
  ui: {
    layout: 'buttons' | 'select' | 'range'
  }
}

const CONFIG: { workout: DurationStepConfig } & Partial<Record<FunnelKey, DurationStepConfig>> = {
  workout: {
    translationNamespace: 'DurationStep',
    durationValues: ['30', '45', '60', '90'] as const,
    recommendedValue: '60',
    ui: { layout: 'range' },
  },
}

export function getDurationConfig(funnel: FunnelKey): DurationStepConfig {
  return pickFunnel(funnel, CONFIG)
}
