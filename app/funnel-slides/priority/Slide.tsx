"use client";

import { useEffect, useMemo, useRef } from "react";
import { useStepController } from "@/lib/quiz/useStepController";
import type { StepId } from '@/lib/quiz/stepIds';
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import { useTranslations } from 'next-intl';
import { FEMALE_PRIORITY_IMAGES_BY_PART, MALE_PRIORITY_IMAGES_BY_PART } from '@/lib/quiz/stepImages';
import "../funnel.css";

const stepId: StepId = "priority";

const PRIORITIES = {
  male: ['shoulders', 'chest', 'triceps', 'biceps', 'back', 'legs', 'abs', 'forearms'],
  female: ['legs', 'glutes', 'abs', 'chest', 'triceps', 'biceps', 'back', 'shoulders'],
} as const;

function parseStored(v?: string): string[] {
  return v ? String(v).split(",").filter(Boolean) : [];
}

export default function Page() {
  const { value: gender } = useStepController('gender' as StepId);
  const t = useTranslations('Priority');
  const { idx, value, select, goPrev, canAdvanceFromAnswers } = useStepController(stepId);

  const priorities = gender === 'F' ? PRIORITIES.female : PRIORITIES.male;

  const selected = useMemo(() => parseStored(value), [value]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const didInitDefault = useRef(false);
  useEffect(() => {
    if (!didInitDefault.current && (value === undefined || value === null)) {
      didInitDefault.current = true;
      select("", { advance: false });
    }
  }, [value, select]);

  function toggle(name: string) {
    const has = selectedSet.has(name);
    let next: string[];
    if (has) {
      next = selected.filter((n) => n !== name);
    } else {
      next = [...selected, name];
    }
    const nextJoined = next.join(",");
    if (nextJoined !== (value ?? "")) {
      select(nextJoined, { advance: false });
    }
  }

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title1') }} />
          <span dangerouslySetInnerHTML={{ __html: t.raw('title2') }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <div className="funnel-priority-grid">
          {priorities.map((name) => {
            const isSelected = selectedSet.has(name);
            const partLabel = t(`partNames.${name}`);
            const imgMap = gender === 'F' ? FEMALE_PRIORITY_IMAGES_BY_PART : MALE_PRIORITY_IMAGES_BY_PART;
            const imgSrc = imgMap[name];

            return (
              <button
                key={name}
                type="button"
                className={`funnel-priority-btn ${isSelected ? 'funnel-priority-btn--selected' : ''}`}
                onClick={() => toggle(name)}
              >
                {imgSrc ? (
                  <div className="funnel-priority-btn__img-wrap">
                    <img
                      className="funnel-priority-btn__img"
                      src={imgSrc}
                      alt=""
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                ) : null}
                <span className="funnel-priority-btn__label">{partLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            disabled={!canAdvanceFromAnswers}
            onClick={() => select(value ?? "", { advance: true })}
          />
        </div>
      </div>
    </main>
  );
}
