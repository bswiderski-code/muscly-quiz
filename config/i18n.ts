export type MarketCode = 'pl' | 'us' | 'fr' | 'de' | 'ro' | 'cz' | 'bg' | 'hu';
export type CheckoutProvider = 'p24' | 'payu' | 'stripe';

export type MarketInfo = {
    market: MarketCode;
    locale: string;
    currency: 'PLN' | 'USD' | 'EUR' | 'RON' | 'CZK' | 'BGN' | 'HUF';
    checkoutProvider: CheckoutProvider;
    gtmId: string;
    facebookPixelId: string;
    funnels: string[];
    isKnownHost: boolean;
};

export const LOCALE_CONFIG = {
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
    cz: {
        market: 'cz',
        locale: 'cz',
        currency: 'CZK',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-XXXXXXXX',
        facebookPixelId: 'XXXXXXXXXXXXXXX',
        funnels: ['workout'],
    },
    bg: {
        market: 'bg',
        locale: 'bg',
        currency: 'BGN',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-XXXXXXXX',
        facebookPixelId: 'XXXXXXXXXXXXXXX',
        funnels: ['workout'],
    },
    hu: {
        market: 'hu',
        locale: 'hu',
        currency: 'HUF',
        checkoutProvider: 'stripe',
        gtmId: 'GTM-XXXXXXXX',
        facebookPixelId: 'XXXXXXXXXXXXXXX',
        funnels: ['workout'],
    },
} as const satisfies Record<string, Omit<MarketInfo, 'isKnownHost'>>;

export const locales = ['pl'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'pl';

export const localeMarketMap: Record<Locale, Omit<MarketInfo, 'isKnownHost'>> = LOCALE_CONFIG;

export const marketToCountryMap: Record<MarketCode, string> = {
    pl: 'PL',
    us: 'US',
    ro: 'RO',
    fr: 'FR',
    de: 'DE',
    cz: 'CZ',
    bg: 'BG',
    hu: 'HU',
};
