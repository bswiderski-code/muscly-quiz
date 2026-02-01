import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type DietGoalStepConfig = {
  translationNamespace: 'DietGoal'
  assets: {
    bulk: { male: string; female: string } // supports `{locale}`
    cut: { male: string; female: string } // supports `{locale}`
  }
}

const CONFIG: { workout: DietGoalStepConfig } & Partial<Record<FunnelKey, DietGoalStepConfig>> = {
  workout: {
    translationNamespace: 'DietGoal',
    assets: {
      bulk: {
        male: '/btns/{locale}/want_bulk.svg',
        female: '/btns/{locale}/want_bulk_f.svg',
      },
      cut: {
        male: '/btns/{locale}/want_cut.svg',
        female: '/btns/{locale}/want_cut_f.svg',
      },
    },
  },
}

export function getDietGoalConfig(funnel: FunnelKey): DietGoalStepConfig {
  return pickFunnel(funnel, CONFIG)
}
