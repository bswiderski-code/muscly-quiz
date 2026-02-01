"use client";

import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/useStepController';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import "../funnel.css";

const stepId = 'activity';

const OPTION_KEYS = ["low_activity", "some_activity", "light_training", "regular_training", "hard_work"] as const;

export default function Page() {
  const t = useTranslations('Activity');
  const { idx, total, value, select, goPrev, goNext } = useStepController(stepId);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);

  const options: SelectOption[] = useMemo(() => {
    return OPTION_KEYS.map(key => ({
      value: key,
      label: <span style={{ fontSize: '18px' }}>{t(`options.${key}`)}</span>
    }));
  }, [t]);

  const handleNext = () => {
    if (!isValid) {
      setShowError(true);
      return;
    }
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

        {showError && (
          <p className="funnel-error">
            {t('errorMsg')}
          </p>
        )}

        <SelectMenu
          name="activity"
          options={options}
          value={value || undefined}
          onChange={(v) => {
            if (v) {
              select(v, { advance: false });
            }
            setShowError(false);
          }}
          canBeEmpty={false}
          onValidate={(isValid) => {
            setIsValid(isValid);
            if (isValid) setShowError(false);
          }}
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
