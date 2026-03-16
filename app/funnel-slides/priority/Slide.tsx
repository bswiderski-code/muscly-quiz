"use client";

import { useEffect, useMemo, useRef } from "react";
import { useStepController } from "@/lib/quiz/useStepController";
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import { useTranslations, useLocale } from 'next-intl';
import NextImage from "next/image";
import { withLocale } from '@/lib/imagePath'
import "../funnel.css";

const stepId: StepId = "priority";

const PRIORITIES = {
  male: ['shoulders', 'chest', 'triceps', 'biceps', 'back', 'legs', 'abs', 'forearms'],
  female: ['legs', 'glutes', 'abs', 'chest', 'triceps', 'biceps', 'back', 'shoulders'],
} as const;

const ASSETS = {
  imageBasePath: '/regional/{locale}/priorities',
};

function parseStored(v?: string): string[] {
  return v ? String(v).split(",").filter(Boolean) : [];
}

export default function Page() {
  const { value: gender } = useStepController('gender' as StepId);
  const funnel = useCurrentFunnel();
  const locale = useLocale();
  const t = useTranslations('Priority');
  const { idx, total, value, select, goPrev } = useStepController(stepId);

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

  const imagePath = withLocale(ASSETS.imageBasePath, locale); 
  useEffect(() => {
    priorities.forEach((name) => {
      new globalThis.Image().src = `${imagePath}/unselected/${name}_priority_btn.svg`;
      new globalThis.Image().src = `${imagePath}/selected/${name}_priority_btn.svg`;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePath, priorities]);

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

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title1') }} />
          <span dangerouslySetInnerHTML={{ __html: t.raw('title2') }} />
        </h1>
        <p className="funnel-subtitle">
          <span dangerouslySetInnerHTML={{ __html: t.raw('subtitle') }} />
        </p>

        <div className="funnel-priority-grid">
          {priorities.map((name) => {
            const isSelected = selectedSet.has(name);
            const partLabel = t(`partNames.${name}`);
            const ariaLabel = t(isSelected ? 'ariaLabelSelected' : 'ariaLabelUnselected', { name: partLabel });
            const selectedSrc = `${imagePath}/selected/${name}_priority_btn.svg`;
            const unselectedSrc = `${imagePath}/unselected/${name}_priority_btn.svg`;

            const baseImageStyle: React.CSSProperties = {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "opacity 220ms ease",
            };

            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                aria-label={ariaLabel}
                aria-pressed={isSelected}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  display: "block",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "134 / 100",
                  }}
                >
                  <NextImage
                    src={unselectedSrc}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 240px"
                    style={{
                      ...baseImageStyle,
                      opacity: isSelected ? 0 : 1,
                    }}
                    priority
                  />
                  <NextImage
                    src={selectedSrc}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 240px"
                    style={{
                      ...baseImageStyle,
                      opacity: isSelected ? 1 : 0,
                    }}
                    priority
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="funnel-submit-wrap">
          <NextButton currentIdx={idx} stepId={stepId} onClick={() => select(value ?? "", { advance: true })} />
        </div>
      </div>
    </main>
  );
}
