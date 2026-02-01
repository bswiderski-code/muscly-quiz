"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { Link, getPathname } from '@/i18n/routing';
import { getFirstStep, getFunnelSlug, getStepSlug, FUNNELS, type FunnelKey } from '@/lib/funnels/funnels';
import { funnelLandingConfigs } from '@/app/components/result/templates/landingPage/config';

import LanguageSwitcher from "@/app/components/LanguageSwitcher";

type FunnelLandingPageProps = {
  funnelKey: FunnelKey;
};

export default function FunnelLandingPage({ funnelKey }: FunnelLandingPageProps) {
  const landingConfig = funnelLandingConfigs[funnelKey];
  const translationNamespace = landingConfig.translationNamespace;
  const t = useTranslations(translationNamespace);
  const locale = useLocale() as Locale;

  const assets = useMemo(() => {
    const rawAssets = landingConfig.assets;
    const processPath = (path: string) => path.replace('{locale}', locale);

    return {
      logo: processPath(rawAssets.logo),
      logoHeight: parseInt(t('assets.logoHeight'), 10),
      heroImage: processPath(rawAssets.heroImage),
      heroWidth: rawAssets.heroWidth ?? 1000,
      heroHeight: rawAssets.heroHeight ?? 320,
      btnImage: processPath(rawAssets.btnImage),
      btnWidth: rawAssets.btnWidth ?? 1000,
      btnHeight: rawAssets.btnHeight ?? 72,
      homeUrl: rawAssets.homeUrl || t('assets.homeUrl'),
      privacyUrl: rawAssets.privacyUrl || t('assets.privacyUrl'),
      termsUrl: rawAssets.termsUrl || t('assets.termsUrl'),
    };
  }, [landingConfig, locale, t]);

  const titleText = useMemo(() => t.raw('titleHtml').replace(/<[^>]*>/g, '').trim(), [t]);
  const descriptionText = useMemo(() => t.raw('description').replace(/<[^>]*>/g, '').trim(), [t]);
  const ctaHref = useMemo(() => {
    const firstStep = getFirstStep(funnelKey);
    return {
      pathname: '/[funnel]/[step]',
      params: { funnel: getFunnelSlug(funnelKey, locale), step: getStepSlug(funnelKey, firstStep, locale) },
    } as const;
  }, [funnelKey, locale]);
  const ctaLocalizedPathname = useMemo(() => getPathname({ href: ctaHref, locale }), [ctaHref, locale]);
  const ctaAbsoluteUrl = useMemo(() => {
    if (!assets.homeUrl) return undefined;
    try {
      return new URL(ctaLocalizedPathname, assets.homeUrl).toString();
    } catch {
      return undefined;
    }
  }, [assets.homeUrl, ctaLocalizedPathname]);

  const structuredData = useMemo(() => JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: titleText,
    description: descriptionText,
    url: assets.homeUrl,
    inLanguage: locale,
    primaryImageOfPage: assets.heroImage ? {
      "@type": "ImageObject",
      url: assets.heroImage,
    } : undefined,
    potentialAction: ctaAbsoluteUrl ? {
      "@type": "Action",
      name: t('button'),
      target: ctaAbsoluteUrl,
    } : undefined,
  }), [assets.heroImage, assets.homeUrl, ctaAbsoluteUrl, descriptionText, locale, t, titleText]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <header style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 0, minHeight: `${parseInt(t('assets.headerContainerHeight'), 10)}px` }}>
          <Image
            src={assets.logo}
            alt={t('homeLabel')}
            width={320}
            height={assets.logoHeight}
            priority
            style={{ height: `${assets.logoHeight}px`, width: 'auto' }}
            onError={(e) => e.currentTarget.style.display = 'none'} // Hide image if it fails to load
          />
        </header>

        <h1 className="comic-relief-force" style={{ textAlign: 'center', margin: '0 0 8px 0', fontSize: 32, fontWeight: 400, lineHeight: 1.2 }}>
          <span dangerouslySetInnerHTML={{__html: t.raw('titleHtml')}} />
        </h1>

        <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '8px 0' }} aria-label={t('heroAlt')}>
          <Image
            src={assets.heroImage}
            alt={t('heroAlt')}
            width={assets.heroWidth}
            height={assets.heroHeight}
            priority
            style={{ width: `${assets.heroWidth}px`, height: `${assets.heroHeight}px`, maxWidth: '100%', objectFit: 'contain' }}
            onError={(e) => e.currentTarget.style.display = 'none'} // Hide image if it fails to load
          />
        </section>

        <section style={{ width: '100%' }}>
          <p style={{ textAlign: 'center', fontSize: 21, margin: '8px 0 8px', lineHeight: 1.4 }} className="nunito-regular">
            <span dangerouslySetInnerHTML={{ __html: t.raw('description') }} />
          </p>
        </section>

        <section style={{ width: '100%' }}>
          <Link
            href={ctaHref}
            className="btn-image"
            aria-label={t('button')}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0 16px', display: 'block' }}
          >
            <Image
              src={assets.btnImage}
              alt={t('button')}
              width={assets.btnWidth}
              height={assets.btnHeight}
              priority
              style={{ width: `${assets.btnWidth}px`, height: `${assets.btnHeight}px`, maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => e.currentTarget.style.display = 'none'} // Hide image if it fails to load
            />
          </Link>
        </section>

        <footer style={{ textAlign: 'center', marginTop: 32, marginBottom: 8, fontSize: 18, fontFamily: 'inherit' }}>
            <div style={{ marginBottom: 8 }}>
              <a href={assets.privacyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none', display: 'block', marginBottom: 16 }}>
                {t('privacy')}
              </a>
              <a href={assets.termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none', display: 'block' }}>
                {t('terms')}
              </a>
            </div>
            <LanguageSwitcher />
        </footer>

        {structuredData && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        )}
      </div>
    </main>
  );
}

