import type { FunnelKey } from '@/lib/funnels/funnels';

export type HeightConfig = {
  translationNamespace: string;
  cssFile?: string;
  inputType: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
  unit: 'cm' | 'ft';
  images: {
    male: string;
    female: string;
  };
};

const defaultConfig: HeightConfig = {
  translationNamespace: 'Height',
  cssFile: './height.css',
  inputType: 'number',
  min: 140,
  max: 220,
  step: 1,
  unit: 'cm',
  images: {
    male: '/vectors/t_height.svg',
    female: '/vectors/f_height.svg',
  },
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<HeightConfig>>> = {
  workout: {},
};

export function getHeightConfig(funnelKey: FunnelKey): HeightConfig {
  const funnelConfig = funnelConfigs[funnelKey] || {};
  return {
    ...defaultConfig,
    ...funnelConfig,
  };
}
