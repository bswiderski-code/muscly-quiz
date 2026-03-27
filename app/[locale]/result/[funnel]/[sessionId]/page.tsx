import { resolveFunnelKeyByResultSlug, FUNNELS } from '@/lib/quiz/funnels';
import { FunnelProvider } from '@/lib/quiz/funnelContext';
import StandardResultPage from '@/app/components/result/templates/StandardResultPage';
import FaqSection from '@/app/components/result/faq/FaqSection';
import CaseStudiesSection from '@/app/components/result/caseStudies/CaseStudiesSection';
import TrustSection from '@/app/components/result/trust/TrustSection';
import { getTranslations } from 'next-intl/server';
import { getMarketForLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { getCachedResultStats } from '@/lib/db/stats';

type Props = {
  params: Promise<{ locale: string; funnel: string; sessionId: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { locale, funnel: funnelSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'ResultPage' });

  const funnelKey = resolveFunnelKeyByResultSlug(funnelSlug ?? '');

  if (!funnelKey) {
     return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1>{t('errorTitle')}</h1>
        <p>{t('errorDescription')}</p>
      </div>
    );
  }

  const definition = FUNNELS[funnelKey];
  const template = definition.resultTemplate ?? 'standard';

  if (template === 'standard') {
    // Resolve checkoutProvider server-side so the env var is visible.
    const { checkoutProvider } = getMarketForLocale(locale as Locale);
    const { totalCount } = await getCachedResultStats();
    return (
      <FunnelProvider funnel={funnelKey}>
        <StandardResultPage
          faqSection={<FaqSection locale={locale} />}
          checkoutProvider={checkoutProvider}
          caseStudiesSection={<CaseStudiesSection ctaHref="#form-section" />}
          trustSection={
            <TrustSection
              locale={locale}
              initialCount={totalCount}
              funnelKey={funnelKey}
              ctaHref="#form-section"
            />
          }
        />
      </FunnelProvider>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Unknown Template</h1>
    </div>
  );
}