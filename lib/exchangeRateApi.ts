import { prisma } from '@/lib/prisma';

/**
 * ExchangeRate-API Service
 * 
 * Fetches live currency exchange rates from ExchangeRate-API
 * API Documentation: https://www.exchangerate-api.com/docs/overview
 */

const API_KEY = '6d600301ebe3a0ea42680efb';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

export interface ExchangeRateResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: string;
    conversion_rates: Record<string, number>;
}

/**
 * Fetch latest exchange rates from PLN to all other currencies
 * 
 * @returns Exchange rate data with PLN as base currency
 * @throws Error if API request fails
 */
export async function fetchExchangeRates(): Promise<ExchangeRateResponse> {
    const url = `${BASE_URL}/${API_KEY}/latest/PLN`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`ExchangeRate-API returned status ${response.status}`);
        }

        const data: ExchangeRateResponse = await response.json();

        if (data.result !== 'success') {
            throw new Error(`ExchangeRate-API returned result: ${data.result}`);
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        throw error;
    }
}

/**
 * Convert exchange rates from PLN-based to rates that convert TO PLN
 * 
 * Since the API gives us rates FROM PLN, we need to invert them
 * to get rates TO PLN (which is what we need for our conversion)
 * 
 * @param rates - Rates from PLN to other currencies
 * @returns Rates from other currencies to PLN
 */
export function invertRatesToPLN(rates: Record<string, number>): Record<string, number> {
    const invertedRates: Record<string, number> = { PLN: 1.0 };

    for (const [currency, rate] of Object.entries(rates)) {
        if (currency !== 'PLN' && rate > 0) {
            // If 1 PLN = X EUR, then 1 EUR = 1/X PLN
            invertedRates[currency] = Number((1 / rate).toFixed(4));
        }
    }

    return invertedRates;
}

/**
 * Fetches latest PLN-based rates from the API, inverts to rates → PLN, and upserts all rows in the database.
 * Used on server start, cron refresh, and manual API calls so payments and in-memory cache stay aligned.
 */
export async function syncExchangeRatesToDatabase(): Promise<
    { ok: true; rates: Record<string, number> } | { ok: false; error: unknown }
> {
    try {
        const apiResponse = await fetchExchangeRates();
        const invertedRates = invertRatesToPLN(apiResponse.conversion_rates);

        const updates = Object.entries(invertedRates).map(([code, rate]) =>
            prisma.exchangeRate.upsert({
                where: { currency: code },
                update: { rate },
                create: { currency: code, rate },
            })
        );

        await prisma.$transaction(updates);
        return { ok: true, rates: invertedRates };
    } catch (error) {
        console.error('[ExchangeRates] syncExchangeRatesToDatabase failed:', error);
        return { ok: false, error };
    }
}

/**
 * Get exchange rate from given currency TO PLN
 * 
 * Logic:
 * 1. Check DB for cached rate (updated within 24h)
 * 2. If valid cache exists, return it
 * 3. If no cache or stale:
 *    - Fetch new rates from API
 *    - Invert rates to be TO PLN
 *    - Update DB with new rates
 *    - Return requested rate
 */
export async function getExchangeRateToPLN(currency: string): Promise<number> {
    const targetCurrency = currency.toUpperCase();

    // 1. Always return 1 for PLN
    if (targetCurrency === 'PLN') {
        return 1.0;
    }

    try {
        // 2. Check cache
        const cached = await prisma.exchangeRate.findUnique({
            where: { currency: targetCurrency }
        });

        // 24 hours in milliseconds
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const now = new Date();

        if (cached && (now.getTime() - cached.updatedAt.getTime() < ONE_DAY_MS)) {
            return Number(cached.rate);
        }

        // 3. Fetch new rates if cache missing or stale
        console.log(`Exchange rate for ${targetCurrency} is missing or stale. Fetching from API...`);

        try {
            const sync = await syncExchangeRatesToDatabase();
            if (!sync.ok) {
                throw sync.error instanceof Error ? sync.error : new Error('Exchange rate sync failed');
            }

            const newRate = sync.rates[targetCurrency];

            if (!newRate) {
                console.warn(`Rate for ${targetCurrency} not found in API response. Defaulting to 1.0`);
                return 1.0;
            }

            return newRate;
        } catch (fetchError) {
            console.error(`Failed to refresh exchange rates:`, fetchError);
            // Fallback to stale data if available
            if (cached) {
                console.warn(`Using stale rate for ${targetCurrency} due to API error.`);
                return Number(cached.rate);
            }
            throw fetchError;
        }

    } catch (error) {
        console.error(`Error getting exchange rate for ${targetCurrency}:`, error);
        return 1.0; // Ultimate fallback to avoid blocking orders
    }
}
