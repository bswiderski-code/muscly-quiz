"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import type { StepId } from '@/lib/quiz/stepIds';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import NextButton from '@/app/components/funnels/NextButton';
import { useTranslations } from 'next-intl';
import "../funnel.css";

const stepId: StepId = 'name';

export default function Page() {
  const t = useTranslations('Name');
  const { idx, value, select, goPrev, canAdvanceFromAnswers } = useStepController(stepId);

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
        <form className="funnel-form-centered" onSubmit={(e) => e.preventDefault()}>
          <div className="funnel-number-input-centered" style={{ maxWidth: '100%', width: '100%' }}>
            <input
              type="text"
              autoComplete="given-name"
              value={value}
              onChange={(e) => select(e.target.value, { advance: false })}
              aria-label={t('ariaLabel')}
              placeholder={t('placeholder')}
              style={{ width: '100%', maxWidth: '280px', textAlign: 'center' }}
            />
          </div>
        </form>
        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            disabled={!canAdvanceFromAnswers}
            onClick={() => select(value.trim(), { advance: true })}
          />
        </div>
      </div>
    </main>
  );
}
