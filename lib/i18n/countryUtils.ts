/**
 * Normalizes country codes for database storage.
 * Converts "US" to "EN" to maintain consistency with locale handling.
 */
export function normalizeCountryCode(country: string | null | undefined): string {
    if (!country) return 'PL'; // Default fallback

    const normalized = country.toUpperCase();

    // Convert US to EN for consistency
    if (normalized === 'US') {
        return 'EN';
    }

    return normalized;
}
