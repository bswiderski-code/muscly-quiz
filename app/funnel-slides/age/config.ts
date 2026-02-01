import type { FunnelKey } from '@/lib/funnels/funnels';

export type AgeConfig = {
  translationNamespace: string;
  cssFile?: string;
  inputType: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
};

const defaultConfig: AgeConfig = {
  translationNamespace: 'Age',
  cssFile: './age.css',
  inputType: 'number',
  min: 16,
  max: 80,
  step: 1,
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<AgeConfig>>> = {
  workout: {},
};

export function getAgeConfig(funnelKey: FunnelKey): AgeConfig {
  const funnelConfig = funnelConfigs[funnelKey] || {};
  return {
    ...defaultConfig,
    ...funnelConfig,
  };
}
