"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import { useState, useEffect, useMemo } from "react";
import type { StepId } from '@/lib/quiz/stepIds';
import { useFunnelStore } from "@/lib/quiz/store";
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import { useTranslations, useLocale } from 'next-intl';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import "../funnel.css";

const stepId: StepId = "weight_goal";

export default function Page() {
  const funnel = useCurrentFunnel();
  const { value: gender } = useStepController('gender' as StepId, { funnel });
  const { idx, goPrev, goNext, sid, isPending } = useStepController(stepId, { funnel });
  const { value: currentWeight } = useStepController('weight' as StepId, { funnel });
  const t = useTranslations('Weight');
  const locale = useLocale();
  
  const [unit, setUnit] = useState<'kg' | 'lbs'>(() => {
    if (typeof window === 'undefined') return 'kg';
    if (locale === 'pl') return 'kg';
    return (locale === 'en' || locale.startsWith('en-')) ? 'lbs' : 'kg';
  });
  
  const [weightGoal, setWeightGoal] = useState("");
  const [goalError, setGoalError] = useState<string | null>(null);

  const bySid = useFunnelStore((s) => s.bySid);
  const setField = useFunnelStore((s) => s.setField);

  // cel diety z Zustand
  const dietGoal = useMemo(() => (sid ? bySid[sid]?.diet_goal ?? null : null), [sid, bySid]);

  // Get current weight for validation
  const toNumber = (s: string) => {
    const n = Number(String(s).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };

  // Determine unit from stored data or current weight
  useEffect(() => {
    if (!sid) return;
    const entry = bySid[sid];
    if (entry?.weight_raw !== undefined && entry.weight !== undefined) {
      // If raw and kg values differ significantly, user was using lbs
      const raw = entry.weight_raw;
      const kg = entry.weight;
      if (Math.abs(raw - kg) > 10) {
        setUnit('lbs');
      } else {
        setUnit('kg');
      }
    }
  }, [sid, bySid]);

  // Prefill from storage
  useEffect(() => {
    if (!sid) return;
    const entry = bySid[sid];
    if (!entry) return;

    const targetRaw = entry.weight_goal_raw;
    const targetKg = entry.weight_goal;
    if (unit === 'lbs') {
      if (targetRaw !== undefined && targetRaw !== null) {
        setWeightGoal(String(targetRaw));
      } else if (targetKg !== undefined && targetKg !== null) {
        setWeightGoal((Number(targetKg) * 2.20462).toFixed(1));
      }
    } else if (targetKg !== undefined && targetKg !== null) {
      setWeightGoal(String(targetKg));
    }
  }, [sid, bySid, unit]);

  const isValidWeightGoal = (s: string) => {
    const n = toNumber(s);
    if (unit === 'kg') {
      return Number.isFinite(n) && n >= 30 && n <= 300;
    } else {
      return Number.isFinite(n) && n >= 66 && n <= 660;
    }
  };

  // Validation against diet goal and current weight
  const validateGoal = (goal: string): string | null => {
    if (!isValidWeightGoal(goal)) {
      return t('error2');
    }

    const goalValue = toNumber(goal);
    const currentWeightNum = toNumber(currentWeight || '0');

    if (!Number.isFinite(goalValue) || !Number.isFinite(currentWeightNum)) {
      return null;
    }

    if (dietGoal === "bulk" && goalValue <= currentWeightNum) {
      return t('errorBulk');
    }
    if (dietGoal === "cut" && goalValue >= currentWeightNum) {
      return t('errorCut');
    }

    return null;
  };

  const handleNext = () => {
    const validationError = validateGoal(weightGoal);
    if (validationError) {
      setGoalError(validationError);
      return;
    }

    setGoalError(null);
    if (sid) {
      const wcVal = toNumber(weightGoal);
      const wcValKg = unit === 'lbs' ? wcVal / 2.20462 : wcVal;
      setField(sid, "weight_goal", Number(wcValKg.toFixed(1)));
      setField(sid, "weight_goal_raw", wcVal);
    }
    goNext();
  };

  // Helper text for min/max
  const currentWeightNum = toNumber(currentWeight || '0');
  const minInfo = dietGoal === "bulk" && Number.isFinite(currentWeightNum) ? `${currentWeightNum} ${unit}` : undefined;
  const maxInfo = dietGoal === "cut" && Number.isFinite(currentWeightNum) ? `${currentWeightNum} ${unit}` : undefined;

  // Calculate placeholder based on diet goal
  const getPlaceholder = () => {
    if (!Number.isFinite(currentWeightNum)) return undefined;
    
    let suggestedWeight: number;
    if (dietGoal === 'bulk') {
      suggestedWeight = currentWeightNum + 1;
    } else if (dietGoal === 'cut') {
      suggestedWeight = Math.max(currentWeightNum - 1, 1); // Prevent negative/zero
    } else {
      suggestedWeight = currentWeightNum;
    }
    
    // Format based on unit
    if (unit === 'lbs') {
      return suggestedWeight.toFixed(1);
    }
    return String(Math.round(suggestedWeight));
  };

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--with-fixed-button">
        <h1 className="funnel-title--sm">
          <span dangerouslySetInnerHTML={{
            __html: locale === 'en' || locale.startsWith('en-')
              ? t.raw('title2')
              : (gender === 'F' ? 'Ile chciałabyś <b>ważyć?</b>' : t.raw('title2')),
          }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle2')}</p>

        {goalError && (
          <p className="funnel-error">
            {goalError}
          </p>
        )}

        <div className="funnel-number-input-centered">
          <input
            inputMode="decimal"
            type="text"
            pattern="[0-9]*[.]?[0-9]?"
            maxLength={6}
            value={weightGoal}
            placeholder={getPlaceholder()}
            onChange={(e) => {
              const v = e.target.value;
              let s = v.replace(/[^\d.,]/g, "").replace(",", ".");
              s = s.replace(/(\..*)\./g, "$1");
              if (!/^\d{0,3}(\.\d?)?$/.test(s)) return;

              setWeightGoal(s);
              if (sid && unit === 'lbs') {
                const rawValue = toNumber(s);
                if (Number.isFinite(rawValue)) setField(sid, "weight_goal_raw", rawValue);
              }

              if (goalError) setGoalError(null);
            }}
            onBlur={() => {
              const n = toNumber(weightGoal);
              if (Number.isFinite(n)) setWeightGoal(String(n));
            }}
            aria-label={t('ariaLabel2')}
            aria-describedby="weightGoalHelp"
          />
          <span className="unit">{unit}</span>
        </div>

        <small id="weightGoalHelp" className="funnel-hint-text">
          {dietGoal === "bulk" && minInfo && (
            t.rich('infoBulk', { minInfo: minInfo })
          )}
          {dietGoal === "cut" && maxInfo && (
            t.rich('infoCut', { maxInfo: maxInfo })
          )}
        </small>

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            fieldKey="weight_goal"
            fieldValue={weightGoal}
            disabled={!isValidWeightGoal(weightGoal)}
            onClick={handleNext}
          />
        </div>
      </div>
    </main>
  );
}
