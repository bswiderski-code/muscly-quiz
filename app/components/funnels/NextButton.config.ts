import type { FunnelKey } from '@/lib/quiz/funnels';

export type NextButtonConfig = {
  imageSrc: string; // supports `{locale}` placeholder
  alt: string;
};

const defaultConfig: NextButtonConfig = {
  imageSrc: '',
  alt: 'Next step',
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<NextButtonConfig>>> = {
  workout: {
    imageSrc: '',
    alt: 'Create plan',
  },
};

export function getNextButtonConfig(funnelKey: FunnelKey): NextButtonConfig {
  const funnelConfig = funnelConfigs[funnelKey] || {};
  return {
    ...defaultConfig,
    ...funnelConfig,
  };
}
