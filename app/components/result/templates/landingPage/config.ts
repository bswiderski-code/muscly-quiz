import type { FunnelKey } from '@/lib/funnels/funnels';

export type LandingPageAssets = {
  logo: string;
  heroImage: string;
  heroWidth?: number;
  heroHeight?: number;
  btnImage: string;
  btnWidth?: number;
  btnHeight?: number;
  homeUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export type FunnelLandingConfig = {
  translationNamespace: string;
  assets: LandingPageAssets;
};

export const funnelLandingConfigs: Record<FunnelKey, FunnelLandingConfig> = {
  workout: {
    translationNamespace: 'WorkoutPage',
    assets: {
      logo: '/{locale}/needle/logo-long.svg',
      heroImage: '/vectors/t_eagle.svg',
      heroWidth: 366,
      heroHeight: 266,
      btnImage: '/btns/{locale}/create_plan_btn.svg',
      btnWidth: 1000,
      btnHeight: 72,
      homeUrl: 'https://trenerstrzykawa.pl/',
      privacyUrl: 'https://trenerstrzykawa.pl/polityka-prywatnosci/',
      termsUrl: 'https://trenerstrzykawa.pl/regulamin/',
    },
  },
};
