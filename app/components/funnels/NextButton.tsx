'use client'

import { useRouter } from "@/i18n/routing";
import { useFunnelStore } from "@/lib/store";
import { getFunnelSlug, getResultSlug, getStepOrder, getStepSlug, type FunnelKey } from "@/lib/funnels/funnels";
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import { resolveNextStep } from '@/lib/funnels/navigation';
import type { StepId } from '@/lib/steps/stepIds';
import { getNextButtonConfig } from './NextButton.config';

interface NextButtonProps {
  currentIdx: number;
  stepId: StepId;
  fieldKey?: string;
  fieldValue?: any; // Allow any type for fieldValue
  onClick: () => void;
  disabled?: boolean; // Add a disabled prop
  funnel?: FunnelKey;
}

const NextButton: React.FC<NextButtonProps> = ({ currentIdx, stepId, fieldKey = "", fieldValue, onClick, disabled = false, funnel: funnelProp }) => {
  const router = useRouter();
  const t = useTranslations('NextButton');
  const setField = useFunnelStore((s) => s.setField);
  const bySid = useFunnelStore((s) => s.bySid);
  const sid = Object.keys(bySid)[0]; // Assuming the first session ID is used
  const locale = useLocale() as Locale; // Get the current locale with project typing
  const funnel = funnelProp ?? useCurrentFunnel();
  const config = getNextButtonConfig(funnel);

  const handleClick = () => {
    // Store the field value in Zustand if fieldKey and fieldValue are provided
    if (sid && fieldKey) {
      setField(sid, fieldKey as any, fieldValue, funnel); // Save any type of value
    }

    if (onClick) {
      onClick();
      return;
    }

    // Use centralized navigation logic
    const answers = bySid[sid] || {};
    const nextAnswers = { ...answers, ...(fieldKey ? { [fieldKey]: fieldValue } : {}) };
    const nextStep = resolveNextStep(stepId, nextAnswers);

    if (nextStep) {
      router.push({ pathname: '/[funnel]/[step]', params: { funnel: getFunnelSlug(funnel, locale), step: getStepSlug(funnel, nextStep, locale) } } as any);
    } else if (sid) {
      router.push({ pathname: '/result/[funnel]/[sessionId]', params: { funnel: getResultSlug(funnel, locale), sessionId: sid } });
    } else {
      console.error("No session ID found.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled} // Disable the button if the prop is true
      style={{
        background: "none",
        border: "none",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      <img
        src={config.imageSrc.replace('{locale}', locale)}
        alt={config.alt}
        style={{ width: "90%", height: "auto", maxHeight: "60px", maxWidth: "400px" }} // Respect max width
      />
    </button>
  );
};

export default NextButton;