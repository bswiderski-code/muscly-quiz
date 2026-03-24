"use client";

import { useState, useEffect, useMemo } from "react";
import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/quiz/useStepController';
import type { StepId } from '@/lib/quiz/stepIds';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import { useTranslations, useLocale } from 'next-intl';
import "../funnel.css";

type ExperienceStepValue = 'none' | 'just_started' | 'some_experience' | 'advanced';

const stepId = 'experience';

interface OptionData {
  label: string;
  description1: string;
  description2: string;
  alt: string;
}

export default function Page() {
  const funnel = useCurrentFunnel();
  const t = useTranslations('Experience');
  const locale = useLocale();
  const { idx, goPrev, select, value } = useStepController(stepId);
  const { value: gender } = useStepController('gender' as StepId);

  const options: SelectOption[] = useMemo(() => {
    const rawOptions = t.raw('options') as unknown as Record<string, OptionData>;

    return Object.keys(rawOptions).map((key) => {
      const data = rawOptions[key];
      const englishKey = ({
        'zadne': 'none',
        'dopiero_zaczalem': 'just_started',
        'juz_troche': 'some_experience',
        'zaawansowany': 'advanced',
      } as Record<string, string>)[key] || key;
      const valueKey = englishKey as ExperienceStepValue;

      let label = data.label;
      if (locale === 'pl' && gender === 'F') {
        if (englishKey === 'none') label = 'Jeszcze nie zaczęłam trenować. 🐣';
        else if (englishKey === 'just_started') label = 'Dopiero zaczęłam. 🏁';
      }

      const DetailsComponent = (
        <div style={{ display: "block", gap: 16, alignItems: "center" }}>
          <div>
            <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: data.description1 }} />
            <div style={{ height: englishKey === 'none' ? 24 : 8 }} aria-hidden="true" />
            <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: data.description2 }} />
          </div>
        </div>
      );

      return {
        value: englishKey,
        label: <>{label}</>,
        details: DetailsComponent,
      };
    });
  }, [t, gender, locale]);

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle')}</p>

        <SelectMenu
          name="experience"
          options={options}
          value={value || undefined}
          onChange={(v) => select(v, { advance: false })}
        />

        <div className="funnel-submit-wrap">
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            disabled={!value}
            onClick={() => {
              if (!value) {
                alert(t('errorMsg'));
                return;
              }
              select(value, { advance: true });
            }}
          />
        </div>
      </div>
    </main>
  );
}
