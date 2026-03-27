import { PAYMENT_CONFIG } from '@/config/payment';
import { CANONICAL_HOST } from '@/config/site';
import {
  CheckoutProvider,
  defaultLocale,
  LOCALE_CONFIG,
  Locale,
  localeMarketMap,
  MarketCode,
  MarketInfo,
  marketToCountryMap
} from '@/config/i18n';

export {
  locales,
  defaultLocale,
  LOCALE_CONFIG,
  localeMarketMap,
} from '@/config/i18n';

export type {
  Locale,
  MarketCode,
  CheckoutProvider,
  MarketInfo,
} from '@/config/i18n';

// Utility to normalize provider selection (Polish market can swap providers via env).
const normalizeCheckoutProvider = (info: Omit<MarketInfo, 'isKnownHost'>): Omit<MarketInfo, 'isKnownHost'> => {
  return info.market === 'pl'
    ? { ...info, checkoutProvider: getPolishCheckoutProvider() }
    : info;
};

export const getPolishCheckoutProvider = (): CheckoutProvider => {
  return PAYMENT_CONFIG.pl.provider;
};

// Deprecated: use getMarketForLocale instead.
export const getMarketForHost = (host: string | null | undefined, preferredLocale?: Locale): MarketInfo => {
  return getMarketForLocale(preferredLocale || defaultLocale);
};

export const getMarketForLocale = (locale: Locale): MarketInfo => {
  const mapped = localeMarketMap[locale] || localeMarketMap[defaultLocale];
  const normalized = normalizeCheckoutProvider(mapped);
  return { ...normalized, isKnownHost: true };
};

// Enforce canonical domain
export const getBaseUrlForLocale = (locale?: Locale): string | undefined => {
  if (process.env.NODE_ENV === 'development') {
    return undefined; // Let Next.js handle it
  }
  return CANONICAL_HOST ? `https://${CANONICAL_HOST}` : undefined;
};

export const getLocaleForHost = (host: string | null | undefined): Locale => {
  return defaultLocale; // Not used anymore for routing
};

export const getCountryForMarket = (market: MarketCode): string => {
  return marketToCountryMap[market] || 'US';
};

export const getCountryForLocale = (locale: Locale): string => {
  const market = localeMarketMap[locale] || localeMarketMap[defaultLocale];
  return getCountryForMarket(market.market);
};

export const getCountryForHost = (host: string | null | undefined): string => {
  const locale = getLocaleForHost(host);
  return getCountryForLocale(locale);
};
