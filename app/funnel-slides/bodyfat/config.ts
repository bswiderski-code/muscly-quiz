import type { FunnelKey } from '@/lib/funnels/funnels'
import { pickFunnel } from '@/app/funnel-slides/_config/helpers'

export type BodyfatStepConfig = {
  translationNamespace: 'Bodyfat' | 'KalistenikaBodyfat'
  assets: {
    maleByValue: Record<string, string>
    femaleByValue: Record<string, string>
  }
}

const CONFIG: { plan: BodyfatStepConfig } & Partial<Record<FunnelKey, BodyfatStepConfig>> = {
  plan: {
    translationNamespace: 'Bodyfat',
    assets: {
      maleByValue: {
        '5-9': '/bodyfat_variants/needle/m_bodyfat_1.svg',
        '10-14': '/bodyfat_variants/needle/m_bodyfat_2.svg',
        '15-19': '/bodyfat_variants/needle/m_bodyfat_3.svg',
        '20-24': '/bodyfat_variants/needle/m_bodyfat_4.svg',
        '25-29': '/bodyfat_variants/needle/m_bodyfat_5.svg',
        '30-34': '/bodyfat_variants/needle/m_bodyfat_6.svg',
        '35-39': '/bodyfat_variants/needle/m_bodyfat_7.svg',
        '>40': '/bodyfat_variants/needle/m_bodyfat_8.svg',
      },
      femaleByValue: {
        '10-14': '/bodyfat_variants/needle/f_bodyfat_1.svg',
        '15-19': '/bodyfat_variants/needle/f_bodyfat_2.svg',
        '20-24': '/bodyfat_variants/needle/f_bodyfat_3.svg',
        '25-29': '/bodyfat_variants/needle/f_bodyfat_4.svg',
        '30-39': '/bodyfat_variants/needle/f_bodyfat_5.svg',
        '>40': '/bodyfat_variants/needle/f_bodyfat_6.svg',
      },
    },
  },
  kalistenika: {
    translationNamespace: 'KalistenikaBodyfat',
    assets: {
      maleByValue: {
        '5-9': '/bodyfat_variants/vein/m_bodyfat_1.svg',
        '10-14': '/bodyfat_variants/vein/m_bodyfat_2.svg',
        '15-19': '/bodyfat_variants/vein/m_bodyfat_3.svg',
        '20-24': '/bodyfat_variants/vein/m_bodyfat_4.svg',
        '25-29': '/bodyfat_variants/vein/m_bodyfat_5.svg',
        '30-34': '/bodyfat_variants/vein/m_bodyfat_6.svg',
        '35-39': '/bodyfat_variants/vein/m_bodyfat_7.svg',
        '>40': '/bodyfat_variants/vein/m_bodyfat_8.svg',
      },
      femaleByValue: {
        '10-14': '/bodyfat_variants/needle/f_bodyfat_1.svg',
        '15-19': '/bodyfat_variants/needle/f_bodyfat_2.svg',
        '20-24': '/bodyfat_variants/needle/f_bodyfat_3.svg',
        '25-29': '/bodyfat_variants/needle/f_bodyfat_4.svg',
        '30-39': '/bodyfat_variants/needle/f_bodyfat_5.svg',
        '>40': '/bodyfat_variants/needle/f_bodyfat_6.svg',
      },
    },
  },
}

export function getBodyfatConfig(funnel: FunnelKey): BodyfatStepConfig {
  return pickFunnel(funnel, CONFIG)
}
