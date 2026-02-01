import { getTranslations } from 'next-intl/server';
import { localeSeoMap, type DomainSeoConfig } from '@/config/domains/seo';

/**
 * Get locale-specific SEO configuration.
 * Falls back to translation-based SEO if locale not found in map.
 */
export async function getDomainSeo(
  host: string | null | undefined, // host is ignored now
  locale: string
): Promise<DomainSeoConfig> {
  const seo = localeSeoMap[locale];
  if (seo) {
    return seo;
  }

  // Fallback to locale-based translations from JSON files
  return getLocaleFallbackSeo(locale);
}

/**
 * Get locale-based SEO as fallback when locale not in seo.ts map.
 */
async function getLocaleFallbackSeo(locale: string): Promise<DomainSeoConfig> {
  const t = await getTranslations({ locale, namespace: 'Seo' });

  return {
    appTitle: t('appTitle'),
    home: {
      title: t('home.title'),
      description: t('home.description'),
    },
    plan: {
      title: t('plan.title'),
      description: t('plan.description'),
    },
    planForm: {
      title: t('planForm.title'),
      description: t('planForm.description'),
    },
  };
}

/**
 * Get app title for a locale.
 */
export async function getDomainAppTitle(
  host: string | null | undefined,
  locale: string
): Promise<string> {
  const seo = await getDomainSeo(host, locale);
  return seo.appTitle;
}

/**
 * Get SEO title for a specific page type or funnel.
 * 
 * @param pageType - 'home' or 'planForm' for special pages, or funnel key (e.g., 'plan') for funnel landing pages
 */
export async function getDomainSeoTitle(
  host: string | null | undefined,
  locale: string,
  pageType: 'home' | 'planForm' | string
): Promise<string> {
  const seo = await getDomainSeo(host, locale);
  
  if (seo.funnels && seo.funnels[pageType]) {
    return seo.funnels[pageType].title;
  }
  
  if (pageType === 'plan' && seo.plan) {
    return seo.plan.title;
  }
  
  if (pageType === 'home' && seo.home) {
    return seo.home.title;
  }
  if (pageType === 'planForm' && seo.planForm) {
    return seo.planForm.title;
  }
  
  return '';
}

/**
 * Get SEO description for a specific page type or funnel.
 * 
 * @param pageType - 'home' or 'planForm' for special pages, or funnel key (e.g., 'plan') for funnel landing pages
 */
export async function getDomainSeoDescription(
  host: string | null | undefined,
  locale: string,
  pageType: 'home' | 'planForm' | string
): Promise<string> {
  const seo = await getDomainSeo(host, locale);
  
  if (seo.funnels && seo.funnels[pageType]) {
    return seo.funnels[pageType].description;
  }
  
  if (pageType === 'plan' && seo.plan) {
    return seo.plan.description;
  }
  
  if (pageType === 'home' && seo.home) {
    return seo.home.description;
  }
  if (pageType === 'planForm' && seo.planForm) {
    return seo.planForm.description;
  }
  
  return '';
}
