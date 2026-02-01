export const PAYMENT_CONFIG = {
  pl: {
    sandbox: process.env.PL_PAYMENT_SANDBOX === 'true',
    provider: (process.env.PL_PAYMENT_PROVIDER as 'p24' | 'payu') || 'payu',
    payu: {
      merchantId: '390978', // Default sandbox/prod values can be swapped here or via vars if needed
      posId: '390978',
      secondKey: 'b6ca15b0d1020d80d8d911f86694e434', // Sandbox key
      clientId: '390978',
      clientSecret: 'c52136e0b74143q59c02a76f23604d73', // Sandbox secret
    },
    p24: {
      merchantId: '12345', // Placeholder
      posId: '12345', // Placeholder
      crc: 'xxxxx',
      apiKey: 'xxxxx',
    }
  },
  // Other locales can be added here with similar structure if needed
};
