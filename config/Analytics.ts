import { SITE_CONFIG } from './site';

export const GTM_ID = SITE_CONFIG.gtmId;
export const FB_PIXEL_ID = SITE_CONFIG.fbPixelId;

export const ANALYTICS_CONFIG = {
  gtmId: GTM_ID,
  fbPixelId: FB_PIXEL_ID,

  events: {
    // Engagement Events

    QUIZ_COMPLETED: 'quiz_completed', // CompleteRegistration

    // Ecommerce Events
    VIEW_ITEM: 'view_item', // ViewContent
    INITIATE_CHECKOUT: 'initiate_checkout', // InitiateCheckout
    PURCHASE: 'purchase', // Purchase
  },
} as const;
