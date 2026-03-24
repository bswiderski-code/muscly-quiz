"use client";

import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/quiz/useStepController';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import "../funnel.css";

const stepId = 'pushups';

const PUSHUPS_OPTIONS = ['0-5', '6-10', '11-20', '21-30', '30+'] as const;

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('PushupsStep');
  const { idx, total, value, select, goPrev, goNext } = useStepController(stepId);
  const [isValid, setIsValid] = useState<boolean>(true);

  const options: SelectOption[] = useMemo(() => {
    return PUSHUPS_OPTIONS.map(key => ({
      value: key,
      label: <span style={{ fontSize: '18px' }}>{t(`options.${key}`)}</span>
    }));
  }, [t]);

  const handleNext = () => {
    if (!isValid || !value) return;
    select(value, { advance: true });
  };

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        <SelectMenu
          name="pushups"
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
            disabled={!isValid || !value}
          />
        </div>
      </div>
    </main>
  );
}
