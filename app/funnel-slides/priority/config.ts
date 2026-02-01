import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type PriorityStepConfig = {
  translationNamespace: 'Priority' | 'KalistenikaPriority'
  prioritiesMale: readonly string[]
  prioritiesFemale: readonly string[]
  assets: {
    imageBasePath: string // supports `{locale}` (expects `/selected` + `/unselected` below it)
  }
  preloadImages: boolean
}

const CONFIG: { plan: PriorityStepConfig } & Partial<Record<FunnelKey, PriorityStepConfig>> = {
  plan: {
    translationNamespace: 'Priority',
    prioritiesMale: ['shoulders', 'chest', 'triceps', 'biceps', 'back', 'legs', 'abs', 'forearms'] as const,
    prioritiesFemale: ['legs', 'glutes', 'abs', 'chest', 'triceps', 'biceps', 'back', 'shoulders'] as const,
    assets: { imageBasePath: '/priorities/needle/{locale}' },
    preloadImages: true,
  },
  kalistenika: {
    translationNamespace: 'KalistenikaPriority',
    prioritiesMale: ['shoulders', 'chest', 'triceps', 'biceps', 'back', 'legs', 'abs', 'forearms'] as const,
    prioritiesFemale: ['legs', 'glutes', 'abs', 'chest', 'triceps', 'biceps', 'back', 'shoulders'] as const,
    assets: { imageBasePath: '/priorities/vein/{locale}' },
    preloadImages: true,
  },
}

export function getPriorityConfig(funnel: FunnelKey): PriorityStepConfig {
  return pickFunnel(funnel, CONFIG)
}
