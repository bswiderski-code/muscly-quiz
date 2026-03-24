"use client";

import { useStepController } from '@/lib/quiz/useStepController'
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import ProgressHeader from '@/app/components/header/ProgressHeader'
import { useLocale, useTranslations } from 'next-intl';
import "../funnel.css";

const stepId: StepId = 'diet_goal'

export default function Page() {
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId)
  const { value: gender } = useStepController('gender' as StepId);
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('DietGoal');

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title" dangerouslySetInnerHTML={{__html: t.raw('title')}} />
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <div className="funnel-choices funnel-choices--stack" role="group" aria-label={t('titleAria')}> 
          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={() => select('bulk')}
              aria-pressed={value === 'bulk'}
              disabled={isPending && value === 'bulk'}
              aria-label={t('bulk.label')}
              style={{
                background: value === 'bulk' ? '#D9F166' : '#27272A',
                border: value === 'bulk' ? '1px solid #D9F166' : '1px solid #3F3F46',
                borderRadius: 14,
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 500,
                color: value === 'bulk' ? '#18181B' : '#FAFAFA',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {t('bulk.label')}
            </button>
            <p className="funnel-choice-desc" style={{ color: '#71717A', fontSize: '14px', marginTop: '4px' }}>
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
              style={{
                background: value === 'cut' ? '#D9F166' : '#27272A',
                border: value === 'cut' ? '1px solid #D9F166' : '1px solid #3F3F46',
                borderRadius: 14,
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 500,
                color: value === 'cut' ? '#18181B' : '#FAFAFA',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {t('cut.label')}
            </button>
            <p className="funnel-choice-desc" style={{ color: '#71717A', fontSize: '14px', marginTop: '4px' }}>
              {t('cut.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
