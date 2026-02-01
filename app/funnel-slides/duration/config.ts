import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type DurationStepConfig = {
  translationNamespace: 'DurationStep' | 'KalistenikaDuration'
  durationValues: readonly string[]
  recommendedValue?: string
  ui: {
    layout: 'buttons' | 'select' | 'range'
  }
}

const CONFIG: { plan: DurationStepConfig } & Partial<Record<FunnelKey, DurationStepConfig>> = {
  plan: {
    translationNamespace: 'DurationStep',
    durationValues: ['30', '45', '60', '90'] as const,
    recommendedValue: '60',
    ui: { layout: 'range' },
  },
  kalistenika: {
    translationNamespace: 'KalistenikaDuration',
    durationValues: ['30', '45', '60', '90'] as const,
    recommendedValue: '45',
    ui: { layout: 'range' },
  },
}

export function getDurationConfig(funnel: FunnelKey): DurationStepConfig {
  return pickFunnel(funnel, CONFIG)
}
