"use client";

import { useStepController } from '@/lib/quiz/useStepController';
import type { StepId } from '@/lib/quiz/stepIds';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import { useState, useEffect, useRef } from 'react';
import '../funnel.css';
import NextButton from '@/app/components/funnels/NextButton';
import { useFunnelStore } from '@/lib/quiz/store';
import { useTranslations, useLocale } from 'next-intl';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';

const stepId: StepId = 'height';

export default function Page() {
  const { value: gender } = useStepController('gender' as StepId);
  useCurrentFunnel();
  const t = useTranslations('Height');
  const locale = useLocale();
  const { idx, goPrev, goNext, sid } = useStepController(stepId);

  const setField = useFunnelStore((s) => s.setField);
  const entry = useFunnelStore((s) => (sid ? s.getFor(sid) : undefined));

  const initialHeight = entry?.height != null ? String(entry.height) : '';
  const [height, setHeight] = useState<string>(initialHeight);
  const [unit, setUnit] = useState<'cm' | 'ft'>(() => {
    if (typeof window === 'undefined') return 'cm';
    return (locale === 'en' || locale.startsWith('en-')) ? 'ft' : 'cm';
  });
  const skipSyncRef = useRef(0);

  useEffect(() => {
    if (!sid || !entry) return;
    if (skipSyncRef.current > 0) {
      skipSyncRef.current -= 1;
      return;
    }
    if (unit === 'ft') {
      if (entry.height_raw != null) {
        setHeight(String(entry.height_raw));
      } else if (entry.height != null) {
        setHeight((Number(entry.height) / 30.48).toFixed(2));
      }
    } else if (entry.height != null) {
      setHeight(String(entry.height));
    }
  }, [sid, unit, entry]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const toNumber = (s: string) => {
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  const isValidHeight = (s: string) => {
    const n = toNumber(s);
    return unit === 'cm'
      ? Number.isFinite(n) && n >= 100 && n <= 250
      : Number.isFinite(n) && n >= 3 && n <= 8.5;
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let sanitized = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    sanitized = sanitized.replace(/(\..*)\./, '$1');
    const regex = unit === 'cm' ? /^\d{0,3}(\.\d?)?$/ : /^\d{0,2}(\.\d{0,2})?$/;
    if (!regex.test(sanitized)) return;

    setHeight(sanitized);
    if (sid) {
      const numericValue = toNumber(sanitized);
      if (Number.isFinite(numericValue)) {
        if (unit === 'ft') {
          skipSyncRef.current += 2;
          setField(sid, 'height_raw', numericValue);
          setField(sid, 'height', Number((numericValue * 30.48).toFixed(1)));
        } else {
          skipSyncRef.current += 1;
          setField(sid, 'height', Math.round(numericValue));
        }
      }
    }
    if (submitError) setSubmitError(null);
  };

  const toggleUnit = () => {
    const current = toNumber(height);
    if (unit === 'cm') {
      if (entry?.height_raw != null) {
        setHeight(String(entry.height_raw));
      } else if (Number.isFinite(current)) {
        const ftValue = current / 30.48;
        setHeight(ftValue.toFixed(2));
        if (sid) {
          skipSyncRef.current += 1;
          setField(sid, 'height_raw', Number(ftValue.toFixed(2)));
        }
      }
      setUnit('ft');
    } else {
      if (Number.isFinite(current)) {
        setHeight((current * 30.48).toFixed(1));
      } else if (entry?.height != null) {
        setHeight(String(entry.height));
      }
      setUnit('cm');
    }
  };

  const handleNext = () => {
    if (!isValidHeight(height)) {
      setSubmitError(t('errorMsg'));
      return;
    }
    setSubmitError(null);
    const numeric = toNumber(height);
    const valueInCm = unit === 'ft' ? Number((numeric * 30.48).toFixed(1)) : Math.round(numeric);
    if (sid) {
      setField(sid, 'height', valueInCm);
      if (unit === 'ft') setField(sid, 'height_raw', numeric);
    }
    goNext();
  };

  const numericValue = toNumber(height);
  const valueToSave = unit === 'ft' && Number.isFinite(numericValue)
    ? Number((numericValue * 30.48).toFixed(1))
    : numericValue;

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>
      <div className="funnel-content funnel-content--height funnel-content--with-fixed-button">
        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>
        <p className="funnel-subtitle">{t('subtitle')}</p>

        {submitError && (
          <p className="funnel-error" aria-live="polite">{submitError}</p>
        )}

        {locale === 'en' && (
          <div className="funnel-unit-switch-container">
            <div className="funnel-unit-switch" onClick={toggleUnit}>
              <div className="funnel-switch-slider" style={{ transform: unit === 'cm' ? 'translateX(100%)' : 'translateX(0)' }} />
              <div className={`funnel-unit-option ${unit === 'ft' ? 'active' : ''}`}>ft</div>
              <div className={`funnel-unit-option ${unit === 'cm' ? 'active' : ''}`}>cm</div>
            </div>
          </div>
        )}

        <div className="funnel-number-input-centered">
          <input
            inputMode="decimal"
            type="text"
            pattern={unit === 'cm' ? "\\d{2,3}(\\.\\d)?" : "\\d{1,2}(\\.\\d{1,2})?"}
            maxLength={6}
            value={height}
            onChange={handleChange}
            aria-label={t('ariaLabel')}
          />
          <span className="unit">{unit}</span>
        </div>

        <div
          className="funnel-submit-wrap"
          onClickCapture={(e) => { if (!isValidHeight(height)) { e.preventDefault(); e.stopPropagation(); setSubmitError(t('errorMsg')); } }}
          onKeyDownCapture={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isValidHeight(height)) { e.preventDefault(); e.stopPropagation(); setSubmitError(t('errorMsg')); } }}
        >
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            fieldKey="height"
            fieldValue={Number.isFinite(valueToSave) ? valueToSave : undefined}
            disabled={!isValidHeight(height)}
            onClick={handleNext}
          />
        </div>
      </div>
    </main>
  );
}
