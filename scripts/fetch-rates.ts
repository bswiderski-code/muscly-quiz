/**
 * Standalone script to fetch and display live exchange rates.
 * Run with: npx tsx scripts/fetch-rates.ts
 */

import { fetchExchangeRates, invertRatesToPLN } from '../lib/exchangeRateApi';

async function main() {
    console.log('-------------------------------------------');
    console.log('   CURRENCY EXCHANGE RATES (LIVE)          ');
    console.log('-------------------------------------------');

    try {
        const data = await fetchExchangeRates();
        const invertedRates = invertRatesToPLN(data.conversion_rates);

        console.log(`Base Currency:  ${data.base_code}`);
        console.log(`Last Updated:   ${data.time_last_update_utc}`);
        console.log(`Next Update:   ${data.time_next_update_utc}`);
        console.log('-------------------------------------------');
        console.log('   1 [CURRENCY] = X [PLN]                  ');
        console.log('-------------------------------------------');

        const currenciesToShow = ['RON', 'EUR', 'USD', 'GBP', 'CZK', 'HUF'];

        currenciesToShow.forEach(curr => {
            const rate = invertedRates[curr];
            if (rate) {
                console.log(`${curr.padEnd(5)}: ${rate.toFixed(4)} PLN`);
            } else {
                console.log(`${curr.padEnd(5)}: Not found in response`);
            }
        });

        console.log('-------------------------------------------');

    } catch (error) {
        console.error('\n❌ Error fetching rates:');
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

main();
