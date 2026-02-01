"use client";

import { useStepController } from '@/lib/useStepController';
import Image from "next/image";
import { useState, useEffect, useRef, FormEvent, useMemo } from "react";
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useFunnelStore } from "@/lib/store";
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import { useTranslations, useLocale } from 'next-intl';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
const stepId: StepId = "weight";

const IMAGES = {
  buttonExpandSrc: '/btns/{locale}/expand.svg',
  burningBicepsImage: '/vectors/burning_biceps.svg',
};

export default function Page() {
  const funnel = useCurrentFunnel();
  const { value: gender } = useStepController('gender' as StepId, { funnel });
  const { idx, total, goPrev, goNext, sid } = useStepController(stepId, { funnel });
  const t = useTranslations('Weight');
  const locale = useLocale();
  const [unit, setUnit] = useState<'kg' | 'lbs'>(() => {
    if (typeof window === 'undefined') return 'kg';
    if (locale === 'pl') return 'kg';
    return (locale === 'en' || locale.startsWith('en-')) ? 'lbs' : 'kg';
  });
  const [weight, setWeight] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [showSecond, setShowSecond] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [bicepVisible, setBicepVisible] = useState(false);

  const bySid = useFunnelStore((s) => s.bySid);
  const setField = useFunnelStore((s) => s.setField);

  const isPending = false;

  const secondRef = useRef<HTMLDivElement | null>(null);
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
  const isValidWeightGoal = (s: string) => {
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
    const currentWeightGoal = toNumber(weightGoal);
    if (unit === 'kg') {
      // kg -> lbs
      if (Number.isFinite(currentWeight)) setWeight((currentWeight * 2.20462).toFixed(1));
      if (Number.isFinite(currentWeightGoal)) setWeightGoal((currentWeightGoal * 2.20462).toFixed(1));
      setUnit('lbs');
    } else {
      // lbs -> kg
      const valWeight = Number.isFinite(currentWeight) ? currentWeight / 2.20462 : NaN;
      const valWeightGoal = Number.isFinite(currentWeightGoal) ? currentWeightGoal / 2.20462 : NaN;

      if (Number.isFinite(valWeight)) setWeight(valWeight.toFixed(1));
      if (Number.isFinite(valWeightGoal)) setWeightGoal(valWeightGoal.toFixed(1));
      setUnit('kg');
    }
  };

  // cel diety z Zustand (po sid)
  const dietGoal = useMemo(() => (sid ? bySid[sid]?.diet_goal ?? null : null), [sid, bySid]);

  // clamp zgodnie z celem
  const clampTarget = (n: number, cel: string | null, wAkt: number) => {
    if (!Number.isFinite(n) || !Number.isFinite(wAkt)) return n;
    if (cel === "bulk") return Math.max(n, wAkt);
    if (cel === "cut") return Math.min(n, wAkt);
    return n;
  };

  // Prefill z pamięci
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

    const targetRaw = entry.weight_goal_raw;
    const targetKg = entry.weight_goal;
    if (unit === 'lbs') {
      if (targetRaw !== undefined && targetRaw !== null) {
        setWeightGoal(String(targetRaw));
        setShowSecond(true);
      } else if (targetKg !== undefined && targetKg !== null) {
        setWeightGoal((Number(targetKg) * 2.20462).toFixed(1));
        setShowSecond(true);
      }
    } else if (targetKg !== undefined && targetKg !== null) {
      setWeightGoal(String(targetKg));
      setShowSecond(true);
    }
  }, [sid, bySid, unit]);

  // Jeżeli użytkownik zmieni "weight" po rozwinięciu sekcji 2, dopnij "weight_goal" do limitu
  useEffect(() => {
    if (!showSecond) return;
    const w = toNumber(weight);
    const wc = toNumber(weightGoal);
    if (!Number.isFinite(w) || !Number.isFinite(wc)) return;
    const limited = clampTarget(wc, dietGoal, w);
    if (limited !== wc) setWeightGoal(String(limited));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, dietGoal, showSecond]);

  useEffect(() => {
    if (showSecond) {
      const animationDuration = 500;
      const timer = setTimeout(() => setBicepVisible(true), animationDuration);
      return () => clearTimeout(timer);
    } else {
      setBicepVisible(false);
    }
  }, [showSecond]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const weightValue = toNumber(weight);
    const weightGoalValue = toNumber(weightGoal);

    // Step 1
    if (!isValidWeight(weight)) {
      setError(t('error1'));
      return;
    }

    // Pierwsze kliknięcie → otwórz sekcję 2
    if (!showSecond) {
      if (sid) {
        const val = toNumber(weight);
        const valKg = unit === 'lbs' ? val / 2.20462 : val;
        setField(sid, "weight", Number(valKg.toFixed(1)));
      }
      setShowSecond(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          secondRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      });
      setError(null);
      return;
    }

    // Step 2
    if (!isValidWeightGoal(weightGoal)) {
      setGoalError(t('error2'));
      return;
    }

    // reguły celu diety
    if (dietGoal === "bulk" && weightGoalValue <= weightValue) {
      setGoalError(t('errorBulk'));
      return;
    }
    if (dietGoal === "cut" && weightGoalValue >= weightValue) {
      setGoalError(t('errorCut'));
      return;
    }

    // OK → zapisz i dalej
    setError(null);
    setGoalError(null);
    if (sid) {
      const wVal = toNumber(weight);
      const wValKg = unit === 'lbs' ? wVal / 2.20462 : wVal;
      
      const wcVal = toNumber(weightGoal);
      const wcValKg = unit === 'lbs' ? wcVal / 2.20462 : wcVal;

      setField(sid, "weight", Number(wValKg.toFixed(1)));
      setField(sid, "weight_goal", Number(wcValKg.toFixed(1)));
      setField(sid, "weight_raw", wVal);
      setField(sid, "weight_goal_raw", wcVal);
    }
    goNext();
  };

  // Guard przy NextButton (zostawiamy – dodatkowa ochrona)
  const guardNextCapture = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!showSecond) return;

    const w = toNumber(weight);
    const wc = toNumber(weightGoal);

    let localErr: string | null = null;
    let localGoalErr: string | null = null;

    if (!isValidWeight(weight)) localErr = t('error1');
    if (!isValidWeightGoal(weightGoal)) localGoalErr = t('error2');

    if (!localGoalErr && Number.isFinite(w) && Number.isFinite(wc)) {
      if (dietGoal === "bulk" && wc <= w)
        localGoalErr = t('errorBulk');
      if (dietGoal === "cut" && wc >= w)
        localGoalErr = t('errorCut');
    }

    if (localErr || localGoalErr) {
      e.preventDefault();
      // @ts-ignore
      e.stopPropagation?.();
      setError(localErr);
      setGoalError(localGoalErr);
    } else {
      setError(null);
      setGoalError(null);
    }
  };

  // Wyliczenia pomocnicze do opisu ograniczeń
  const weightNum = toNumber(weight);
  const minInfo =
    dietGoal === "bulk" && Number.isFinite(weightNum) ? `${weightNum} ${unit}` : undefined;
  const maxInfo =
    dietGoal === "cut" && Number.isFinite(weightNum) ? `${weightNum} ${unit}` : undefined;

  return (
    <div className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <form onSubmit={handleSubmit} className="funnel-content">
        {/* Sekcja 1 */}
        <section className="funnel-block funnel-block--reaper">
          <h1 className="funnel-title--sm">
            <span dangerouslySetInnerHTML={{ __html: t.raw('title1') }} />
          </h1>

          {error && (
            <p className="funnel-error funnel-error--left">
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

          <div className="funnel-input-shell funnel-input-shell--narrow">
            <input
              ref={firstInputRef}
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.]?[0-9]?"
              maxLength={5}
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
              placeholder={unit === 'kg' ? t('placeholder') : '176'}
              aria-label={t('ariaLabel1')}
            />
            <span className="funnel-unit">{unit}</span>
          </div>

          <div className="funnel-art funnel-art--reaper">
            <Image src="/vectors/death.svg" alt={t('alt1')} width={141} height={218} priority />
          </div>
        </section>

        {/* Sekcja 2 — rozwijana */}
        <div
          ref={secondRef}
          className={`funnel-section2 ${showSecond ? "show" : ""}`}
          aria-hidden={!showSecond}
          aria-expanded={showSecond}
        >
          <hr className="funnel-divider" />
          <section className="funnel-block funnel-block--bicep">
            <h2 className="funnel-title--sm">
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    locale === 'en' || locale.startsWith('en-')
                      ? t.raw('title2')
                      : (gender === 'F' ? 'Ile chciałabyś ważyć?' : t.raw('title2')),
                }}
              />
            </h2>

            {goalError && (
              <p className="funnel-error funnel-error--left">
                {goalError}
              </p>
            )}

            <div className="funnel-input-shell funnel-input-shell--narrow">
              <input
                inputMode="decimal"
                type="text"
                pattern="[0-9]*[.]?[0-9]?"
                maxLength={5}
                value={weightGoal}
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
                placeholder={unit === 'kg' ? t('placeholder') : '176'}
                aria-label={t('ariaLabel2')}
                aria-describedby="weightGoalHelp"
              />
              <span className="funnel-unit">{unit}</span>
            </div>

            <small id="weightGoalHelp" style={{ display: "block", textAlign: "left", opacity: 0.8, marginTop: 8 }}>
              {dietGoal === "bulk" && minInfo && (
                t.rich('infoBulk', { minInfo: minInfo })
              )}
              {dietGoal === "cut" && maxInfo && (
                t.rich('infoCut', { maxInfo: maxInfo })
              )}
            </small>

            <div className={`funnel-art funnel-art--bicep ${bicepVisible ? "slide-in-delayed" : ""}`}>
              <Image src={IMAGES.burningBicepsImage} alt={t('alt2')} width={141} height={147} priority />
            </div>
          </section>
        </div>

        {/* Przycisk */}
        <div className="funnel-submit-wrap">
          {showSecond ? (
            <div
              onClickCapture={guardNextCapture}
              onKeyDownCapture={(e) => {
                if (e.key === "Enter" || e.key === " ") guardNextCapture(e);
              }}
            >
              <NextButton
                currentIdx={idx}
                fieldKey="weight_goal"
                fieldValue={weightGoal}
                onClick={() => {
                  if (sid) {
                    const wVal = toNumber(weight);
                    const wValKg = unit === 'lbs' ? wVal / 2.20462 : wVal;
                    const wcVal = toNumber(weightGoal);
                    const wcValKg = unit === 'lbs' ? wcVal / 2.20462 : wcVal;
                    setField(sid, "weight", Number(wValKg.toFixed(1)));
                    setField(sid, "weight_goal", Number(wcValKg.toFixed(1)));
                    setField(sid, "weight_raw", wVal);
                    setField(sid, "weight_goal_raw", wcVal);
                    if (locale === 'pl') {
                      setField(sid, "usedMetric", 'eu');
                    } else {
                      setField(sid, "usedMetric", unit === 'lbs' ? 'us' : 'eu');
                    }
                  }
                  goNext();
                }}
              />
            </div>
          ) : (
            <button type="submit" className="funnel-next-btn" disabled={isPending} aria-label={t('buttonExpandAlt')}>
              <Image 
                src={IMAGES.buttonExpandSrc.replace('{locale}', locale)} 
                alt={t('buttonExpandAlt')} 
                width={324} 
                height={86} 
                priority 
              />
              <span className="funnel-sr-only">{t('buttonExpandAlt')}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
