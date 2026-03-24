"use client";

import { useStepController } from "@/lib/quiz/useStepController";
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import "../funnel.css";
import { useLocale, useTranslations } from "next-intl";

const stepId: StepId = "gender";

const btnStyle = (active: boolean): React.CSSProperties => ({
  background: active ? '#D9F166' : '#27272A',
  border: active ? '1px solid #D9F166' : '1px solid #3F3F46',
  borderRadius: 14,
  padding: '14px 18px',
  fontSize: 16,
  fontWeight: 500,
  color: active ? '#18181B' : '#FAFAFA',
  width: '100%',
  cursor: 'pointer',
  textAlign: 'left',
});

export default function Page() {
  const { idx, value, select, goPrev, isPending } = useStepController(stepId);
  const t = useTranslations('Gender');

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>
      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title" dangerouslySetInnerHTML={{ __html: t.raw("title") }} />
        <p className="funnel-subtitle">{t("subtitle")}</p>

        <div className="funnel-choices" role="group" aria-label={t("ariaLabel")}>
          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={() => select("M")}
              aria-pressed={value === "M"}
              disabled={isPending && value === "M"}
              aria-label={t("male.label")}
              style={btnStyle(value === "M")}
            >
              {t("male.label")}
            </button>
          </div>

          <div className="funnel-choice-item">
            <button
              type="button"
              className="funnel-choice-btn"
              onClick={() => select("F")}
              aria-pressed={value === "F"}
              disabled={isPending && value === "F"}
              aria-label={t("female.label")}
              style={btnStyle(value === "F")}
            >
              {t("female.label")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
