/**
 * Runs when a new Next.js server instance starts (Node runtime only).
 * @see https://nextjs.org/docs/app/guides/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { primeExchangeRatesOnServerStart } = await import('@/lib/conversionRates');
    void primeExchangeRatesOnServerStart();
  }
}
