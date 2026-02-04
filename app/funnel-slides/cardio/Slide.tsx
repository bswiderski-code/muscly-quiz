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

const stepId: StepId = "cardio";

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('CardioStep');
  const { idx, total, value, select, goPrev, goNext, isPending } = useStepController(stepId);
  const [isValid, setIsValid] = useState(true);

  const options: SelectOption[] = useMemo(() => [
    { value: 'yes', label: t('options.yes') },
    { value: 'no', label: t('options.no') }
  ], [t]);

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
          name="cardio"
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
