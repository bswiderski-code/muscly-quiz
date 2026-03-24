import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

type CheckoutIntroProps = {
  funnelKey: string;
  locale: Locale;
  imageSrc?: string;
};

export default function CheckoutIntro({ funnelKey, locale, imageSrc }: CheckoutIntroProps) {
  const t = useTranslations('CheckoutProducts');

  // Determine text based on funnel and locale
  const text = t(`${funnelKey}.description`);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 12 }}>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 700 }}>
        <span dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  );
}