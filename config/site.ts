import { locales, defaultLocale } from './i18n';

export const CANONICAL_HOST = 'quiz.musclepals.com';

const isSpoofing = process.env.SPOOFING === 'true';
const devUrl = process.env.DEV_URL;

export const SITE_CONFIG = {
  gtmId: 'GTM-PRLGT92L', // Replace with your GTM ID
  fbPixelId: '926252729971653', // Replace with your FB Pixel ID
  baseUrl: isSpoofing && devUrl ? devUrl : (process.env.NEXT_PUBLIC_BASE_URL || 'https://' + CANONICAL_HOST),
  defaultLocale,
  locales: [...locales],
};

// Quiz is noindex, so we only care about OG metadata (Now handled in config/metadata.ts)
