const isSpoofing = process.env.SPOOFING === 'true';
const devUrl = process.env.DEV_URL;
const spoofedDomain = process.env.SPOOFED;

export const SITE_CONFIG = {
  gtmId: 'GTM-PRLGT92L', // Replace with your GTM ID
  fbPixelId: '926252729971653', // Replace with your FB Pixel ID
  baseUrl: isSpoofing && devUrl ? devUrl : (process.env.NEXT_PUBLIC_BASE_URL || (spoofedDomain ? `https://${spoofedDomain}` : 'https://quiz.musclepals.com')),
  defaultLocale: 'pl',
  locales: ['en', 'pl', 'ro', 'de', 'fr', 'it'],
};

// Quiz is noindex, so we only care about OG metadata
export const QUIZ_SEO_CONFIG = {
  noindex: true,
  locales: {
    pl: {
      title: 'MusclePals Quiz - Stwórz swój plan',
      description: 'Odpowiedz na kilka pytań i otrzymaj spersonalizowany plan treningowy.',
      ogImage: '/og-image-quiz-pl.png',
    },
    en: {
      title: 'MusclePals Quiz - Get Your Plan',
      description: 'Answer a few questions and get a personalized workout plan.',
      ogImage: '/og-image-quiz-en.png',
    },
    // ... other locales can be added here
  }
};
