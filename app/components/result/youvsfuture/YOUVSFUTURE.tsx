'use client'

import { useFunnelStore } from '@/lib/quiz/store';
import { useTranslations } from "next-intl";
import { useMemo } from 'react';
import type { FunnelKey } from '@/lib/quiz/funnels'
import { getYouVsFutureConfig } from './config';

// --- Helper: dynamic plan calculation (modyfikacja: użycie klucza aktywności zamiast tłumaczenia) ---
function getDynamicPlan({
  weight, bmi, diet_goal, ageIn, activity, heightCm,
}: {
  weight: number; bmi?: number; diet_goal: string; ageIn?: number; activity?: string; heightCm?: number;
}) {
  const isMale = true;
  const age = ageIn ?? 30;

  // Logika kluczy aktywności jest bezpieczniejsza. Używamy kluczy, które są zapisane w Zustand.
  const activityFactor =
    activity === "hard_work" ? 1.1 : // Modyfikacja: użycie klucza z Zustand
    activity === "regular_training" ? 1.05 :
    activity === "light_training" ? 1.0 :
    activity === "some_activity" ? 0.95 :
    0.85; // 'low_activity' lub nieznane

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  // ... (reszta logiki obliczeń BMI/Wagi pozostaje bez zmian)

  let heightM: number | null = null;
  if (typeof heightCm === "number" && heightCm > 100) heightM = heightCm / 100;
  else if (typeof bmi === "number" && bmi > 0 && weight > 0) heightM = Math.sqrt(weight / bmi);

  const sweetBulk = isMale ? 23.8 : 22.8;
  const sweetCut  = isMale ? 22.8 : 21.8;
  const bmiNudge = isMale ? 0.8 : 0.5;
  const minGainAbs = isMale ? 4 : 3;
  const minLossAbs = isMale ? 4 : 3;

  let desiredWeight: number = weight;
  if (heightM) {
    const capBmi = 24.9;
    const curBmi = typeof bmi === "number" && bmi > 0 ? bmi : weight / (heightM * heightM);
    let targetBmi: number;

    if (diet_goal === "bulk") { // Klucze diet_goal: 'bulk' i 'cut'
      if (curBmi >= capBmi - 0.4) {
        targetBmi = Math.min(curBmi, capBmi - 0.4);
      } else {
        const nudged = Math.max(sweetBulk, curBmi + bmiNudge);
        targetBmi = Math.min(nudged, capBmi - 0.4);
      }
      desiredWeight = targetBmi * heightM * heightM;
      if (desiredWeight < weight + minGainAbs) desiredWeight = weight + minGainAbs;
    } else if (diet_goal === "cut") {
      if (curBmi > 25) targetBmi = isMale ? 23.2 : 22.2;
      else targetBmi = Math.min(curBmi - 0.6, sweetCut);
      targetBmi = Math.max(targetBmi, isMale ? 20.5 : 19.5);
      desiredWeight = targetBmi * heightM * heightM;
      if (desiredWeight > weight - minLossAbs) desiredWeight = weight - minLossAbs;
    }
  } else {
    if (diet_goal === "bulk") {
      const minGainFallback = isMale ? 4 : 3;
      const delta = Math.max(clamp(weight * 0.05, 2, isMale ? 6 : 4.5), minGainFallback);
      desiredWeight = clamp(weight + delta, Math.max(40, weight - 20), Math.max(45, weight + 10));
    } else if (diet_goal === "cut") {
      const minLossFallback = isMale ? 4 : 3;
      const delta = Math.min(-clamp(weight * 0.07, 3, 10), -minLossFallback);
      desiredWeight = clamp(weight + delta, Math.max(40, weight - 20), Math.max(45, weight + 10));
    }
  }

  return {
    desiredWeight: Math.round(desiredWeight * 10) / 10,
  };
}

export default function YOUVSFUTURE({
  sid,
  weight,
  diet_goal,
  age,
  activity,
  heightCm,
  bodyfat,
  funnelKey,
  style,
}: {
  sid: string;
  weight: number;
  diet_goal: string;
  age: number;
  activity: string;
  heightCm?: number;
  bodyfat?: string;
  funnelKey: FunnelKey;
  style?: React.CSSProperties;
}) {
  const t = useTranslations('YouVsFuture');
  const answers = useFunnelStore((state) => state.getFor(sid, funnelKey));

  const config = useMemo(() => getYouVsFutureConfig(funnelKey), [funnelKey]);

  // Get gender from store
  const gender = answers?.gender;
  const isFemale = gender === 'F';

  const bodyfatValue = bodyfat || "10-14";
  const bodyfatPercentage = config.bodyfatPercentageMap[bodyfatValue] || 20;
  const fitness = answers?.fitness || 0;

  const fitnessPercentage = Math.max(0, Math.min(100, (fitness * 10) * 0.7));

  // --- Nowy dynamiczny plan ---
  const { desiredWeight } = getDynamicPlan({
    weight, bmi: undefined, diet_goal: diet_goal, ageIn: age, activity, heightCm,
  });

  const targetWeight = answers?.weight_goal ?? (typeof desiredWeight === 'number' ? desiredWeight : undefined);

  const { lineThickness, lineColor, lineHeight } = config;

  // Determine metric and values
  const usedMetric = answers?.usedMetric === 'us' ? 'us' : 'eu';
  const nowWeight = answers?.weight_raw ?? weight;
  const futureWeight = answers?.weight_goal_raw ?? targetWeight;
  const unitLabel = usedMetric === 'us' ? 'lbs' : 'kg';

  return (
    <div style={{ margin: '4px', boxSizing: 'border-box', ...style }}>
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          fontFamily: "inherit",
          position: "relative",
          lineHeight: lineHeight,
        }}
      >
        {/* Opisy i wagi */}
        <div style={{ display: "flex", justifyContent: "center", fontWeight: 700, fontSize: config.headerFontSize, marginTop: 8, color: "var(--ds-text)" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            {t('now')}
            <div style={{ fontWeight: 400, fontSize: config.labelFontSize, marginTop: 4, color: "rgba(244,244,245,0.55)" }}>
              {t('weight')} <span style={{ fontWeight: 700, fontSize: config.valueFontSize, color: "var(--ds-text)" }}>{nowWeight ? `${nowWeight}${unitLabel}` : "-"}</span>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            {t('future')}
            <div style={{ fontWeight: 400, fontSize: config.labelFontSize, marginTop: 4, color: "rgba(244,244,245,0.55)" }}>
              {t('weight')} <span style={{ fontWeight: 700, fontSize: config.valueFontSize, color: "var(--ds-primary)" }}>{futureWeight ? `${futureWeight}${unitLabel}` : "-"}</span>
            </div>
          </div>
        </div>

        {/* Kreski */}
        <div style={{ height: lineThickness, background: "rgba(255,255,255,0.1)", width: "100%", margin: "12px 0 0 0", borderRadius: lineThickness }} />
        <div
          style={{
            position: "absolute",
            top: config.verticalLineTop,
            bottom: config.verticalLineBottom,
            left: "50%",
            width: lineThickness,
            background: "rgba(255,255,255,0.1)",
            transform: "translateX(-50%)",
            borderRadius: "18px",
          }}
        />

          {/* Mięśnie, sprawność, tkanka tłuszczowa */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
          {/* Lewa kolumna */}
          <div style={{ flex: 1 }}>
            <div style={{ textAlign: "center", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "rgba(244,244,245,0.6)" }}>{t('muscle')}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ width: "40%", height: "100%", background: "linear-gradient(90deg, #ef5350, #e57373)" }} />
            </div>
            <div style={{ textAlign: "center", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "rgba(244,244,245,0.6)" }}>{t('fitness')}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ width: `${fitnessPercentage}%`, height: "100%", background: "linear-gradient(90deg, #42a5f5, #90caf9)" }} />
            </div>
            <div style={{ textAlign: "center", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "rgba(244,244,245,0.6)" }}>{t('bodyfat')}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${bodyfatPercentage}%`, height: "100%", background: "linear-gradient(90deg, #ffa726, #ffcc80)" }} />
            </div>
          </div>

          {/* Prawa kolumna */}
          <div style={{ flex: 1 }}>
            <div style={{ textAlign: "center", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "rgba(244,244,245,0.6)" }}>{t('muscle')}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ width: diet_goal === "bulk" ? "90%" : "80%", height: "100%", background: "linear-gradient(90deg, #ef5350, #e57373)" }} />
            </div>
            <div style={{ textAlign: "center", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "rgba(244,244,245,0.6)" }}>{t('fitness')}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #42a5f5, #90caf9)" }} />
            </div>
            <div style={{ textAlign: "center", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "rgba(244,244,245,0.6)" }}>{t('bodyfat')}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ width: `25%`, height: "100%", background: "linear-gradient(90deg, #ffa726, #ffcc80)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}