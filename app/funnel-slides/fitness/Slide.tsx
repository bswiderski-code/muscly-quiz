"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import type { StepId } from '@/lib/quiz/stepIds';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';
import NextButton from '@/app/components/funnels/NextButton';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import "../funnel.css";

const stepId: StepId = 'fitness';

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('Fitness');
  const { idx, total, value, select, goPrev } = useStepController(stepId);
  const { value: gender } = useStepController('gender' as StepId);

  const steps = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
    []
  );

  const defaultIndex = 4; 
  const rememberedIndex = steps.findIndex((s) => s.value === value);
  const sliderIndex = rememberedIndex >= 0 ? rememberedIndex : defaultIndex;
  const stepLabels = steps.map((s) => s.label);

  const currentNumber = Number(steps[sliderIndex].value);

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span
            dangerouslySetInnerHTML={{
              __html: t.raw('title1').replace(
                'oceniłbyś',
                gender === 'F' ? 'oceniłabyś' : 'oceniłbyś'
              ),
            }}
          />
        </h1>

        <div className="funnel-big-value funnel-big-value--xl">{currentNumber}</div>

        <div className="funnel-slider-wrap">
          <StepRangeSlider
            steps={stepLabels}
            initialIndex={defaultIndex}
            rememberedIndex={sliderIndex}
            onChange={(i) => select(steps[i].value, { advance: false })}
          />
        </div>

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            fieldKey="fitness"
            fieldValue={currentNumber}
            onClick={() => select(String(currentNumber), { advance: true })}
          />
        </div>
      </div>
    </main>
  );
}
