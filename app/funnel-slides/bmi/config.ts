import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type BmiStepConfig = {
  translationNamespace: 'BMI' | 'KalistenikaBMI'
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

const CONFIG: { plan: BmiStepConfig } & Partial<Record<FunnelKey, BmiStepConfig>> = {
  plan: {
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
  kalistenika: {
    translationNamespace: 'KalistenikaBMI',
    showCalculation: true,
    categoryRanges: [
      [0, 18.5],
      [18.5, 24.9],
      [25, 29.9],
      [30, Number.POSITIVE_INFINITY],
    ],
    assets: {
      nextStepImg: '/btns/{locale}/v_lets_go.svg',
      illustrationImg: '/vectors/v_meat.svg',
    },
    illustration: {
      width: 600,
      height: 210,
    },
  },
}

export function getBmiConfig(funnel: FunnelKey): BmiStepConfig {
  return pickFunnel(funnel, CONFIG)
}
