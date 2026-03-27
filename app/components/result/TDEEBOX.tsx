"use client";

import { useFunnelStore } from "@/lib/quiz/store";
import { useTranslations } from "next-intl";
import type { FunnelKey } from '@/lib/quiz/funnels'

export default function TDEEBOX({ sid, funnelKey }: { sid: string; funnelKey: FunnelKey }) {
  const t = useTranslations('TDEE');
  const answers = useFunnelStore((state) => state.getFor(sid, funnelKey));

  const { height: heightIn, weight: weightIn, age: ageIn, activity: activityIn, diet_goal, gender: genderIn } = answers || {};

  const height = parseFloat(heightIn?.toString() || "");
  const weight = parseFloat(weightIn?.toString() || "");
  const age = parseFloat(ageIn?.toString() || "");
  const nowWeight = weight;
  let futureWeight = nowWeight;
  if (diet_goal === "bulk") futureWeight = nowWeight + 6;
  else if (diet_goal === "cut") futureWeight = nowWeight - 6;

  const activityMap: Record<string, number> = {
    "low_activity": 1.2,
    "some_activity": 1.35,
    "light_training": 1.5,
    "regular_training": 1.7,
    "hard_work": 1.9,
  };
  const activityMult = activityMap[activityIn || ""] || 1.5;

  let bmr = 0;
  let gender = genderIn;
  if (genderIn === 'F') gender = 'female';
  else if (genderIn === 'M') gender = 'male';
  if (!isNaN(weight) && !isNaN(height) && !isNaN(age)) {
    if (gender === 'female' || gender === 'Kobieta') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }
  }
  const tdee = Math.round(bmr * activityMult);
  const finalTDEE = diet_goal === "cut" ? tdee - 300 : tdee + 300;
  const verbKey = diet_goal === "cut" ? 'mainDescActionCut' : 'mainDescActionBulk';
  const boldKey = diet_goal === "cut" ? 'mainDescBold1Cut' : 'mainDescBold1Bulk';

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto 14px",
        background: "var(--ds-card-bg)",
        borderRadius: 10,
        border: "0.5px solid rgba(255,255,255,0.07)",
        padding: 14,
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(244,244,245,0.35)", marginBottom: 6 }}>
        {t('title1')} + {diet_goal === "cut" ? t('deficit') : t('surplus')}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2, color: "var(--ds-primary)" }}>
        {isNaN(tdee) || tdee === 0 ? t('noData') : finalTDEE}{" "}
        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(244,244,245,0.4)" }}>{t('unit')}</span>
      </div>
      <div style={{ fontSize: 12, color: "rgba(244,244,245,0.5)", fontWeight: 400, marginTop: 6, lineHeight: 1.5 }}>
        {t('mainDescPrefix')}
        <b style={{ fontWeight: 700, color: "rgba(244,244,245,0.75)" }}>{t(boldKey)}</b>
        {t('mainDescSuffix')}
        {t(verbKey)}.
      </div>
    </div>
  );
}
