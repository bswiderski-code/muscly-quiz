import type { FunnelKey } from "@/lib/quiz/funnels";

export interface ResultPageConfig {
  // --- Layout & Feature Flags ---
  showBmiBox: boolean;
  showTdeeBox: boolean;
  showPlanSummary: boolean;
  showReviews: boolean;
  showFaq: boolean;
  showContactBox: boolean;

  // --- Spacing & Styling ---
  containerMaxWidth: number;

  // --- Translation Keys ---
  titleKey: string;
  intro1Key: string;
  intro2Key: string;
  subtitleKey: string;
  analyzeTitleKey: string;
  analyzeListKey: string;
  conclusion1Key: string;
  conclusion2Key: string;
  purchaseTitleKey: string;
  sampleBtnKey: string;
  sampleTitleKey: string;
  joinAthletesKey: string;
}

const DEFAULT_RESULT_CONFIG: ResultPageConfig = {
  // Layout Flags
  showBmiBox: true,
  showTdeeBox: true,
  showPlanSummary: true,
  showReviews: false,
  showFaq: true,
  showContactBox: true,

  // Styling
  containerMaxWidth: 800,

  // Translation Keys
  titleKey: "title",
  intro1Key: "intro1",
  intro2Key: "intro2",
  subtitleKey: "subtitle",
  analyzeTitleKey: "analyzeTitle",
  analyzeListKey: "analyzeList",
  conclusion1Key: "conclusion1",
  conclusion2Key: "conclusion2",
  purchaseTitleKey: "purchaseTitle",
  sampleBtnKey: "sampleBtn",
  sampleTitleKey: "sampleTitle",
  joinAthletesKey: "joinAthletes",
};

const FUNNEL_RESULT_CONFIGS: Partial<Record<FunnelKey, Partial<ResultPageConfig>>> = {
  workout: {
    // Uses all default values from needle set
  },
};

export function getResultPageConfig(funnelKey: FunnelKey): ResultPageConfig {
  const funnelConfig = FUNNEL_RESULT_CONFIGS[funnelKey] || {};
  return {
    ...DEFAULT_RESULT_CONFIG,
    ...funnelConfig,
  };
}
