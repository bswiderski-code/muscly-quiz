"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import ProgressHeader from '@/app/components/header/ProgressHeader';
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';
import { useEffect } from 'react';
import NextButton from '@/app/components/funnels/NextButton';
import { useTranslations } from 'next-intl';
import { ASSET_PATHS } from '@/config/imagePaths';


const stepId: StepId = 'bodyfat';

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('Bodyfat');
  const { idx, total, value, select, goPrev, goNext, isPending } = useStepController(stepId);
  const { value: gender } = useStepController('gender' as StepId);

  const isFemale = gender === 'F';
  const MALE_STEPS_DATA = t.raw('stepsDataMale') as unknown as {
    value: string;
    label: string;
    info: string;
  }[];
  
  const FEMALE_STEPS_DATA = t.raw('stepsDataFemale') as unknown as {
    value: string;
    label: string;
    info: string;
  }[];

  const STEPS_DATA = isFemale ? FEMALE_STEPS_DATA : MALE_STEPS_DATA;
  const STEPS = STEPS_DATA.map(s => ({ value: s.value, label: s.label }));
  const imageByValue = isFemale ? ASSET_PATHS.bmiImages.female : ASSET_PATHS.bmiImages.male;
  const BF_MAP = new Map(STEPS_DATA.map(s => [s.value, { info: s.info, imageSrc: (imageByValue as Record<string, string>)[s.value] }]));

  const DEFAULT_VALUE = isFemale ? '20-24' : '15-19';

  useEffect(() => {
    if (!value) {
      select(DEFAULT_VALUE, { advance: false });
    }
  }, [value, select, DEFAULT_VALUE]);

  const rememberedIndex = Math.max(0, STEPS.findIndex((s) => s.value === value));
  const currentBodyfatValue = value || DEFAULT_VALUE;
  const currentData = BF_MAP.get(currentBodyfatValue) || BF_MAP.get(DEFAULT_VALUE)!;
  const currentLabel = STEPS.find(s => s.value === currentBodyfatValue)?.label || DEFAULT_VALUE + '%';
  const imageSrc = currentData.imageSrc;
  const infoText = currentData.info;
  const stepLabels = STEPS.map((s) => s.label);
  const initialIndex = STEPS.findIndex((s) => s.value === DEFAULT_VALUE);


  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      {/* Large preview area */}
      <div
        style={{
          background: '#ddd',
          height: 240, 
          borderBottom: '6px solid #000',
          margin: 0, 
          padding: 0,
          width: '100%', 
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <img
          src={imageSrc} 
          alt={t('alt')}
          style={{
            height: '94%',
            width: 'auto', 
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
            margin: -1,
            padding: 0,
          }}
        />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--bodyfat">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        <div className="funnel-big-value" style={{ fontSize: 24, textShadow: '0 4px 8px #eee, 0 2px 2px #bbb' }}>
          {currentLabel}
        </div>

        <div className="funnel-slider-wrap">
          <StepRangeSlider
            steps={stepLabels}
            initialIndex={initialIndex}
            rememberedIndex={rememberedIndex}
            onChange={(i, label) => select(STEPS_DATA[i].value, { advance: false })}
          />
        </div>

        <div className="funnel-subtitle">
          {infoText}
        </div>

        <div className="funnel-submit-wrap">
          <NextButton currentIdx={idx} onClick={goNext} />
        </div>
      </div>
    </main>
  );
}
