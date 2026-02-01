import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type CalistenicExperienceStepConfig = {
  translationNamespace: 'CalistenicExperienceStep'
  levelValues: readonly string[]
  ui: {
    layout: 'buttons' | 'select' | 'radio'
  }
}

const CONFIG: { plan: CalistenicExperienceStepConfig } & Partial<Record<FunnelKey, CalistenicExperienceStepConfig>> = {
  plan: {
    translationNamespace: 'CalistenicExperienceStep',
    levelValues: ['none', 'just_started', 'some_experience', 'advanced'] as const,
    ui: { layout: 'buttons' },
  },
  kalistenika: {
    translationNamespace: 'CalistenicExperienceStep',
    levelValues: ['none', 'just_started', 'some_experience', 'advanced'] as const,
    ui: { layout: 'buttons' },
  },
}

export function getCalistenicExperienceConfig(funnel: FunnelKey): CalistenicExperienceStepConfig {
  return pickFunnel(funnel, CONFIG)
}
