"use client";

import { useStepController } from '@/lib/quiz/useStepController'
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import ProgressHeader from '@/app/components/header/ProgressHeader'
import { useLocale, useTranslations } from 'next-intl';
import "../funnel.css";

const stepId: StepId = 'location';

export default function Page() {
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('Location');
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);
  const { value: gender } = useStepController('gender' as StepId);

  function handleSelectGym() {
    select('gym');
  }

  function handleSelectHome() {
    select('house');
  }

  const gymLabel = gender === 'F' ? t('gym.label_f') : t('gym.label');
  const homeLabel = gender === 'F' ? t('home.label_f') : t('home.label');

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <div className="funnel-choices funnel-choices--stack" role="group" aria-label={t('ariaLabelGroup')}>
          {/* Siłownia container */}
          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={handleSelectGym}
              aria-pressed={value === 'gym'}
              disabled={isPending && value === 'gym'}
              aria-label={gymLabel}
              style={{
                background: value === 'gym' ? '#D9F166' : '#27272A',
                border: value === 'gym' ? '1px solid #D9F166' : '1px solid #3F3F46',
                borderRadius: 14,
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 500,
                color: value === 'gym' ? '#18181B' : '#FAFAFA',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {gymLabel}
            </button>
            <p className="funnel-choice-desc">
              {gender === 'F' ? t('gym.description_f') : t('gym.description')}
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
              aria-label={homeLabel}
              style={{
                background: value === 'house' ? '#D9F166' : '#27272A',
                border: value === 'house' ? '1px solid #D9F166' : '1px solid #3F3F46',
                borderRadius: 14,
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 500,
                color: value === 'house' ? '#18181B' : '#FAFAFA',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {homeLabel}
            </button>
            <p className="funnel-choice-desc">
              {gender === 'F' ? t('home.description_f') : t('home.description')}
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
