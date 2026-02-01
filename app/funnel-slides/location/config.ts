import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type LocationStepConfig = {
  translationNamespace: 'Location'
  assets: {
    gymImageSrc: string // supports `{locale}`
    homeImageSrc: string // supports `{locale}`
    bandsPanelYesImageSrc: string // supports `{locale}`
    bandsPanelNoImageSrc: string // supports `{locale}`
  }
}

const CONFIG: { plan: LocationStepConfig } & Partial<Record<FunnelKey, LocationStepConfig>> = {
  plan: {
    translationNamespace: 'Location',
    assets: {
      gymImageSrc: '/btns/{locale}/atgym.svg',
      homeImageSrc: '/btns/{locale}/athome.svg',
      bandsPanelYesImageSrc: '/btns/{locale}/tak_btn.svg',
      bandsPanelNoImageSrc: '/btns/{locale}/nie_btn.svg',
    },
  },
  kalistenika: {
    translationNamespace: 'Location',
    assets: {
      gymImageSrc: '/btns/{locale}/atgym.svg',
      homeImageSrc: '/btns/{locale}/athome.svg',
      bandsPanelYesImageSrc: '/btns/{locale}/tak_btn.svg',
      bandsPanelNoImageSrc: '/btns/{locale}/nie_btn.svg',
    },
  },
}

export function getLocationConfig(funnel: FunnelKey): LocationStepConfig {
  return pickFunnel(funnel, CONFIG)
}
