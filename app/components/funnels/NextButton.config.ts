import type { FunnelKey } from '@/lib/quiz/funnels';
import { ASSET_PATHS } from '@/config/imagePaths';

export type NextButtonConfig = {
  imageSrc: string; // supports `{locale}` placeholder
  alt: string;
};

const defaultConfig: NextButtonConfig = {
  imageSrc: ASSET_PATHS.buttons.next,
  alt: 'Next step',
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<NextButtonConfig>>> = {
  workout: {
    imageSrc: ASSET_PATHS.buttons.next,
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
