export type MarketCode = 'pl';
export type CheckoutProvider = 'p24' | 'payu' | 'stripe';

export type MarketInfo = {
    market: MarketCode;
    locale: string;
    currency: 'PLN';
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
} as const satisfies Record<string, Omit<MarketInfo, 'isKnownHost'>>;

export const locales = ['pl'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'pl';

export const localeMarketMap: Record<Locale, Omit<MarketInfo, 'isKnownHost'>> = LOCALE_CONFIG;

export const marketToCountryMap: Record<MarketCode, string> = {
    pl: 'PL',
};
