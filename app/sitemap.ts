import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getBaseUrlFromHeaders } from '@/lib/requestBaseUrl';
import { FUNNELS, getFunnelSlug, isFunnelAllowedOnDomain, type FunnelKey } from '@/lib/quiz/funnels';
import { routing } from '@/i18n/routing';
import { getIncomingHost } from '@/lib/domain/incomingHost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseUrlFromHeaders();

  if (!baseUrl) {
    return [];
  }

  // Get current domain to filter funnels by domain restrictions
  const h = await headers();
  const host = getIncomingHost(h);

  // Dynamically generate sitemap entries for all funnels across all locales
  // Only include funnels allowed on the current domain
  const entries = routing.locales.flatMap((locale) =>
    (Object.keys(FUNNELS) as FunnelKey[])
      .filter((funnelKey) => isFunnelAllowedOnDomain(funnelKey, host))
      .map((funnelKey) => ({
        url: `${baseUrl}/${getFunnelSlug(funnelKey)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      }))
  );

  return entries;
}
