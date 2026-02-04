"use client";

import { useStepController } from '@/lib/useStepController'
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import ProgressHeader from '@/app/components/header/ProgressHeader'
import { useLocale, useTranslations } from 'next-intl';
import "../funnel.css";
import { withLocale } from '@/lib/imagePath'

const stepId: StepId = 'location';

const ASSETS = {
  gymImageSrc: '/btns/{locale}/gym-training-btn.svg',
  homeImageSrc: '/btns/{locale}/home-training-btn.svg',
};

export default function Page() {
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('Location');
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);
  const gymSrc = withLocale(ASSETS.gymImageSrc, locale);
  const homeSrc = withLocale(ASSETS.homeImageSrc, locale);

  function handleSelectGym() {
    select('gym');
  }

  function handleSelectHome() {
    select('house');
  }

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        <div className="funnel-choices funnel-choices--stack" role="group" aria-label={t('ariaLabelGroup')}>
          {/* Siłownia container */}
          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={handleSelectGym}
              aria-pressed={value === 'gym'}
              disabled={isPending && value === 'gym'}
              aria-label={t('gym.label')}
            >
                <img
                  src={gymSrc}
                  alt={t('gym.alt')}
                />
            </button>
            <p className="funnel-choice-desc">
              {t('gym.description')}
            </p>
          </div>

          {/* Dom container */}
          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={handleSelectHome}
              aria-pressed={value === 'house'}
              disabled={isPending && value === 'house'}
              aria-label={t('home.label')}
            >
                <img
                  src={homeSrc}
                  alt={t('home.alt')}
                />
            </button>
            <p className="funnel-choice-desc">
              {t('home.description')}
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
