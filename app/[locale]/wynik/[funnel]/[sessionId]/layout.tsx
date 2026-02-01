import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { resolveFunnelKeyByResultSlug } from '@/lib/funnels/funnels';
import type { Locale } from '@/i18n/config';
import KalistenikaStyles from '@/app/components/funnels/KalistenikaStyles';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type Props = {
  children: ReactNode;
  params: Promise<{ funnel: string; locale: string }>;
};

export default async function ResultLayout({ children, params }: Props) {
  const { funnel, locale } = await params;
  const funnelKey = resolveFunnelKeyByResultSlug(funnel, locale as Locale);

  return (
    <div className={funnelKey === 'kalistenika' ? 'funnel-kalistenika' : ''}>
      {funnelKey === 'kalistenika' && <KalistenikaStyles />}
      {children}
    </div>
  );
}
