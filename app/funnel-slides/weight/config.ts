import type { FunnelKey } from '@/lib/funnels/funnels';

export type WeightConfig = {
  translationNamespace: string;
  cssFile?: string;
  inputType: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
  unit: 'kg' | 'lbs';
  buttonExpandSrc: string;
  burningBicepsImage: string;
};

const defaultConfig: WeightConfig = {
  translationNamespace: 'Weight',
  cssFile: './weight.css',
  inputType: 'number',
  min: 40,
  max: 200,
  step: 0.5,
  unit: 'kg',
  buttonExpandSrc: '/btns/{locale}/expand.svg',
  burningBicepsImage: '/vectors/burning_biceps.svg',
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<WeightConfig>>> = {
  workout: {
    buttonExpandSrc: '/btns/{locale}/expand.svg',
  },
};

export function getWeightConfig(funnelKey: FunnelKey): WeightConfig {
  const funnelConfig = funnelConfigs[funnelKey] || {};
  return {
    ...defaultConfig,
    ...funnelConfig,
  };
}
