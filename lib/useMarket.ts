'use client'

import { useLocale } from 'next-intl';
import { getMarketForLocale, type MarketInfo, type Locale } from '@/i18n/config';
import { useMemo } from 'react';

export function useMarket(): MarketInfo {
  const locale = useLocale() as Locale;
  
  const market = useMemo(() => {
    return getMarketForLocale(locale);
  }, [locale]);

  return market;
}
