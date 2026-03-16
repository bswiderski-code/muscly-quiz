import { locales, defaultLocale } from './i18n';

export const CANONICAL_HOST = 'quiz.musclepals.com';

// Main marketing site URL (used for back navigation, logo links, legal pages)
export const MAIN_SITE_URL = 'https://musclepals.com';

const isSpoofing = process.env.SPOOFING === 'true';
const devUrl = process.env.DEV_URL;

export const SITE_CONFIG = {
  gtmId: 'GTM-PRLGT92L',
  fbPixelId: '926252729971653',
  baseUrl: isSpoofing && devUrl ? devUrl : (process.env.NEXT_PUBLIC_BASE_URL || 'https://' + CANONICAL_HOST),
  defaultLocale,
  locales: [...locales],
};

export const ANALYTICS_CONFIG = {
  gtmId: SITE_CONFIG.gtmId,
  fbPixelId: SITE_CONFIG.fbPixelId,
  events: {
    QUIZ_COMPLETED: 'quiz_completed',
    VIEW_ITEM: 'view_item',
    INITIATE_CHECKOUT: 'initiate_checkout',
    PURCHASE: 'purchase',
  },
} as const;
