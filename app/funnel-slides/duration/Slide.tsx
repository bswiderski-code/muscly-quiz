"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';
import NextButton from '@/app/components/funnels/NextButton';
import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getDurationConfig } from './config';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import "../funnel.css";

const stepId: StepId = 'duration';

interface StepData {
    value: string;
    label: string;
}

export default function Page() {
  const funnel = useCurrentFunnel();
  const config = getDurationConfig(funnel);
  const t = useTranslations(config.translationNamespace);
  const { idx, total, value, select, goPrev } = useStepController(stepId);

  const steps: StepData[] = useMemo(
    () => t.raw('steps') as unknown as StepData[],
    [t]
  );

  const defaultIndex = 2; 
  const rememberedIndex = steps.findIndex((s) => s.value === value);
  const sliderIndex = rememberedIndex >= 0 ? rememberedIndex : defaultIndex;
  const stepLabels = steps.map((s) => s.label);

  useEffect(() => {
    if (!value) {
      select(steps[defaultIndex].value, { advance: false });
    }
  }, [value, select, steps, defaultIndex]);

  const currentStep = steps[sliderIndex];
  const durationNum = Number(currentStep.value);

  const minutaLabel = durationNum === 1
    ? t('minuteLabelSingular')
    : durationNum < 5
    ? t('minuteLabelPluralFew')
    : t('minuteLabelPlural');

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title1') }} />
          <span dangerouslySetInnerHTML={{ __html: t.raw('title2') }} />
        </h1>

        <div className="funnel-big-value">
          {durationNum} {minutaLabel}
        </div>

        <div className="funnel-slider-wrap">
          <StepRangeSlider
            steps={stepLabels}
            initialIndex={defaultIndex}
            rememberedIndex={sliderIndex}
            onChange={(i, label) => select(steps[i].value, { advance: false })}
          />
        </div>

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            fieldKey="duration"
            fieldValue={steps[sliderIndex].value}
            onClick={() => select(steps[sliderIndex].value, { advance: true })}
          />
        </div>
      </div>
    </main>
  );
}
