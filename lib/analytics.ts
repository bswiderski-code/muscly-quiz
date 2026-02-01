'use client';

import { ANALYTICS_CONFIG } from '@/config/Analytics';
import { trackStandardEvent, trackCustomEvent } from './facebookPixel';

type GTMEvent = {
  event: string;
  [key: string]: any;
};

// GTM DataLayer
export const pushToDataLayer = (data: GTMEvent) => {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push(data);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[GTM Event]', data);
  }
};

// Generic event tracking
export const trackEvent = (
  eventName: keyof typeof ANALYTICS_CONFIG.events,
  properties?: Record<string, any>
) => {
  const eventString = ANALYTICS_CONFIG.events[eventName];

  // Track in GTM
  pushToDataLayer({
    event: eventString,
    ...properties,
  });

  // Map to Facebook Pixel events
  const fbEventMap: Record<string, any> = {
    'view_item': 'ViewContent',
    'initiate_checkout': 'InitiateCheckout',
    'purchase': 'Purchase',
  };

  if (fbEventMap[eventString]) {
    trackStandardEvent(fbEventMap[eventString], properties);
  } else {
    trackCustomEvent(eventString, properties);
  }
};


export const trackQuizCompleted = (data?: any) => trackEvent('QUIZ_COMPLETED', data);
export const trackInitiateCheckout = (data?: any) => trackEvent('INITIATE_CHECKOUT', data);
export const trackPurchase = (data?: any) => trackEvent('PURCHASE', data);
