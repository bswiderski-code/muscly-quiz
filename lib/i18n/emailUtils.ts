import { SUPPORT_EMAILS, DEFAULT_SUPPORT_EMAIL } from '@/config/support';

/**
 * Returns the locale-specific support email address.
 * Pattern: [locale]-support@musclepals.com
 * Fallback: support@musclepals.com
 * 
 * @param locale The current locale (e.g., 'pl', 'en', 'bg')
 * @returns The support email address
 */
export function getSupportEmail(locale: string): string {
    if (!locale) {
        return DEFAULT_SUPPORT_EMAIL;
    }

    // Normalize locale for email (e.g., 'en-US' -> 'en')
    const shortLocale = locale.split('-')[0].toLowerCase();

    // Check if we have an explicit override or known locale
    if (SUPPORT_EMAILS[shortLocale]) {
        return SUPPORT_EMAILS[shortLocale];
    }

    // Fallback pattern
    return `${shortLocale}-support@musclepals.com`;
}
