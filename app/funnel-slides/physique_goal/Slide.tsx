"use client";

import { useStepController } from "@/lib/quiz/useStepController";
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import SelectMenu, { type SelectOption } from "@/app/components/funnels/SelectMenu";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import "../funnel.css";

const stepId: StepId = "physique_goal";

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('PhysiqueGoalStep');
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);
  const [isValid, setIsValid] = useState(true);

  const options: SelectOption[] = useMemo(() => [
    { value: 'aesthetic', label: t('options.aesthetic') },
    { value: 'strength', label: t('options.strength') },
    { value: 'health', label: t('options.health') }
  ], [t]);

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
        <h1 className="funnel-title" dangerouslySetInnerHTML={{ __html: t.raw('title') }} />

        <SelectMenu
          name="physique_goal"
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
            disabled={!isValid || !value}
          />
        </div>
      </div>
    </main>
  );
}
