import type { FunnelKey } from "@/lib/quiz/funnels";

export interface YouVsFutureConfig {
  // --- Lines & Dividers ---
  lineThickness: number;
  lineColor: string;

  // --- Text Styling ---
  // Default line height for text elements
  lineHeight: number;
  // Font sizes
  headerFontSize: number;
  labelFontSize: number;
  valueFontSize: number;

  // --- Vertical Divider Line Positioning ---
  verticalLineTop: number;
  verticalLineBottom: number;

  // --- Data Mapping ---
  // Bodyfat to percentage for the progress bars
  bodyfatPercentageMap: Record<string, number>;
}

const DEFAULT_CONFIG: YouVsFutureConfig = {
  lineThickness: 3,
  lineColor: "#222",

  lineHeight: 1.2,
  headerFontSize: 18,
  labelFontSize: 16,
  valueFontSize: 16,

  verticalLineTop: 234,
  verticalLineBottom: -16,

  bodyfatPercentageMap: {
    "5-9": 10,
    "10-14": 20,
    "15-19": 30,
    "20-24": 40,
    "25-29": 50,
    "30-34": 60,
    "35-39": 70,
    "40+": 80,
    ">40": 80,
  },
};

const FUNNEL_CONFIGS: Partial<Record<FunnelKey, Partial<YouVsFutureConfig>>> = {
  workout: {
    verticalLineTop: 234,
  },
};

export function getYouVsFutureConfig(funnelKey: FunnelKey): YouVsFutureConfig {
  const funnelConfig = FUNNEL_CONFIGS[funnelKey] || {};
  return {
    ...DEFAULT_CONFIG,
    ...funnelConfig,
  };
}
