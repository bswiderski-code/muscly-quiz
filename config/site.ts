import { locales, defaultLocale } from './i18n';

/** Hostname only (no protocol), e.g. quiz.example.com — set via NEXT_PUBLIC_CANONICAL_HOST */
export const CANONICAL_HOST =
  process.env.NEXT_PUBLIC_CANONICAL_HOST?.trim() ?? '';

/** Marketing site origin with protocol — set via NEXT_PUBLIC_MAIN_SITE_URL */
export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ?? '';

const isSpoofing = process.env.SPOOFING === 'true';
const devUrl = process.env.DEV_URL;

export const SITE_CONFIG = {
  gtmId: 'GTM-PRLGT92L',
  fbPixelId: '926252729971653',
  baseUrl:
    isSpoofing && devUrl
      ? devUrl
      : process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
        (CANONICAL_HOST ? `https://${CANONICAL_HOST}` : ''),
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
