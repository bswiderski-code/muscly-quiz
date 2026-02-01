import type { FunnelKey } from "@/lib/funnels/funnels";

export interface ResultPageConfig {
  // --- Images ---
  introBicepImage: string;
  dividerImage: string;
  trustImage: string;
  purchaseImage: string;
  sampleImage: string;
  ctaButtonImage: string;
  loadingErrorBtnImage: string;

  // --- Image Alt Texts ---
  introBicepAlt: string;
  dividerAlt: string;

  // --- Dimensions ---
  purchaseImageWidth: number;
  purchaseImageHeight: Record<string, number>; // Map of locale -> height

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
  answersButtonImage: string;
  checkoutIntroImage: string;

  // --- Image Alt Text Keys ---
  trustImageAltKey: string;
  purchaseImageAltKey: string;
  ctaButtonAltKey: string;
}

const DEFAULT_RESULT_CONFIG: ResultPageConfig = {
  // Images
  introBicepImage: "/vectors/bmibiceps.svg",
  dividerImage: "/components/dynamic_line.svg",
  trustImage: "/{locale}/needle/why-trust.svg",
  purchaseImage: "/{locale}/needle/product-description.svg",
  sampleImage: "/{locale}/needle/sample_guy.svg",
  ctaButtonImage: "/btns/{locale}/get_your.svg",
  loadingErrorBtnImage: "/btns/{locale}/once_again.svg",

  // Image Alts
  introBicepAlt: "BMI Biceps",
  dividerAlt: "Dynamic Line",

  // Dimensions
  purchaseImageWidth: 351,
  purchaseImageHeight: {
    pl: 301,
    en: 261,
    de: 261,
    fr: 261,
    ro: 261,
    default: 261,
  },

  // Layout Flags
  showBmiBox: true,
  showTdeeBox: true,
  showPlanSummary: true,
  showReviews: true,
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
  answersButtonImage: "buttonImage",
  checkoutIntroImage: "/vectors/exercises/incline_smith.svg",

  // Alt Text Keys
  trustImageAltKey: "trustImageAlt",
  purchaseImageAltKey: "purchaseImageAlt",
  ctaButtonAltKey: "ctaButton.alt",
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
