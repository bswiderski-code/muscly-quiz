"use client";

import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/useStepController';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getPullupsConfig } from './config';
import "../funnel.css";

const stepId = 'pullups';

export default function Page() {
  const funnel = useCurrentFunnel();
  const config = getPullupsConfig(funnel);
  const t = useTranslations(config.translationNamespace);
  const { idx, total, value, select, goPrev, goNext } = useStepController(stepId);
  const [isValid, setIsValid] = useState<boolean>(true);

  const options: SelectOption[] = useMemo(() => {
    const values = config.ui.optionValues || [];
    return values.map(key => ({
      value: key,
      label: <span style={{ fontSize: '18px' }}>{t(`options.${key}`)}</span>
    }));
  }, [t, config.ui.optionValues]);

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
            onClick={handleNext}
            disabled={!isValid}
          />
        </div>
      </div>
    </main>
  );
}
