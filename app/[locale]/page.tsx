import { redirect } from '@/i18n/routing';
import { getDefaultFunnelForLocale, getFunnelSlug } from '@/lib/funnels/funnels';
import type { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  const defaultFunnel = getDefaultFunnelForLocale(locale as Locale);
  const defaultFunnelSlug = getFunnelSlug(defaultFunnel, locale);

  // Przekierowanie do konkretnego leja (domyślny dla języka)
  redirect({
    href: {
      pathname: '/[funnel]',
      params: { funnel: defaultFunnelSlug }
    },
    locale: locale
  });
}
