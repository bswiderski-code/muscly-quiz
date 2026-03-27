import { syncExchangeRatesToDatabase } from './exchangeRateApi';

/**
 * Currency conversion rates to PLN (Polish Zloty)
 * 
 * These are FALLBACK rates used when the API is unavailable.
 * Live rates are fetched from ExchangeRate-API and cached for 24 hours.
 * 
 * Format: 1 [CURRENCY] = X PLN
 * Last updated: 2026-02-08
 */
const FALLBACK_RATES_TO_PLN: Record<string, number> = {
    PLN: 1.0,
    RON: 0.82,
    EUR: 4.22,
    USD: 3.60,
    GBP: 4.50,
    CZK: 0.15,
    HUF: 0.011,
};

/**
 * Cache for exchange rates
 */
interface RateCache {
    rates: Record<string, number>;
    lastUpdated: number;
    nextUpdate: number;
}

let rateCache: RateCache | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if the cache is still valid
 */
function isCacheValid(): boolean {
    if (!rateCache) return false;
    return Date.now() < rateCache.nextUpdate;
}

/**
 * Update the exchange rates from the API
 * 
 * @returns true if update was successful, false otherwise
 */
async function updateRatesFromAPI(): Promise<boolean> {
    try {
        console.log('[ExchangeRates] Fetching latest rates from API (DB + memory)...');
        const result = await syncExchangeRatesToDatabase();
        if (!result.ok) return false;

        rateCache = {
            rates: result.rates,
            lastUpdated: Date.now(),
            nextUpdate: Date.now() + CACHE_DURATION_MS,
        };

        console.log('[ExchangeRates] Successfully updated rates. Next update:', new Date(rateCache.nextUpdate).toISOString());
        return true;
    } catch (error) {
        console.error('[ExchangeRates] Failed to update rates from API:', error);
        return false;
    }
}

/**
 * Run once when the Node server process starts (see instrumentation.ts).
 * Non-blocking for request handling when called with `void` from register().
 */
export async function primeExchangeRatesOnServerStart(): Promise<void> {
    const ok = await updateRatesFromAPI();
    if (!ok) {
        console.warn(
            '[ExchangeRates] Startup refresh failed; payments may use stale DB rows or static fallbacks until the next successful sync.'
        );
    }
}

/**
 * Get the current conversion rates (from cache or API)
 * Falls back to static rates if API is unavailable
 * 
 * @returns Record of currency codes to PLN conversion rates
 */
async function getCurrentRates(): Promise<Record<string, number>> {
    // If cache is valid, return cached rates
    if (isCacheValid() && rateCache) {
        return rateCache.rates;
    }

    // Try to update from API
    const updated = await updateRatesFromAPI();

    if (updated && rateCache) {
        return rateCache.rates;
    }

    // Fall back to static rates
    console.warn('[ExchangeRates] Using fallback rates');
    return FALLBACK_RATES_TO_PLN;
}

/**
 * Get conversion rates synchronously (uses cache or fallback)
 * This is useful when you can't use async/await
 * 
 * @returns Record of currency codes to PLN conversion rates
 */
export function getConversionRatesSync(): Record<string, number> {
    if (isCacheValid() && rateCache) {
        return rateCache.rates;
    }
    return FALLBACK_RATES_TO_PLN;
}

/**
 * Convert an amount from a given currency to PLN
 * 
 * @param amount - The amount in the source currency
 * @param currency - The source currency code (e.g., 'RON', 'EUR', 'USD')
 * @returns The equivalent amount in PLN, rounded to 2 decimal places
 * 
 * @example
 * ```typescript
 * const plnAmount = await convertToPLN(100, 'RON');
 * const plnAmount = await convertToPLN(50, 'EUR');
 * ```
 */
export async function convertToPLN(amount: number, currency: string): Promise<number> {
    const rates = await getCurrentRates();
    const currencyUpper = currency.toUpperCase();
    const rate = rates[currencyUpper];

    if (!rate) {
        console.warn(`[ExchangeRates] Unknown currency: ${currency}. Defaulting to 1:1 conversion.`);
        return Number(amount.toFixed(2));
    }

    const plnAmount = amount * rate;
    return Number(plnAmount.toFixed(2));
}

/**
 * Convert an amount from a given currency to PLN (synchronous version)
 * Uses cached rates or fallback rates
 * 
 * @param amount - The amount in the source currency
 * @param currency - The source currency code
 * @returns The equivalent amount in PLN, rounded to 2 decimal places
 */
export function convertToPLNSync(amount: number, currency: string): number {
    const rates = getConversionRatesSync();
    const currencyUpper = currency.toUpperCase();
    const rate = rates[currencyUpper];

    if (!rate) {
        console.warn(`[ExchangeRates] Unknown currency: ${currency}. Defaulting to 1:1 conversion.`);
        return Number(amount.toFixed(2));
    }

    const plnAmount = amount * rate;
    return Number(plnAmount.toFixed(2));
}

/**
 * Get the conversion rate for a specific currency to PLN
 * 
 * @param currency - The currency code
 * @returns The conversion rate, or 1.0 if currency is unknown
 */
export async function getConversionRate(currency: string): Promise<number> {
    const rates = await getCurrentRates();
    const currencyUpper = currency.toUpperCase();
    return rates[currencyUpper] || 1.0;
}

/**
 * Get the conversion rate synchronously
 * 
 * @param currency - The currency code
 * @returns The conversion rate, or 1.0 if currency is unknown
 */
export function getConversionRateSync(currency: string): number {
    const rates = getConversionRatesSync();
    const currencyUpper = currency.toUpperCase();
    return rates[currencyUpper] || 1.0;
}

/**
 * Force refresh the exchange rates from the API
 * Useful for manual updates or testing
 * 
 * @returns true if update was successful, false otherwise
 */
export async function forceRefreshRates(): Promise<boolean> {
    return await updateRatesFromAPI();
}

/**
 * Get cache information
 * 
 * @returns Cache status information
 */
export function getCacheInfo(): { isValid: boolean; lastUpdated: Date | null; nextUpdate: Date | null } {
    return {
        isValid: isCacheValid(),
        lastUpdated: rateCache ? new Date(rateCache.lastUpdated) : null,
        nextUpdate: rateCache ? new Date(rateCache.nextUpdate) : null,
    };
}

