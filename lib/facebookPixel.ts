'use client';

let ReactPixel: typeof import('react-facebook-pixel') | null = null;

type StandardPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Purchase'
  | 'InitiateCheckout'
  | 'Lead'
  | 'CompleteRegistration';

let pixelInitialized = false;
let currentPixelId: string | null = null;

const ensureInitialized = async (pixelId?: string) => {
  const targetPixelId = pixelId || currentPixelId;
  if (!targetPixelId) return false;

  if (pixelInitialized && currentPixelId === targetPixelId) {
    return pixelInitialized;
  }

  // Reset if pixel ID changed
  if (currentPixelId !== targetPixelId) {
    pixelInitialized = false;
    currentPixelId = targetPixelId;
  }

  if (typeof window === 'undefined' || !targetPixelId) {
    return false;
  }

  if (!ReactPixel) {
    const module = await import('react-facebook-pixel');
    ReactPixel = module.default;
  }

  ReactPixel.init(targetPixelId, undefined, {
    autoConfig: false,
    debug: process.env.NODE_ENV !== 'production',
  });
  pixelInitialized = true;
  return pixelInitialized;
};

export const initFacebookPixel = async (pixelId: string) => {
  await ensureInitialized(pixelId);
};

export const trackPageView = async () => {
  if (!(await ensureInitialized())) return;
  ReactPixel?.pageView();
};

export const trackStandardEvent = async (
  event: StandardPixelEvent,
  data?: Record<string, any>,
) => {
  if (!(await ensureInitialized())) return;
  ReactPixel?.track(event, data);
};

export const trackCustomEvent = async (event: string, data?: Record<string, any>) => {
  if (!(await ensureInitialized())) return;
  ReactPixel?.trackCustom(event, data);
};
