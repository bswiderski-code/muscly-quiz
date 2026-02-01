import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type ExperienceStepValue = 'none' | 'just_started' | 'some_experience' | 'advanced'

export type ExperienceStepConfig = {
  translationNamespace: 'Experience'
  assets: {
    imageByValue: Record<ExperienceStepValue, string>
  }
}

const CONFIG: { plan: ExperienceStepConfig } & Partial<Record<FunnelKey, ExperienceStepConfig>> = {
  plan: {
    translationNamespace: 'Experience',
    assets: {
      imageByValue: {
        none: '/vectors/exercises/hammer_dumbell.svg',
        just_started: '/vectors/exercises/seated_ohp.svg',
        some_experience: '/vectors/exercises/cable_upper.svg',
        advanced: '/vectors/exercises/chest_fly.svg',
      },
    },
  },
  kalistenika: {
    translationNamespace: 'Experience',
    assets: {
      imageByValue: {
        none: '/vectors/exercises/hammer_dumbell.svg',
        just_started: '/vectors/exercises/seated_ohp.svg',
        some_experience: '/vectors/exercises/cable_upper.svg',
        advanced: '/vectors/exercises/chest_fly.svg',
      },
    },
  },
}

export function getExperienceConfig(funnel: FunnelKey): ExperienceStepConfig {
  return pickFunnel(funnel, CONFIG)
}
