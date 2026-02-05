import { marketToCountryMap, Locale, LOCALE_CONFIG } from '@/config/i18n';

/**
 * Maps a country code (e.g., 'PL', 'US') to a supported Locale (e.g., 'pl', 'en').
 * Falls back to 'pl' if not found.
 */
export function getLocaleFromCountry(country: string | null | undefined): Locale {
    if (!country) return 'pl';

    const upperCountry = country.toUpperCase();

    // Reverse map from marketToCountryMap
    // entries: [market, country]
    const entry = Object.entries(marketToCountryMap).find(([_, c]) => c === upperCountry);

    if (!entry) return 'pl';

    const market = entry[0];

    // Find locale in LOCALE_CONFIG by market
    const localeConfig = Object.values(LOCALE_CONFIG).find((config: any) => config.market === market);

    return (localeConfig?.locale as Locale) || 'pl';
}
