"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import type { StepId } from '@/lib/quiz/stepIds';
import { useFunnelStore } from '@/lib/quiz/store';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import GoBack from "@/app/components/header/GoBack";
import Image from "next/image";
import { useLocale, useTranslations } from 'next-intl';
import "../funnel.css";
import { useMemo, useEffect, useState } from "react";
import { withLocale } from '@/lib/imagePath';

const stepId: StepId = "bmi";

const ASSETS = {
  nextStepImg: '/btns/{locale}/lets-go-btn.svg',
  illustrationImg: '/vectors/t_meat.svg',
};

export default function Page() {
  useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('BMI');
  const { sid, goPrev, goNext } = useStepController(stepId);

  const snapshot = useMemo(() => useFunnelStore.getState().bySid[sid] || {}, [sid]);
  const { weight, height } = snapshot;

  const setField = useFunnelStore((state) => state.setField);

  const [animatedBmi, setAnimatedBmi] = useState("X");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!weight || !height) return;
    const targetBmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let step = 0;
    const steps = 15;
    const interval = 800 / steps;
    const easing = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(1 - t, 0.8);

    const animate = () => {
      step++;
      const progress = easing(step / steps);
      setAnimatedBmi((progress * parseFloat(targetBmi)).toFixed(1));
      setIsAnimating(true);
      if (step < steps) {
        setTimeout(animate, interval);
      } else {
        setIsAnimating(false);
        if (sid) setField(sid, "bmi", parseFloat(targetBmi));
      }
    };
    animate();
  }, [weight, height, sid, setField]);

  const bmiCategoryKey = (() => {
    if (animatedBmi === "X") return "unknown";
    const v = parseFloat(animatedBmi);
    if (v < 16.0) return "starvation";
    if (v < 17.0) return "emaciation";
    if (v < 18.5) return "underweight";
    if (v < 25.0) return "normal";
    if (v < 30.0) return "overweight";
    if (v < 35.0) return "obesityI";
    if (v < 40.0) return "obesityII";
    return "obesityIII";
  })();

  return (
    <div className="funnel-page">
      <div className="funnel-header-wrapper">
        <GoBack onClick={goPrev} />
      </div>

      <main className="funnel-content funnel-content--centered">
        <h2 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h2>
        <div className={`funnel-result-cross ${isAnimating ? "animated" : ""}`}>{animatedBmi}</div>
        <div className="funnel-result-quote">{t(`category.${bmiCategoryKey}`)}</div>

        <div className="funnel-result-illustration">
          <Image
            src={ASSETS.illustrationImg}
            alt=""
            width={600}
            height={240}
            priority
            style={{ width: 600, height: 240, maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        <p className="funnel-result-text">{t(`description.${bmiCategoryKey}`)}</p>

        <div className="funnel-result-cta" onClick={goNext}>
          <Image
            src={withLocale(ASSETS.nextStepImg, locale)}
            alt={t('nextStepAlt')}
            width={300}
            height={80}
          />
        </div>
      </main>
    </div>
  );
}
