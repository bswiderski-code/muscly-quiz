"use client";

import { useStepController } from "@/lib/useStepController";
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useFunnelStore } from "@/lib/store";
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import GoBack from "@/app/components/header/GoBack";
import Image from "next/image";
import { useLocale, useTranslations } from 'next-intl';
import "../funnel.css";
import { useMemo, useEffect, useState } from "react";
import { getBmiConfig } from './config'
import { withLocale } from '@/app/funnel-slides/_config/helpers'

const stepId: StepId = "bmi";

export default function Page({ onlyGoBack = false }: { onlyGoBack?: boolean }) {
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const config = getBmiConfig(funnel);
  const t = useTranslations(config.translationNamespace);
  const { sid, goPrev, goNext } = useStepController(stepId);

  const goToPrevStep = () => goPrev();

  const snapshot = useMemo(() => useFunnelStore.getState().bySid[sid] || {}, [sid]);
  const { weight, height } = snapshot;

  const setField = useFunnelStore((state) => state.setField);

  const [animatedBmi, setAnimatedBmi] = useState("X");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (weight && height) {
      const targetBmi = (weight / ((height / 100) ** 2)).toFixed(1);
      let currentBmi = 0;
      const duration = 800; 
      const steps = 15; 
      const interval = duration / steps;
      const easing = (t: number): number =>
        t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(1 - t, 0.8);

      let step = 0;
      const animate = () => {
        step++;
        const progress = easing(step / steps);
        currentBmi = parseFloat((progress * parseFloat(targetBmi)).toFixed(1));
        setAnimatedBmi(currentBmi.toString());
        setIsAnimating(true);
        if (step < steps) {
          setTimeout(animate, interval);
        } else {
          setIsAnimating(false);
          if (sid) {
            setField(sid, "bmi", parseFloat(targetBmi));
          }
        }
      };

      animate();
    }
  }, [weight, height, sid, setField]);

  const bmiCategoryKey = (() => {
    if (animatedBmi === "X") return "unknown";
    const bmiValue = parseFloat(animatedBmi);
    if (bmiValue < 16.0) return "starvation";
    if (bmiValue < 17.0) return "emaciation";
    if (bmiValue < 18.5) return "underweight";
    if (bmiValue < 25.0) return "normal";
    if (bmiValue < 30.0) return "overweight";
    if (bmiValue < 35.0) return "obesityI";
    if (bmiValue < 40.0) return "obesityII";
    return "obesityIII";
  })();
  
  const bmiCategory = t(`category.${bmiCategoryKey}`);
  const bmiDescription = t(`description.${bmiCategoryKey}`);


  if (onlyGoBack) {
    return (
      <div className="funnel-page">
        <div className="funnel-header-wrapper">
          <GoBack onClick={goToPrevStep} />
        </div>
      </div>
    );
  }
  
  const goToNextStep = () => {
    goNext();
  }

  return (
    <div className="funnel-page">
      <div className="funnel-header-wrapper">
        <GoBack onClick={goToPrevStep} />
      </div>

      <main className="funnel-content funnel-content--centered">
        <h2 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} /> 
        </h2>
        <div className={`funnel-result-cross ${isAnimating ? "animated" : ""}`}>{animatedBmi}</div>
        <div className="funnel-result-quote">{bmiCategory}</div>

        <div className="funnel-result-illustration">
          <Image
            src={config.assets.illustrationImg}
            alt=""
            width={config.illustration.width}
            height={config.illustration.height}
            priority
            style={{
              width: config.illustration.width,
              height: config.illustration.height,
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        <p className="funnel-result-text">{bmiDescription}</p>

        <div
          className="funnel-result-cta"
          onClick={goToNextStep}
        >
          <Image
            src={withLocale(config.assets.nextStepImg, locale)}
            alt={t('nextStepAlt')}
            width={300} 
            height={80} 
          />
        </div>
      </main>
    </div>
  );
}
