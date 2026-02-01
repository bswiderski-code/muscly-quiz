import type { FunnelKey } from '@/lib/funnels/funnels';

export type NextButtonConfig = {
  imageSrc: string; // supports `{locale}` placeholder
  alt: string;
};

const defaultConfig: NextButtonConfig = {
  imageSrc: '/btns/{locale}/next.svg',
  alt: 'Next step',
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<NextButtonConfig>>> = {
  workout: {
    imageSrc: '/btns/{locale}/next.svg',
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
