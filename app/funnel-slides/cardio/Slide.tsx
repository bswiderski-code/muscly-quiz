"use client";

import { useStepController } from "@/lib/useStepController";
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import { useLocale, useTranslations } from "next-intl";
import { withLocale } from '@/lib/imagePath'
import "../funnel.css";

const stepId: StepId = "cardio";

const ASSETS = {
  mainImage: '/vectors/cardio.svg',
  yesBtn: '/btns/{locale}/yes-cardio-btn.svg',
  noBtn: '/btns/{locale}/no-cardio-btn.svg',
};

export default function Page() {
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('CardioStep');
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);

  const yesSrc = withLocale(ASSETS.yesBtn, locale);
  const noSrc = withLocale(ASSETS.noBtn, locale);

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title" dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          <img 
            src={ASSETS.mainImage} 
            width={328} 
            height={354} 
            alt="" 
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="funnel-choices">
          <button
            type="button"
            className="funnel-choice-btn"
            onClick={() => select('yes')}
            disabled={isPending && value === 'yes'}
            aria-label={t('yesLabel')}
          >
            <img src={yesSrc} alt={t('yesAlt')} />
          </button>
          <button
            type="button"
            className="funnel-choice-btn"
            onClick={() => select('no')}
            disabled={isPending && value === 'no'}
            aria-label={t('noLabel')}
          >
            <img src={noSrc} alt={t('noAlt')} />
          </button>
        </div>
      </div>
    </main>
  );
}
