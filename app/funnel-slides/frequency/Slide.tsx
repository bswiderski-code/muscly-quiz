"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';
import NextButton from '@/app/components/funnels/NextButton';
import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import "../funnel.css";

const stepId: StepId = 'frequency';

interface StepData {
    value: string;
    label: string;
}

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('Frequency');
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
  const dayNum = Number(currentStep.value);
  
  const dzienLabel = dayNum === 1 
    ? t('dayLabelSingular') 
    : t('dayLabelPlural');

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
          {dayNum} {dzienLabel}
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
            fieldKey="frequency"
            fieldValue={steps[sliderIndex].value}
            onClick={() => select(steps[sliderIndex].value, { advance: true })}
          />
        </div>
      </div>
    </main>
  );
}
