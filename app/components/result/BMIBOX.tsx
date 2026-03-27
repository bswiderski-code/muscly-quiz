"use client";
import React from "react";
import { useTranslations } from "next-intl";

type BMIBOXProps = {
  bmi?: number;
  pointerLeft?: number;
};

export default function BMIBOX({ bmi, pointerLeft = 50 }: BMIBOXProps) {
  const t = useTranslations('BMIBOX');

  if (typeof bmi !== 'number' || !Number.isFinite(bmi)) return null;

  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const pointerWidth = 20;

  React.useEffect(() => {
    function updateWidth() {
      if (sliderRef.current) setSliderWidth(sliderRef.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const BMI_MIN = 12;
  const BMI_MAX = 45;
  const clampedBMI = Math.max(BMI_MIN, Math.min(BMI_MAX, Number(bmi)));
  const pointerLeftPx = sliderWidth
    ? ((clampedBMI - BMI_MIN) / (BMI_MAX - BMI_MIN)) * sliderWidth - pointerWidth / 2
    : 0;

  const bmiKey = (() => {
    if (bmi < 16) return "lt16";
    if (bmi < 17) return "lt17";
    if (bmi < 18.5) return "lt18_5";
    if (bmi < 25) return "lt25";
    if (bmi < 30) return "lt30";
    if (bmi < 35) return "lt35";
    if (bmi < 40) return "lt40";
    return "gt40";
  })();

  const bmiCategory = t(`categories.${bmiKey}`);
  const bmiDescription = t(`descriptions.${bmiKey}`);

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto 14px",
        background: "var(--ds-card-bg)",
        borderRadius: 10,
        border: "0.5px solid rgba(255,255,255,0.07)",
        padding: "14px",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(244,244,245,0.35)", marginBottom: 6 }}>
        {t('yourScore')}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--ds-primary)" }}>
        {bmi} <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(244,244,245,0.4)" }}>BMI</span>
      </div>

      {/* BMI bar */}
      <div style={{ width: "100%", margin: "4px 0 0", position: "relative", height: 20 }}>
        <div
          ref={sliderRef}
          style={{
            width: "100%",
            position: "relative",
            height: 5,
            display: "flex",
            borderRadius: 3,
            overflow: "visible",
            background: "linear-gradient(to right, #4a9de0, #4cc87a, #f0c040, #f07040, #e04040)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -3,
              left: pointerLeftPx,
              width: 11,
              height: 11,
              background: "var(--ds-text)",
              border: "2px solid var(--ds-primary)",
              borderRadius: "50%",
              zIndex: 2,
              transition: "left 0.3s ease",
              pointerEvents: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 9, color: "rgba(244,244,245,0.3)" }}>{t('underweight')}</span>
          <span style={{ fontSize: 9, color: "rgba(244,244,245,0.3)" }}>{t('overweight')}</span>
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 15, margin: "10px 0 2px", color: "var(--ds-text)", letterSpacing: 0.2 }}>
        {bmiCategory}
      </div>
      <div style={{ fontSize: 12, color: "rgba(244,244,245,0.5)", fontWeight: 400, lineHeight: 1.5 }}>
        {bmiDescription}
      </div>
    </div>
  );
}
