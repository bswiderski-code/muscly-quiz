import { resolveFunnelKeyByResultSlug, FUNNELS } from '@/lib/funnels/funnels';
import { FunnelProvider } from '@/lib/funnels/funnelContext';
import StandardResultPage from '@/app/components/result/templates/StandardResultPage';
import FaqSection from '@/app/components/result/faq/FaqSection';
import { getTranslations } from 'next-intl/server';
import { getMarketForLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string; funnel: string; sessionId: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { locale, funnel: funnelSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'ResultPage' });

  const funnelKey = resolveFunnelKeyByResultSlug(funnelSlug ?? '', locale);

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
    return (
      <FunnelProvider funnel={funnelKey}>
        <StandardResultPage
          faqSection={<FaqSection locale={locale} />}
          checkoutProvider={checkoutProvider}
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