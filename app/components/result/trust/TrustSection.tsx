import { getTranslations } from 'next-intl/server';
import ReviewsMarquee from './ReviewsMarquee';
import TrustOrderCount from './TrustOrderCount';
import fs from 'fs';
import path from 'path';
import { routing } from '@/i18n/routing';
import { btnPrimary } from '@/app/components/ui/buttonClasses';
import { getFunnelSlug, type FunnelKey } from '@/lib/quiz/funnels';

interface TrustSectionProps {
  locale: string;
  initialCount: number;
  funnelKey?: FunnelKey;
  /** Override the CTA button href. Defaults to the quiz start page. */
  ctaHref?: string;
}

function listReviewImageSrcs(locale: string): string[] {
  const reviewsPath = path.join(process.cwd(), 'public/reviews', locale);
  if (!fs.existsSync(reviewsPath)) return [];
  const files = fs.readdirSync(reviewsPath);
  return files
    .filter((file) => /^rev\d+\.png$/i.test(file))
    .sort((a, b) => {
      const na = Number(a.replace(/^rev(\d+)\.png$/i, '$1'));
      const nb = Number(b.replace(/^rev(\d+)\.png$/i, '$1'));
      return na - nb;
    })
    .map((file) => `/reviews/${locale}/${file}`);
}

export default async function TrustSection({
  locale,
  initialCount,
  funnelKey = 'workout',
  ctaHref,
}: TrustSectionProps) {
  const t = await getTranslations('ResultPage');
  const quizPath = ctaHref ?? `/${locale}/${getFunnelSlug(funnelKey)}`;

  let imageSrcs: string[] = [];
  if ((routing.locales as readonly string[]).includes(locale)) {
    try {
      imageSrcs = listReviewImageSrcs(locale);
    } catch (error) {
      console.error(`[TrustSection] Error reading reviews for locale ${locale}:`, error);
    }
  }

  if (imageSrcs.length === 0) {
    return null;
  }

  return (
    <section id="opinie" className="ds-trust-section" aria-labelledby="reviews-heading">
      <div className="ds-trust-section__inner">
        <div className="ds-trust-section__intro">
          <p className="ds-trust-stat">
            {t('trustSection.statBefore')}
            <TrustOrderCount initial={initialCount} locale={locale} />
            {t('trustSection.statAfter')}
          </p>
          <h2 id="reviews-heading" className="ds-trust-headline">
            {t('trustSection.headline')}
          </h2>
        </div>

        <div className="ds-trust-marquee-wrap">
          <ReviewsMarquee locale={locale} imageSrcs={imageSrcs} />
        </div>

        <div className="ds-trust-section__cta">
          <a className={btnPrimary} href={quizPath}>
            {t('trustSection.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
