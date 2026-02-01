import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type PushupsStepConfig = {
  translationNamespace: 'PushupsStep'
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

const CONFIG: { plan: PushupsStepConfig } & Partial<Record<FunnelKey, PushupsStepConfig>> = {
  plan: {
    translationNamespace: 'PushupsStep',
    ui: { inputType: 'select', optionValues: ['0-5', '6-10', '11-20', '21-30', '30+'] as const },
    validation: { required: true },
  },
  kalistenika: {
    translationNamespace: 'PushupsStep',
    ui: { inputType: 'select', optionValues: ['0-5', '6-10', '11-20', '21-30', '30+'] as const },
    validation: { required: true },
  },
}

export function getPushupsConfig(funnel: FunnelKey): PushupsStepConfig {
  return pickFunnel(funnel, CONFIG)
}
