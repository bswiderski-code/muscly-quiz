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
