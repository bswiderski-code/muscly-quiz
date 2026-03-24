"use client";

import { useStepController } from "@/lib/quiz/useStepController";
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import { useLocale, useTranslations } from "next-intl";
import "../funnel.css";

const stepId: StepId = "cardio";

export default function Page() {
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('CardioStep');
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title" dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <div className="funnel-choices">
          <button
            type="button"
            className="funnel-choice-btn"
            onClick={() => select('yes')}
            disabled={isPending && value === 'yes'}
            aria-label={t('yesLabel')}
            style={{
              background: value === 'yes' ? '#D9F166' : '#27272A',
              border: value === 'yes' ? '1px solid #D9F166' : '1px solid #3F3F46',
              borderRadius: 14,
              padding: '14px 18px',
              fontSize: 16,
              fontWeight: 500,
              color: value === 'yes' ? '#18181B' : '#FAFAFA',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {t('yesLabel')}
          </button>
          <button
            type="button"
            className="funnel-choice-btn"
            onClick={() => select('no')}
            disabled={isPending && value === 'no'}
            aria-label={t('noLabel')}
            style={{
              background: value === 'no' ? '#D9F166' : '#27272A',
              border: value === 'no' ? '1px solid #D9F166' : '1px solid #3F3F46',
              borderRadius: 14,
              padding: '14px 18px',
              fontSize: 16,
              fontWeight: 500,
              color: value === 'no' ? '#18181B' : '#FAFAFA',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {t('noLabel')}
          </button>
        </div>
      </div>
    </main>
  );
}
