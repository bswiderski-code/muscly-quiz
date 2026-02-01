import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type PullupsStepConfig = {
  translationNamespace: 'PullupsStep'
  ui: {
    inputType: 'number' | 'select' | 'range'
    optionValues?: readonly string[]
  }
  validation: {
    required: boolean
    min?: number
    max?: number
  }
}

const CONFIG: { workout: PullupsStepConfig } & Partial<Record<FunnelKey, PullupsStepConfig>> = {
  workout: {
    translationNamespace: 'PullupsStep',
    ui: { inputType: 'select', optionValues: ['0', '1-3', '4-6', '7-10', '10+'] as const },
    validation: { required: true },
  },
}

export function getPullupsConfig(funnel: FunnelKey): PullupsStepConfig {
  return pickFunnel(funnel, CONFIG)
}
