"use client";

import { useStepController } from "@/lib/useStepController";
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import SelectMenu, { type SelectOption } from "@/app/components/funnels/SelectMenu";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import "../funnel.css";

const stepId: StepId = "balance";

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('BalanceStep');
  const { idx, total, value, select, goPrev, goNext, isPending } = useStepController(stepId);
  const { value: gender } = useStepController('gender' as StepId);
  const [isValid, setIsValid] = useState(true);

  const options: SelectOption[] = useMemo(() => {
    const base = [
      { value: 'balance', label: t('options.balance') },
      { value: 'prioritized', label: t('options.prioritized') }
    ];
    if (gender === 'F') {
      base.push({ value: 'lower_only', label: t('options.lower_only') });
    } else {
      base.push({ value: 'upper_only', label: t('options.upper_only') });
    }
    return base;
  }, [t, gender]);

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
        <h1 className="funnel-title" dangerouslySetInnerHTML={{ __html: t.raw('title') }} />

        <SelectMenu
          name="balance"
          options={options}
          value={value || undefined}
          onChange={(val) => select(val, { advance: false })}
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
