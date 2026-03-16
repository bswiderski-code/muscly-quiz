"use client";

import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/quiz/useStepController';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import "../funnel.css";

const stepId = 'pullups';

const PULLUPS_OPTIONS = ['0', '1-3', '4-6', '7-10', '10+'] as const;

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('PullupsStep');
  const { idx, total, value, select, goPrev, goNext } = useStepController(stepId);
  const [isValid, setIsValid] = useState<boolean>(true);

  const options: SelectOption[] = useMemo(() => {
    return PULLUPS_OPTIONS.map(key => ({
      value: key,
      label: <span style={{ fontSize: '18px' }}>{t(`options.${key}`)}</span>
    }));
  }, [t]);

  const handleNext = () => {
    if (!isValid) return;
    if (value) {
      select(value, { advance: true });
    } else {
      goNext();
    }
  };

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        <SelectMenu
          name="pullups"
          options={options}
          value={value || undefined}
          onChange={(v) => {
            if (v) {
              select(v, { advance: false });
            }
          }}
          canBeEmpty={false}
          onValidate={setIsValid}
        />

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            onClick={handleNext}
            disabled={!isValid}
          />
        </div>
      </div>
    </main>
  );
}
