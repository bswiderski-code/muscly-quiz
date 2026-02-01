import React from 'react';
import { resolveFunnelKey } from '@/lib/funnels/funnels';
import type { Locale } from '@/i18n/config';
import KalistenikaStyles from '@/app/components/funnels/KalistenikaStyles';

type Props = {
  children: React.ReactNode;
  params: Promise<{ funnel: string; locale: string }>;
};

export default async function FunnelLayout({ children, params }: Props) {
  const { funnel, locale } = await params;
  const funnelKey = resolveFunnelKey(funnel, locale as Locale);

  return (
    <div className={funnelKey === 'kalistenika' ? 'funnel-kalistenika' : ''}>
      {funnelKey === 'kalistenika' && <KalistenikaStyles />}
      {children}
    </div>
  );
}
