"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import type { StepId } from '@/lib/quiz/stepIds';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import BodyfatSliderCard from '@/app/components/funnels/BodyfatSliderCard';
import { useEffect } from 'react';
import NextButton from '@/app/components/funnels/NextButton';
import { useTranslations } from 'next-intl';

const stepId: StepId = 'dream_physique';

function bodyfatImageBasename(value: string): string {
  return value === '>40' ? 'gt40' : value;
}

export default function Page() {
  const t = useTranslations('Bodyfat');
  const { idx, value, select, goPrev, goNext } = useStepController(stepId);
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
  const BF_MAP = new Map(STEPS_DATA.map(s => [s.value, { info: s.info }]));

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
  const infoHtml = currentData.info;
  const stepLabels = STEPS.map((s) => s.label);
  const initialIndex = STEPS.findIndex((s) => s.value === DEFAULT_VALUE);

  const previewBasename = bodyfatImageBasename(currentBodyfatValue);
  const previewSrc = isFemale
    ? `/bodyfats/female/${previewBasename}.png`
    : `/bodyfats/male/${previewBasename}.png`;

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--bodyfat funnel-content--with-fixed-button">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <BodyfatSliderCard
          previewImage={{
            src: previewSrc,
            alt: t('previewAlt', { label: currentLabel }),
          }}
          isFemale={isFemale}
          overlapPreview
          descriptionHtml={infoHtml}
          descriptionKey={currentBodyfatValue}
          steps={stepLabels}
          initialIndex={initialIndex}
          rememberedIndex={rememberedIndex}
          onChange={(i) =>
            select(STEPS_DATA[i].value, { advance: false })
          }
        />

        <div className="funnel-submit-wrap">
          <NextButton currentIdx={idx} stepId={stepId} onClick={goNext} />
        </div>
      </div>
    </main>
  );
}
