'use client';

import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { resolveFunnelKeyByResultSlug, FUNNELS } from '@/lib/funnels/funnels';
import { FunnelProvider } from '@/lib/funnels/funnelContext';
import StandardResultPage from '@/app/components/result/templates/StandardResultPage';

export default function ResultPage() {
  const t = useTranslations('ResultPage');
  const locale = useLocale();
  const params = useParams<{ funnel: string }>();
  const funnelSlug = params?.funnel;

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
    return (
      <FunnelProvider funnel={funnelKey}>
        <StandardResultPage />
      </FunnelProvider>
    );
  }

  return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1>Unknown Template</h1>
      </div>
    );
}