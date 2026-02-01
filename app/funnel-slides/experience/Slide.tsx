"use client";

import { useState, useEffect, useMemo } from "react";
import ProgressHeader from '@/app/components/header/ProgressHeader';
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/useStepController';
import { useFunnelStore } from '@/lib/store';
import type { StepId } from '@/lib/steps/stepIds';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import "../funnel.css";

const ASSETS = {
  imageByValue: {
    none: '/vectors/exercises/hammer_dumbell.svg',
    just_started: '/vectors/exercises/seated_ohp.svg',
    some_experience: '/vectors/exercises/cable_upper.svg',
    advanced: '/vectors/exercises/chest_fly.svg',
  },
};

type ExperienceStepValue = 'none' | 'just_started' | 'some_experience' | 'advanced';

const SID = "default";
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
  const { idx, total, goPrev, select, value } = useStepController(stepId);
  const { value: gender } = useStepController('gender' as StepId);

  const options: SelectOption[] = useMemo(() => {
    const rawOptions = t.raw('options') as unknown as Record<string, OptionData>;

    return Object.keys(rawOptions).map((key) => {
      const data = rawOptions[key];
      const englishKey = {
        'zadne': 'none',
        'dopiero_zaczalem': 'just_started',
        'juz_troche': 'some_experience',
        'zaawansowany': 'advanced',
      }[key] || key;
      const valueKey = englishKey as ExperienceStepValue;

      let label = data.label;
      if (locale === 'pl' && gender === 'F') {
        if (englishKey === 'none') {
          label = 'Jeszcze nie zaczęłam trenować. 🐣';
        } else if (englishKey === 'just_started') {
          label = 'Dopiero zaczęłam. 🏁';
        }
      }

      const DetailsComponent = (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
          <div>
            <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: data.description1 }} />

            {englishKey === 'none' ? (
                <>
                    <div style={{ height: 24 }} aria-hidden="true" />
                    <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: data.description2 }} />
                </>
            ) : (
                <>
                    <div style={{ height: 8 }} aria-hidden="true" />
                    <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: data.description2 }} />
                </>
            )}
            
          </div>
          <Image
            src={ASSETS.imageByValue[valueKey]}
            alt={data.alt}
            width={englishKey === 'none' ? 110 : englishKey === 'just_started' ? 76 : englishKey === 'some_experience' ? 89 : 75}
            height={englishKey === 'none' ? 158 : englishKey === 'just_started' ? 138 : englishKey === 'some_experience' ? 140 : 107}
            style={{ 
                display: "block",
                marginBottom: englishKey === 'none' ? -18 : 0, 
                alignSelf: englishKey === 'none' ? 'end' : 'center'
            }}
          />
        </div>
      );

      return {
        value: englishKey,
        label: <>{label}</>,
        details: DetailsComponent,
      };
    });
  }, [t, gender, locale]);


  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = useFunnelStore((s) => s.bySid[SID]?.experience) as string | undefined;
  const setField = useFunnelStore((s) => s.setField);
  const setSaved = (v?: string) => {
    setField(SID, "experience", v ?? "");
    select(v ?? "", { advance: false });
  };

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>

      <div className="funnel-content funnel-content--centered">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        <SelectMenu
          name="experience"
          options={options}
          value={mounted && typeof saved === "string" ? saved : undefined}
          onChange={(v) => {
            setSaved(v);
            select(v, { advance: false });
          }}
        />

        <div className="funnel-submit-wrap">
          <NextButton 
            currentIdx={idx} 
            fieldKey="experience"
            fieldValue={value}
            disabled={!value} 
            onClick={() => {
              if (!value) {
                const alertMessage = t('errorMsg'); 
                alert(alertMessage); 
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
