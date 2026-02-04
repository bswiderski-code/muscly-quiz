"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';
import NextButton from '@/app/components/funnels/NextButton';
import { useTranslations } from 'next-intl';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import { useMemo } from 'react';
import "../funnel.css";

const stepId: StepId = 'sleep';

interface StepData {
    value: string;
    label: string;
}

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('Sleep');
  const { idx, total, value, select, goPrev } = useStepController(stepId);

  const steps: StepData[] = useMemo(() => t.raw('steps') as unknown as StepData[], [t]);
  const messages: string[] = useMemo(() => t.raw('messages') as unknown as string[], [t]);

  const defaultIndex = 1; 
  const rememberedIndex = steps.findIndex((s) => s.value === value);
  const sliderIndex = rememberedIndex >= 0 ? rememberedIndex : defaultIndex;
  const stepLabels = steps.map((s) => s.label);

  const currentLabel = steps[sliderIndex].label;

  const color = (idx: number) => (idx === 0 || idx === 3 ? '#c00' : '#2a9d3a');

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        <div className="funnel-big-value" style={{ color: color(sliderIndex) }}>
          {currentLabel}
        </div>
        <div className="funnel-subtitle">
          {messages[sliderIndex]}
        </div>

        <div className="funnel-slider-wrap" style={{ margin: '18px 0' }}>
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
            fieldKey="sleep"
            fieldValue={steps[sliderIndex].value}
            onClick={() => select(steps[sliderIndex].value, { advance: true })}
          />
        </div>
      </div>
    </main>
  );
}
