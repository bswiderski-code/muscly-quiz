import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type PriorityStepConfig = {
  translationNamespace: 'Priority'
  prioritiesMale: readonly string[]
  prioritiesFemale: readonly string[]
  assets: {
    imageBasePath: string // supports `{locale}` (expects `/selected` + `/unselected` below it)
  }
  preloadImages: boolean
}

const CONFIG: { workout: PriorityStepConfig } & Partial<Record<FunnelKey, PriorityStepConfig>> = {
  workout: {
    translationNamespace: 'Priority',
    prioritiesMale: ['shoulders', 'chest', 'triceps', 'biceps', 'back', 'legs', 'abs', 'forearms'] as const,
    prioritiesFemale: ['legs', 'glutes', 'abs', 'chest', 'triceps', 'biceps', 'back', 'shoulders'] as const,
    assets: { imageBasePath: '/priorities/needle/{locale}' },
    preloadImages: true,
  },
}

export function getPriorityConfig(funnel: FunnelKey): PriorityStepConfig {
  return pickFunnel(funnel, CONFIG)
}
