import type { Metadata } from "next";
import { GoogleTagManager } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { routing } from '@/i18n/routing';
import { createMetadata } from '@/lib/metadata';
import { getPathname } from '@/i18n/routing';
import { getBaseUrlFromHeaders } from '@/lib/requestBaseUrl';
import { getBaseUrlForLocale, getEffectiveHost, getMarketForLocale, type Locale } from '@/i18n/config';
import { getAppTitle } from '@/lib/metadata';
import FacebookPixelProvider from '@/lib/FacebookPixelProvider';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import "./globals.css"; // Wyjście katalog wyżej do globals.css

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // W Next 15 params to Promise
};

import { SITE_CONFIG } from '@/config/site';
import MobileContainer from '@/app/components/MobileContainer';
import { localeMetadata } from '@/config/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  // Get metadata for the current locale or fallback to English
  const seo = localeMetadata[locale] || localeMetadata.en;
  
  // Use home page metadata for the main layout/entry point
  const { title, description } = seo.home;
  
  const base = createMetadata({
    title,
    description,
    locale,
    baseUrl: SITE_CONFIG.baseUrl,
  });

  return {
    ...base,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  // 1. Odbieramy locale z params (await w Next 15)
  const { locale } = await params;

  // 2. Walidacja języka
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 3. Ustawienie locale dla komponentów serwerowych (wymagane w static generation)
  setRequestLocale(locale);

  // 4. Pobranie tłumaczeń
  const messages = await getMessages();
  const h = await headers();
  const host = getIncomingHost(h);
  const effectiveHost = getEffectiveHost(host) ?? host;
  const market = getMarketForLocale(locale as Locale);
  const appTitle = await getAppTitle(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <GoogleTagManager gtmId={SITE_CONFIG.gtmId} />
      <head>
        <meta name="apple-mobile-web-app-title" content={appTitle} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* 5. Wrapowanie aplikacji w Provider */}
        <NextIntlClientProvider messages={messages}>
            <FacebookPixelProvider pixelId={SITE_CONFIG.fbPixelId} />
            <MobileContainer>
              {children}
            </MobileContainer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// 6. Generowanie parametrów statycznych (opcjonalne, ale zalecane dla wydajności)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}