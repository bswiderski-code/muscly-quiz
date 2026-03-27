import { getLocale, getTranslations } from 'next-intl/server';
import CaseStudiesCarousel from './CaseStudiesCarousel';
import { buildCaseStudyCards, CASE_STUDY_CARD_DEFINITIONS } from '@/lib/case-studies';
import { getFunnelSlug } from '@/lib/quiz/funnels';
import { btnPrimary } from '@/app/components/ui/buttonClasses';

export interface CaseStudiesSectionProps {
  className?: string;
  /** Override the CTA button href. Defaults to the quiz start page. */
  ctaHref?: string;
  /** Override the CTA button label. Defaults to t('ctaLabel'). */
  ctaLabel?: string;
}

export default async function CaseStudiesSection({ className, ctaHref, ctaLabel }: CaseStudiesSectionProps) {
  const t = await getTranslations('ResultPage.caseStudies');
  const locale = await getLocale();
  const quizHref = ctaHref ?? `/${locale}/${getFunnelSlug('workout')}`;
  const rootClass = ['ds-case-studies-section', className].filter(Boolean).join(' ');

  const cards = buildCaseStudyCards(CASE_STUDY_CARD_DEFINITIONS, {
    defaultImageAlt: t('placeholderImageAlt'),
    beforeLabel: t('beforeLabel'),
    afterLabel: t('afterLabel'),
    trendIconLabelLoss: t('trendIconLabel'),
    trendIconLabelGain: t('trendIconLabelGain'),
  });

  return (
    <section id="casestudies" className={rootClass} aria-labelledby="case-studies-heading">
      <div className="ds-case-studies-section__inner">
        <header className="ds-case-studies-header">
          <h2 id="case-studies-heading" className="ds-case-studies-title">
            <span className="ds-case-studies-title__line">{t('line1')}</span>
            <span className="ds-case-studies-title__line">{t('line2')}</span>
            <span className="ds-case-studies-title__line ds-case-studies-title__line--accent">
              {t('line3')}
            </span>
          </h2>
        </header>
        <div className="ds-carousel-wrapper">
          <CaseStudiesCarousel cards={cards} />
        </div>
        <p className="ds-case-studies-legal">{t('legalNote')}</p>
        <div className="ds-case-studies-section__cta">
          <a className={btnPrimary} href={quizHref}>
            {ctaLabel ?? t('ctaLabel')}
          </a>
        </div>
      </div>
    </section>
  );
}
