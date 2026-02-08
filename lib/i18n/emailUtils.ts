import { Locale } from '@/config/i18n';

/**
 * Returns the locale-specific support email address.
 * Pattern: [locale]-support@musclepals.com
 * Fallback: support@musclepals.com
 * 
 * @param locale The current locale (e.g., 'pl', 'en', 'bg')
 * @returns The support email address
 */
export function getSupportEmail(locale: string): string {
    if (!locale || locale === 'en') {
        return 'support@musclepals.com';
    }

    // Normalize locale for email (e.g., 'en-US' -> 'en')
    const shortLocale = locale.split('-')[0].toLowerCase();

    // Pattern as requested by the user
    return `${shortLocale}-support@musclepals.com`;
}
