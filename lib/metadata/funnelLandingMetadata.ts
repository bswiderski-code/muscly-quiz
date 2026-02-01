import type { Metadata } from "next";
import { headers } from 'next/headers';
import { funnelLandingMetadata } from '@/lib/metadata';
import { getPathname } from '@/i18n/routing';
import { getBaseUrlFromHeaders } from '@/lib/requestBaseUrl';
import { routing } from '@/i18n/routing';
import { getBaseUrlForLocale, type Locale } from '@/i18n/config';
import { getDomainSeoTitle, getDomainSeoDescription } from '@/lib/seo/getDomainSeo';
import { getFunnelSlug, type FunnelKey } from '@/lib/funnels/funnels';
import { getIncomingHost } from '@/lib/domain/incomingHost';

/**
 * Generate metadata for a funnel landing page.
 * Handles domain-specific SEO, canonical paths, and language alternates.
 */
export async function generateFunnelLandingMetadata(
  funnelKey: FunnelKey,
  locale: string
): Promise<Metadata> {
  const h = await headers();
  const host = getIncomingHost(h);
  const baseUrl = await getBaseUrlFromHeaders();
  
  // Get domain-specific SEO using funnel key directly
  const title = await getDomainSeoTitle(host, locale, funnelKey);
  const description = await getDomainSeoDescription(host, locale, funnelKey);
  
  // Build canonical path using funnel slug
  // Note: Type cast needed because getPathname types don't support dynamically constructed paths
  // The routing system handles these paths via /[funnel] pattern, but TypeScript can't infer this
  const funnelSlug = getFunnelSlug(funnelKey, locale);
  const canonicalPath = getPathname({ href: `/${funnelSlug}` as any, locale });

  // Generate language alternates
  const languages = Object.fromEntries(
    routing.locales.flatMap((targetLocale) => {
      const base = getBaseUrlForLocale(targetLocale as Locale);
      if (!base) return [];
      // Type cast needed for same reason as above - dynamic path construction
      const targetFunnelSlug = getFunnelSlug(funnelKey, targetLocale);
      const path = getPathname({ href: `/${targetFunnelSlug}` as any, locale: targetLocale });
      return [[targetLocale, new URL(path, base).toString()]];
    }),
  );
  if (languages[routing.defaultLocale]) {
    languages['x-default'] = languages[routing.defaultLocale];
  }

  // Generate base metadata
  const base = funnelLandingMetadata({
    title,
    description,
    canonicalPath,
    locale,
    baseUrl,
  });

  return {
    ...base,
    alternates: {
      ...base.alternates,
      languages,
    },
  };
}

