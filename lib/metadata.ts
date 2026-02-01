import type { Metadata } from "next";
import { defaultLocale, getBaseUrlForLocale, type Locale } from "@/i18n/config";

// Default base for canonicals; prefer config-driven domains.
const fallbackBaseUrl =
  getBaseUrlForLocale(defaultLocale) ||
  "http://localhost:3000";

const defaultFaviconPath = "/favicon/favicon.ico";
const appleTouchIconPath = "/favicon/apple-touch-icon.png";
const icon96Path = "/favicon/favicon-96x96.png";
const iconSvgPath = "/favicon/favicon.svg";
const manifestPath = "/favicon/site.webmanifest";

export type MetadataOptions = {
  title: string;
  description?: string;
  canonicalPath?: string;
  robots?: Metadata["robots"];
  locale?: string;
  baseUrl?: string;
};

function toOpenGraphLocale(locale?: string) {
  const normalized = locale?.toLowerCase();
  if (!normalized) return undefined;
  const map: Record<string, string> = {
    pl: "pl_PL",
    en: "en_US",
    de: "de_DE",
    fr: "fr_FR",
  };
  return map[normalized] || normalized;
}

function resolveBaseUrl(locale?: string, baseUrl?: string) {
  const inferredFromConfig = locale ? getBaseUrlForLocale(locale as Locale) : undefined;

  // For SEO canonicals we default to the *incoming* baseUrl (host header), so the same
  // app can be deployed behind multiple domains with different SEO.
  // If you want strict canonical host normalization, configure domains accordingly.
  return (
    baseUrl ||
    inferredFromConfig ||
    getBaseUrlForLocale(defaultLocale) ||
    fallbackBaseUrl
  );
}

function buildCanonicalUrl(path?: string, locale?: string, baseUrl?: string) {
  const base = resolveBaseUrl(locale, baseUrl);
  try {
    return path ? new URL(path, base).toString() : new URL(base).toString();
  } catch {
    return undefined;
  }
}

function isLocalDevBaseUrl(baseUrl?: string): boolean {
  if (!baseUrl) return false;
  try {
    const hostname = new URL(baseUrl).hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local')
    );
  } catch {
    return false;
  }
}

/**
 * Central place for building SEO metadata across the app.
 */
export function createMetadata(options: MetadataOptions): Metadata {
  const { title, description, canonicalPath, robots, locale, baseUrl } = options;

  const resolvedBase = resolveBaseUrl(locale, baseUrl);
  const isLocalDev = isLocalDevBaseUrl(resolvedBase);

  const canonical = isLocalDev ? undefined : buildCanonicalUrl(canonicalPath, locale, baseUrl);
  const ogUrl = isLocalDev ? undefined : (canonical || buildCanonicalUrl(undefined, locale, baseUrl));
  const ogLocale = toOpenGraphLocale(locale);

  // Helps Next resolve relative URLs in metadata consistently.
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(resolvedBase);
  } catch {
    metadataBase = undefined;
  }

  const metadata: Metadata = {
    title,
    description,
    icons: {
      icon: [
        { url: icon96Path, type: "image/png", sizes: "96x96" },
        { url: iconSvgPath, type: "image/svg+xml" },
      ],
      shortcut: defaultFaviconPath,
      apple: appleTouchIconPath,
    },
    manifest: manifestPath,
    ...(metadataBase ? { metadataBase } : {}),
    openGraph: {
      type: "website",
      title,
      ...(description ? { description } : {}),
      ...(ogUrl ? { url: ogUrl } : {}),
      ...(ogLocale ? { locale: ogLocale } : {}),
    },
  };

  if (canonical) {
    metadata.alternates = { canonical };
  }

  if (robots) {
    metadata.robots = robots;
  }

  return metadata;
}

export function funnelLandingMetadata(options: Omit<MetadataOptions, "robots">): Metadata {
  return createMetadata({
    ...options,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  });
}

export function funnelStepMetadata(options: Omit<MetadataOptions, "robots">): Metadata {
  return createMetadata({
    ...options,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        noarchive: true,
        nosnippet: true,
      },
    },
  });
}
