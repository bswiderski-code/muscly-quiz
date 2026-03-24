"use client";
import React from "react";
import { useTranslations } from "next-intl";

type BMIBOXProps = {
  bmi?: number;
  pointerLeft?: number; // in percent (0-100)
};

export default function BMIBOX({ bmi, pointerLeft = 50 }: BMIBOXProps) {
  const t = useTranslations('BMIBOX'); // Inicjalizacja tłumaczeń

  if (typeof bmi !== 'number' || !Number.isFinite(bmi)) {
    return null;
  }

  // Responsive slider: use ref to get width
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const pointerWidth = 20;

  React.useEffect(() => {
    function updateWidth() {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // BMI scale min/max for proportional slider
  const BMI_MIN = 12;
  const BMI_MAX = 45;
  // Clamp BMI to slider range
  const clampedBMI = Math.max(BMI_MIN, Math.min(BMI_MAX, Number(bmi)));
  // Calculate pointer position based on BMI value
  const pointerLeftPx = sliderWidth
    ? ((clampedBMI - BMI_MIN) / (BMI_MAX - BMI_MIN)) * sliderWidth - pointerWidth / 2
    : 0;

  // Logika kategorii BMI i opisu - używamy kluczy JSON
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
        maxWidth: "clamp(0px, 100vw, 340px)",
        margin: "0 auto 24px auto",
        background: "#f4f4f4",
        borderRadius: 16,
        border: "4px solid #444",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: -2 }}>
        {t('yourScore')}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
        {bmi} <span style={{ fontSize: 26, fontWeight: 700 }}>BMI</span>
      </div>

      {/* BMI Bar SVG with pointer */}
      <div
        style={{
          width: "100%",
          margin: "6px 0 0px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          height: 18,
        }}
      >
        <div
          ref={sliderRef}
          style={{
            width: "100%",
            position: "relative",
            minWidth: 0,
            height: 14,
            display: "flex",
            borderRadius: 8,
            overflow: "hidden",
            border: "3px solid #363636ff",
            background: "linear-gradient(to right, #4782d0ff, #4ebae4ff, #7ae05bff, #4be04b, #f6d347ff, #f7a633ff, #ff6961, #b22222)", // Adjusted blue to #87ceeb
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Pointer */}
          <div
            style={{
              position: "absolute",
              top: -3,
              left: pointerLeftPx,
              width: 12,
              height: 18,
              background: "#fff",
              border: "2px solid #444",
              borderRadius: "50%",
              boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
              zIndex: 2,
              transition: "left 0.3s ease",
              pointerEvents: "none",
            }}
          />
          {/* Labels absolutely positioned at ends */}
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 16,
              fontSize: 10,
              fontWeight: 500,
              color: "#444",
              transform: "translateY(0)",
              whiteSpace: "nowrap",
            }}
          >
            {t('underweight')}
          </span>
          <span
            style={{
              position: "absolute",
              right: 0,
              top: 16,
              fontSize: 10,
              fontWeight: 500,
              color: "#444",
              transform: "translateY(0)",
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            {t('overweight')}
          </span>
        </div>
      </div>

      {/* BMI interpretation heading and value, always black */}
      <div style={{ fontWeight: 900, fontSize: 18, margin: "6px 0 1px 0", color: "#111", letterSpacing: 0.2 }}>
        {bmiCategory}
      </div>

      <div style={{ fontSize: 13, color: "#222", fontWeight: 400, lineHeight: 1.3 }}>
        {bmiDescription}
      </div>
    </div>
  );
}
