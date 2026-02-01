import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type BmiStepConfig = {
  translationNamespace: 'BMI'
  cssFile?: string
  showCalculation: boolean
  categoryRanges: Array<[number, number]>
  assets: {
    nextStepImg: string // supports `{locale}`
    illustrationImg: string
  }
  illustration: {
    width: number
    height: number
  }
}

const CONFIG: { workout: BmiStepConfig } & Partial<Record<FunnelKey, BmiStepConfig>> = {
  workout: {
    translationNamespace: 'BMI',
    showCalculation: true,
    categoryRanges: [
      [0, 18.5],
      [18.5, 24.9],
      [25, 29.9],
      [30, Number.POSITIVE_INFINITY],
    ],
    assets: {
      nextStepImg: '/btns/{locale}/lets_go.svg',
      illustrationImg: '/vectors/t_meat.svg',
    },
    illustration: {
      width: 600,
      height: 240,
    },
  },
}

export function getBmiConfig(funnel: FunnelKey): BmiStepConfig {
  return pickFunnel(funnel, CONFIG)
}
