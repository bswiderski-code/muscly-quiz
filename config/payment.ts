// Payment configuration per locale
// Credentials are in config/credentials.ts to keep this file as settings-only
export const PAYMENT_CONFIG = {
  pl: {
    // Set to true to use sandbox/test mode instead of production
    sandbox: process.env.PL_PAYMENT_SANDBOX === 'true',
    // Which payment provider to use for Poland: 'p24' | 'payu' | 'stripe'
    provider: (process.env.PL_PAYMENT_PROVIDER as 'p24' | 'payu' | 'stripe') || 'payu',
  },
  // Other locales can be added here with similar structure if needed
};
