"use client";

import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/useStepController';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getCalistenicExperienceConfig } from './config';
import { useFunnelStore } from '@/lib/store';
import "../funnel.css";

const stepId = 'calistenic_experience';

export default function Page() {
  const funnel = useCurrentFunnel();
  const config = getCalistenicExperienceConfig(funnel);
  const t = useTranslations(config.translationNamespace);
  const { idx, total, value, select, goPrev, goNext, sid: SID } = useStepController(stepId);
  const setField = useFunnelStore((s) => s.setField);
  const [isValid, setIsValid] = useState<boolean>(true);

  const options: SelectOption[] = useMemo(() => {
    return config.levelValues.map(key => ({
      value: key,
      label: <span style={{ fontSize: '18px' }}>{t(`options.${key}`)}</span>,
      details: <span style={{ fontSize: '16px', opacity: 0.8 }}>{t(`descriptions.${key}`)}</span>
    }));
  }, [t, config.levelValues]);

  const handleNext = () => {
    if (!isValid) return;
    if (value) {
      // Save both calistenic_experience and experience
      setField(SID, 'experience', String(value));
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
          name="calistenic_experience"
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
