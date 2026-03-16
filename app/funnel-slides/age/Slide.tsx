"use client";

import { useStepController } from "@/lib/quiz/useStepController";
import ProgressHeader from "@/app/components/header/ProgressHeader";
import NextButton from "@/app/components/funnels/NextButton";
import type { StepId } from '@/lib/quiz/stepIds';
import { useTranslations } from 'next-intl';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import "../funnel.css";

const stepId: StepId = "age";

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('Age');
  const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);

  const getAgeKey = (ageValue: number): string | null => {
    if (ageValue >= 12 && ageValue <= 14) return "12-14";
    if (ageValue >= 15 && ageValue <= 20) return "15-20";
    if (ageValue >= 21 && ageValue <= 30) return "21-30";
    return null;
  };

  const ageNum = value && /^\d{2}$/.test(value) ? Number(value) : null;
  const ageKey = ageNum !== null ? getAgeKey(ageNum) : null;
  const ageData = ageKey ? t.raw(ageKey) as unknown as { message: string, description: string } : null;

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>
      <div className="funnel-content funnel-content--centered funnel-content--age">
        
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>
        
        <form
          className="funnel-form-centered"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="funnel-input-shell funnel-input-shell--narrow">
            <input
              inputMode="numeric"
              type="text"
              pattern="[0-9]*"
              maxLength={2}
              value={value}
              onChange={(e) => {
                const sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
                select(sanitizedValue, { advance: false });
              }}
              placeholder={t('placeholder')}
              aria-label={t('ariaLabel')}
            />
            <span className="funnel-unit">{t('unit')}</span>
          </div>

          {ageData && (
            <div className="funnel-info-box">
              <p className="funnel-info-message">{ageData.message}</p>
              <p
                className="funnel-info-description"
                dangerouslySetInnerHTML={{ __html: ageData.description }}
              />
            </div>
          )}

          <div className="funnel-submit-wrap">
            <NextButton
              currentIdx={idx}
              stepId={stepId}
              fieldKey="age"
              fieldValue={value}
              onClick={() => select(value, { advance: true })}
            />
          </div>
        </form>
      </div>
    </main>
  );
}
