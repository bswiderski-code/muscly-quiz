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

export const LOCALE_CONFIG: Record<Locale, Omit<MarketInfo, 'isKnownHost'>> = {
    pl: {
        market: 'pl',
        locale: 'pl',
        currency: 'PLN',
        checkoutProvider: 'payu', // Overridden by normalizeCheckoutProvider
        gtmId: 'GTM-TL3758GN',
        facebookPixelId: '2996935407134889',
        funnels: ['workout'],
    },
    en: {
        market: 'us',
        locale: 'en',
        currency: 'USD',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-XXXXXXXX',
        facebookPixelId: 'XXXXXXXXXXXXXXX',
        funnels: ['workout'],
    },
    ro: {
        market: 'ro',
        locale: 'ro',
        currency: 'RON',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-MC5WTFCJ',
        facebookPixelId: '1644944776860623',
        funnels: ['workout'],
    },
    fr: {
        market: 'fr',
        locale: 'fr',
        currency: 'EUR',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-XXXXXXXX',
        facebookPixelId: 'XXXXXXXXXXXXXXX',
        funnels: ['workout'],
    },
    de: {
        market: 'de',
        locale: 'de',
        currency: 'EUR',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-XXXXXXXX',
        facebookPixelId: 'XXXXXXXXXXXXXXX',
        funnels: ['workout'],
    },
};

export const localeMarketMap = LOCALE_CONFIG;

export const marketToCountryMap: Record<MarketCode, string> = {
    pl: 'PL',
    us: 'US',
    ro: 'RO',
    fr: 'FR',
    de: 'DE',
};
