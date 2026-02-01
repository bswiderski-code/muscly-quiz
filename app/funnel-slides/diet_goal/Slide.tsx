"use client";

import { useStepController } from '@/lib/useStepController'
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import ProgressHeader from '@/app/components/header/ProgressHeader'
import { useLocale, useTranslations } from 'next-intl';
import "../funnel.css";
import { getDietGoalConfig } from './config'
import { withLocale } from '@/app/funnel-slides/_config/helpers'

const stepId: StepId = 'diet_goal'

export default function Page() {
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId)
  const { value: gender } = useStepController('gender' as StepId);
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const config = getDietGoalConfig(funnel);
  const t = useTranslations(config.translationNamespace);

  const bulkSrc =
    gender === 'F'
      ? withLocale(config.assets.bulk.female, locale)
      : withLocale(config.assets.bulk.male, locale);

  const cutSrc =
    gender === 'F'
      ? withLocale(config.assets.cut.female, locale)
      : withLocale(config.assets.cut.male, locale);

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title" dangerouslySetInnerHTML={{__html: t.raw('title')}} />

        <div className="funnel-choices funnel-choices--stack" role="group" aria-label={t('titleAria')}> 
          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={() => select('bulk')}
              aria-pressed={value === 'bulk'}
              disabled={isPending && value === 'bulk'}
              aria-label={t('bulk.label')}
            >
              <img
                src={bulkSrc}
                alt={t('bulk.alt')}
              />
            </button>
            <p className="funnel-choice-desc">
              {t('bulk.description')}
            </p>
          </div>

          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={() => select('cut')}
              aria-pressed={value === 'cut'}
              disabled={isPending && value === 'cut'}
              aria-label={t('cut.label')}
            >
              <img
                src={cutSrc}
                alt={t('cut.alt')}
              />
            </button>
            <p className="funnel-choice-desc">
              {t('cut.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
