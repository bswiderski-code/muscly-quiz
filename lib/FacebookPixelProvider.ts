'use client';

import { useEffect } from 'react';
import { initFacebookPixel, trackPageView } from '@/lib/facebookPixel';

interface FacebookPixelProviderProps {
  pixelId: string;
}

const FacebookPixelProvider = ({ pixelId }: FacebookPixelProviderProps) => {
  useEffect(() => {
    initFacebookPixel(pixelId);
    trackPageView();
  }, [pixelId]);

  return null;
};

export default FacebookPixelProvider;
