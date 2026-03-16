"use client";

import { useFunnelStore } from "@/lib/quiz/store";
import { useTranslations } from "next-intl";
import type { FunnelKey } from '@/lib/quiz/funnels'

export default function TDEEBOX({ sid, funnelKey }: { sid: string; funnelKey: FunnelKey }) {
  const t = useTranslations('TDEE'); // Inicjalizacja tłumaczeń
  const answers = useFunnelStore((state) => state.getFor(sid, funnelKey));

  const { height: heightIn, weight: weightIn, age: ageIn, activity: activityIn, diet_goal, gender: genderIn } = answers || {};

  // Parse values as numbers
  const height = parseFloat(heightIn?.toString() || "");
  const weight = parseFloat(weightIn?.toString() || "");
  const age = parseFloat(ageIn?.toString() || "");
  const nowWeight = weight;
  let futureWeight = nowWeight;
  if (diet_goal === "bulk") {
    futureWeight = nowWeight + 6;
  } else if (diet_goal === "cut") {
    futureWeight = nowWeight - 6;
  }

  // Activity multipliers (example values) - Logika kluczy z Zustand (nie tłumaczymy kluczy)
  const activityMap: Record<string, number> = {
        "low_activity": 1.2,
        "some_activity": 1.35,
        "light_training": 1.5,
        "regular_training": 1.7,
        "hard_work": 1.9,
      };
  const activityMult = activityMap[activityIn || ""] || 1.5;

  // Calculate BMR (Mifflin-St Jeor)
  let bmr = 0;
  // Normalize gender: 'F' => 'female', 'M' => 'male', else fallback to string
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
  // TDEE
  const tdee = Math.round(bmr * activityMult);
  
  // Zmienne dla dynamicznego tekstu
  const finalTDEE = diet_goal === "cut" ? tdee - 300 : tdee + 300;
  const verbKey = diet_goal === "cut" ? 'mainDescActionCut' : 'mainDescActionBulk';
  const boldKey = diet_goal === "cut" ? 'mainDescBold1Cut' : 'mainDescBold1Bulk';

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "clamp(0px, 100vw, 340px)",
        margin: "0 auto 24px",
        background: "#EEEEEE",
        borderRadius: 22,
        border: "4px solid #111",
        boxShadow: "0 2px 0 #0002",
        padding: 12,
        boxSizing: "border-box",
        fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
        {t('title1')} +{" "}
        {diet_goal === "cut" ? t('deficit') : t('surplus')}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2 }}>
        {isNaN(tdee) || tdee === 0
          ? t('noData')
          : finalTDEE}{" "}
        <span style={{ fontSize: 24, fontWeight: 600 }}>{t('unit')}</span>
      </div>
      <div style={{ fontSize: 13, color: "#222", fontWeight: 400, marginTop: 4, lineHeight: 1.3 }}>
        {/* Rekonstrukcja dynamicznego zdania z tłumaczeń i HTML */}
        {t('mainDescPrefix')}
        <b style={{ fontWeight: 700 }}>
          {t(boldKey)}
        </b>
        {t('mainDescSuffix')}
        {t(verbKey)}.
      </div>
    </div>
  );
}