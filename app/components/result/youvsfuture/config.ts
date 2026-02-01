import type { FunnelKey } from "@/lib/funnels/funnels";

export interface YouVsFutureConfig {
  // --- Lines & Dividers ---
  lineThickness: number;
  lineColor: string;

  // --- Images ---
  bmiImgHeight: number;
  // Base dimensions used for aspect ratio in Next.js Image component
  bmiImgBaseWidth: number;
  bmiImgBaseHeight: number;

  // Male-specific images
  maleBodyfatMap: Record<string, string>;
  maleFinalImage: string;

  // Female-specific images
  femaleBodyfatMap: Record<string, string>;
  femaleFinalImage: string;

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

// -------------------------------------------------------------------------
// 1. DEFAULT CONFIGURATION (Plan Funnel)
// -------------------------------------------------------------------------
const DEFAULT_CONFIG: YouVsFutureConfig = {
  lineThickness: 3,
  lineColor: "#222",
  bmiImgHeight: 157,
  bmiImgBaseWidth: 680,
  bmiImgBaseHeight: 943,

  maleBodyfatMap: {
    "5-9": "/bodyfat_variants/needle/m_bodyfat_1.svg",
    "10-14": "/bodyfat_variants/needle/m_bodyfat_2.svg",
    "15-19": "/bodyfat_variants/needle/m_bodyfat_3.svg",
    "20-24": "/bodyfat_variants/needle/m_bodyfat_4.svg",
    "25-29": "/bodyfat_variants/needle/m_bodyfat_5.svg",
    "30-34": "/bodyfat_variants/needle/m_bodyfat_6.svg",
    "35-39": "/bodyfat_variants/needle/m_bodyfat_7.svg",
    ">40": "/bodyfat_variants/needle/m_bodyfat_8.svg",
  },
  maleFinalImage: "/bodyfat_variants/needle/m_final.svg",

  femaleBodyfatMap: {
    "10-14": "/bodyfat_variants/needle/k_bodyfat_1.svg",
    "15-19": "/bodyfat_variants/needle/k_bodyfat_2.svg",
    "20-24": "/bodyfat_variants/needle/k_bodyfat_3.svg",
    "25-29": "/bodyfat_variants/needle/k_bodyfat_4.svg",
    "30-39": "/bodyfat_variants/needle/k_bodyfat_5.svg",
    "40+": "/bodyfat_variants/needle/k_bodyfat_6.svg",
    ">40": "/bodyfat_variants/needle/k_bodyfat_6.svg",
  },
  femaleFinalImage: "/bodyfat_variants/needle/f_final.svg",

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
    ">40": 80,
  },
};

// -------------------------------------------------------------------------
// 2. FUNNEL-SPECIFIC OVERRIDES
// -------------------------------------------------------------------------
const FUNNEL_CONFIGS: Partial<Record<FunnelKey, Partial<YouVsFutureConfig>>> = {
  // Plan Funnel
  plan: {
    // You can customize plan-specific values here
    verticalLineTop: 234,
  },

  // Kalistenika Funnel
  kalistenika: {
    bmiImgHeight: 180, // Slightly taller images for kalistenika
    verticalLineTop: 253, // Adjust vertical line to match new height
    
    // Example: Use different images for kalistenika if they exist
    maleBodyfatMap: {
      "5-9": "/bodyfat_variants/vein/m_bodyfat_1.svg",
      "10-14": "/bodyfat_variants/vein/m_bodyfat_2.svg",
      "15-19": "/bodyfat_variants/vein/m_bodyfat_3.svg",
      "20-24": "/bodyfat_variants/vein/m_bodyfat_4.svg",
      "25-29": "/bodyfat_variants/vein/m_bodyfat_5.svg",
      "30-34": "/bodyfat_variants/vein/m_bodyfat_6.svg",
      "35-39": "/bodyfat_variants/vein/m_bodyfat_7.svg",
      ">40": "/bodyfat_variants/vein/m_bodyfat_8.svg",
    },
    maleFinalImage: "/bodyfat_variants/vein/m_final.svg",
    
    // For kalistenika, we might want different text spacing
    lineHeight: 1.3,
  },
};

// -------------------------------------------------------------------------
// 3. HELPER FUNCTION
// -------------------------------------------------------------------------
export function getYouVsFutureConfig(funnelKey: FunnelKey): YouVsFutureConfig {
  const funnelConfig = FUNNEL_CONFIGS[funnelKey] || {};
  return {
    ...DEFAULT_CONFIG,
    ...funnelConfig,
  };
}
