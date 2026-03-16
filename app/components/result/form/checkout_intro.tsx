import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { funnelDefinitions } from '@/lib/quiz/funnelDefinitions';
import type { Locale } from '@/i18n/config';
import { ASSET_PATHS } from '@/config/imagePaths';
import { withLocale } from '@/lib/imagePath';

type CheckoutIntroProps = {
  funnelKey: string;
  locale: Locale;
  imageSrc?: string;
};

export default function CheckoutIntro({ funnelKey, locale, imageSrc }: CheckoutIntroProps) {
  const t = useTranslations('CheckoutProducts');

  // Determine image and text based on funnel and locale
  const defaultImageSrc = withLocale(ASSET_PATHS.resultPage.inclineSmith, locale);
  const finalImageSrc = imageSrc || defaultImageSrc;
  const text = t(`${funnelKey}.description`);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 12 }}>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 700 }}>
        <span dangerouslySetInnerHTML={{ __html: text }} />
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Image src={finalImageSrc} alt={text} width={196} height={224} style={{ width: 164, height: 'auto' }} />
      </div>
    </div>
  );
}