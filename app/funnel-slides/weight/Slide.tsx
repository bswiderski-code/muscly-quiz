"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import { useState, useEffect, useRef } from "react";
import type { StepId } from '@/lib/quiz/stepIds';
import { useFunnelStore } from "@/lib/quiz/store";
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import { useTranslations, useLocale } from 'next-intl';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import "../funnel.css";

const stepId: StepId = "weight";

export default function Page() {
  const funnel = useCurrentFunnel();
  const { idx, goPrev, goNext, sid, isPending } = useStepController(stepId, { funnel });
  const t = useTranslations('Weight');
  const locale = useLocale();
  
  const [unit, setUnit] = useState<'kg' | 'lbs'>(() => {
    if (typeof window === 'undefined') return 'kg';
    if (locale === 'pl') return 'kg';
    return (locale === 'en' || locale.startsWith('en-')) ? 'lbs' : 'kg';
  });
  
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bySid = useFunnelStore((s) => s.bySid);
  const setField = useFunnelStore((s) => s.setField);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // --- helpers ---
  const toNumber = (s: string) => {
    const n = Number(String(s).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };
  
  const isValidWeight = (s: string) => {
    const n = toNumber(s);
    if (unit === 'kg') {
      return Number.isFinite(n) && n >= 30 && n <= 300;
    } else {
      return Number.isFinite(n) && n >= 66 && n <= 660;
    }
  };

  const toggleUnit = () => {
    if (locale === 'pl') return; // Polish locale always EU
    const currentWeight = toNumber(weight);
    if (unit === 'kg') {
      // kg -> lbs
      if (Number.isFinite(currentWeight)) setWeight((currentWeight * 2.20462).toFixed(1));
      setUnit('lbs');
    } else {
      // lbs -> kg
      const valWeight = Number.isFinite(currentWeight) ? currentWeight / 2.20462 : NaN;
      if (Number.isFinite(valWeight)) setWeight(valWeight.toFixed(1));
      setUnit('kg');
    }
  };

  // Prefill from storage
  useEffect(() => {
    if (!sid) return;
    const entry = bySid[sid];
    if (!entry) return;

    const weightRaw = entry.weight_raw;
    const weightKg = entry.weight;
    if (unit === 'lbs') {
      if (weightRaw !== undefined && weightRaw !== null) {
        setWeight(String(weightRaw));
      } else if (weightKg !== undefined && weightKg !== null) {
        setWeight((Number(weightKg) * 2.20462).toFixed(1));
      }
    } else if (weightKg !== undefined && weightKg !== null) {
      setWeight(String(weightKg));
    }
  }, [sid, bySid, unit]);

  const handleNext = () => {
    if (!isValidWeight(weight)) {
      setError(t('error1'));
      return;
    }

    setError(null);
    if (sid) {
      const val = toNumber(weight);
      const valKg = unit === 'lbs' ? val / 2.20462 : val;
      setField(sid, "weight", Number(valKg.toFixed(1)));
      setField(sid, "weight_raw", val);
    }
    goNext();
  };

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--with-fixed-button">
        <h1 className="funnel-title--sm">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title1') }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle1')}</p>

        {error && (
          <p className="funnel-error">
            {error}
          </p>
        )}

        {locale === 'en' && (
          <div className="funnel-unit-switch-container">
            <div className="funnel-unit-switch" onClick={toggleUnit}>
              <div className="funnel-switch-slider" style={{ transform: unit === 'kg' ? 'translateX(100%)' : 'translateX(0)' }} />
              <div className={`funnel-unit-option ${unit === 'lbs' ? 'active' : ''}`}>lbs</div>
              <div className={`funnel-unit-option ${unit === 'kg' ? 'active' : ''}`}>kg</div>
            </div>
          </div>
        )}

        <div className="funnel-number-input-centered">
          <input
            ref={firstInputRef}
            inputMode="decimal"
            type="text"
            pattern="[0-9]*[.]?[0-9]?"
            maxLength={6}
            value={weight}
            onChange={(e) => {
              const v = e.target.value;
              let s = v.replace(/[^\d.,]/g, "").replace(",", ".");
              s = s.replace(/(\..*)\./g, "$1");
              if (/^\d{0,3}(\.\d?)?$/.test(s)) {
                setWeight(s);
                if (sid && unit === 'lbs') {
                  const rawValue = toNumber(s);
                  if (Number.isFinite(rawValue)) setField(sid, "weight_raw", rawValue);
                }
              }
              if (error) setError(null);
            }}
            aria-label={t('ariaLabel1')}
          />
          <span className="unit">{unit}</span>
        </div>

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            fieldKey="weight"
            fieldValue={weight}
            disabled={!isValidWeight(weight)}
            onClick={handleNext}
          />
        </div>
      </div>
    </main>
  );
}
