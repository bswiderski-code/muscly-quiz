import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type GenderStepConfig = {
  translationNamespace: 'Gender'
  assets: {
    maleImageSrc: string // supports `{locale}`
    femaleImageSrc: string // supports `{locale}`
  }
}

const CONFIG: { workout: GenderStepConfig } & Partial<Record<FunnelKey, GenderStepConfig>> = {
  workout: {
    translationNamespace: 'Gender',
    assets: {
      maleImageSrc: '/btns/{locale}/male.svg',
      femaleImageSrc: '/btns/{locale}/female.svg',
    },
  },
}

export function getGenderConfig(funnel: FunnelKey): GenderStepConfig {
  return pickFunnel(funnel, CONFIG)
}
