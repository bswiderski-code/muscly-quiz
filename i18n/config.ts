export const locales = ['pl', 'en', 'fr', 'de', 'ro'] as const;
export type Locale = typeof locales[number];

export type MarketCode = 'pl' | 'us' | 'fr' | 'de' | 'ro';
export type CheckoutProvider = 'p24' | 'payu' | 'stripe';

export type MarketInfo = {
  market: MarketCode;
  locale: Locale;
  currency: 'PLN' | 'USD' | 'EUR' | 'RON';
  checkoutProvider: CheckoutProvider;
  gtmId: string;
  facebookPixelId: string;
  funnels: string[];
  isKnownHost: boolean;
};

export const defaultLocale: Locale = 'pl';

// Utility to normalize provider selection (Polish market can swap providers via env).
const normalizeCheckoutProvider = (info: Omit<MarketInfo, 'isKnownHost'>): Omit<MarketInfo, 'isKnownHost'> => {
  return info.market === 'pl'
    ? { ...info, checkoutProvider: getPolishCheckoutProvider() }
    : info;
};

export const getPolishCheckoutProvider = (): Extract<CheckoutProvider, 'p24' | 'payu'> => {
  const raw = (process.env.NEXT_PUBLIC_PL_PAYMENTS ?? '').toLowerCase().trim();
  return raw === 'p24' ? 'p24' : 'payu';
};

import { getEffectiveHost } from '@/lib/domain/effectiveHost';
export { getEffectiveHost };

// Load domain configuration from JSON file
import domainsConfig from '@/config/domains/domains.json';

type DomainConfig = {
  market: MarketCode;
  locale: Locale;
  currency: 'PLN' | 'USD' | 'EUR' | 'RON';
  checkoutProvider: CheckoutProvider;
  gtmId: string;
  facebookPixelId: string;
  funnels: string[];
};

// Map locales to market configuration. Since we have one domain now, 
// we map by locale instead of host.
function buildLocaleMarketMap(): Record<Locale, Omit<MarketInfo, 'isKnownHost'>> {
  const map: Partial<Record<Locale, Omit<MarketInfo, 'isKnownHost'>>> = {};
  
  // We iterate through domainsConfig and pick the first one for each locale.
  // In a single-domain setup, we ideally should have one config per locale.
  for (const config of Object.values(domainsConfig as Record<string, DomainConfig>)) {
    if (!map[config.locale]) {
      map[config.locale] = {
        market: config.market,
        locale: config.locale,
        currency: config.currency,
        checkoutProvider: config.checkoutProvider,
        gtmId: config.gtmId,
        facebookPixelId: config.facebookPixelId,
        funnels: config.funnels,
      };
    } else {
      // If we already have a config for this locale, we might want to merge funnels
      // but usually one GTM/Pixel is used per locale on a single domain.
      map[config.locale]!.funnels = Array.from(new Set([...map[config.locale]!.funnels, ...config.funnels]));
    }
  }

  return map as Record<Locale, Omit<MarketInfo, 'isKnownHost'>>;
}

export const localeMarketMap = buildLocaleMarketMap();

export const getMarketForLocale = (locale: Locale): MarketInfo => {
  const mapped = localeMarketMap[locale] || localeMarketMap[defaultLocale];
  const normalized = normalizeCheckoutProvider(mapped);
  return { ...normalized, isKnownHost: true };
};

// Deprecated: use getMarketForLocale instead.
export const getMarketForHost = (host: string | null | undefined, preferredLocale?: Locale): MarketInfo => {
  return getMarketForLocale(preferredLocale || defaultLocale);
};

// Enforce canonical domain
export const getBaseUrlForLocale = (locale?: Locale): string | undefined => {
  if (process.env.NODE_ENV === 'development') {
    return undefined; // Let Next.js handle it
  }
  return 'https://quiz.musclepals.com';
};

export const getLocaleForHost = (host: string | null | undefined): Locale => {
  return defaultLocale; // Not used anymore for routing
};

// Map market codes to country codes for ORDERS table and n8n notifications
const marketToCountryMap: Record<MarketCode, string> = {
  pl: 'PL',
  us: 'US',
  ro: 'RO',
  fr: 'FR',
  de: 'DE',
};

export const getCountryForMarket = (market: MarketCode): string => {
  return marketToCountryMap[market] || 'US';
};

export const getCountryForHost = (host: string | null | undefined): string => {
  return 'US'; // Fallback
};
