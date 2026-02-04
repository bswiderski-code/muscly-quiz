"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import { useState, useEffect, useRef } from 'react';
import '../funnel.css';
import NextButton from '@/app/components/funnels/NextButton';
import { useFunnelStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';

const stepId: StepId = 'height';

const IMAGES = {
  male: '/vectors/t_height.svg',
  female: '/vectors/f_height.svg',
};

export default function Page() {
  const { value: gender } = useStepController('gender' as StepId);
  const funnelKey = useCurrentFunnel();
  const t = useTranslations('Height');
  const locale = useLocale();
  const { idx, total, goPrev, goNext } = useStepController(stepId);

  const bySid = useFunnelStore((s) => s.bySid);
  const setField = useFunnelStore((s) => s.setField);
  const sid = Object.keys(bySid ?? {})[0];
  const initialHeight = sid && bySid?.[sid]?.height != null ? String(bySid[sid].height) : "";

  const [height, setHeight] = useState<string>(initialHeight);
  const [unit, setUnit] = useState<'cm' | 'ft'>(() => {
    if (typeof window === 'undefined') return 'cm';
    return (locale === 'en' || locale.startsWith('en-')) ? 'ft' : 'cm';
  });
  const skipSyncRef = useRef(0);

  useEffect(() => {
    if (!sid) return;
    if (skipSyncRef.current > 0) {
      skipSyncRef.current -= 1;
      return;
    }

    const entry = bySid?.[sid];
    if (!entry) return;

    if (unit === 'ft') {
      if (entry.height_raw !== undefined && entry.height_raw !== null) {
        setHeight(String(entry.height_raw));
        return;
      }
      if (entry.height !== undefined && entry.height !== null) {
        setHeight((Number(entry.height) / 30.48).toFixed(2));
        return;
      }
    } else {
      if (entry.height !== undefined && entry.height !== null) {
        setHeight(String(entry.height));
        return;
      }
    }
  }, [sid, unit, bySid]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toNumber = (s: string) => {
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  const isValidHeight = (s: string) => {
    const n = toNumber(s);
    if (unit === 'cm') {
      return Number.isFinite(n) && n >= 100 && n <= 250;
    } else {
      return Number.isFinite(n) && n >= 3 && n <= 8.5;
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value;
    let sanitized = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    sanitized = sanitized.replace(/(\..*)\./, '$1'); 
    
    const regex = unit === 'cm' ? /^\d{0,3}(\.\d?)?$/ : /^\d{0,2}(\.\d{0,2})?$/;
    if (regex.test(sanitized)) {
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
    }

    if (submitError) setSubmitError(null);
  };

  const toggleUnit = () => {
    const current = toNumber(height);
    if (unit === 'cm') {
      const entry = sid ? bySid?.[sid] : undefined;
      if (entry?.height_raw !== undefined && entry.height_raw !== null) {
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
      } else if (sid && bySid?.[sid]?.height !== undefined && bySid[sid]?.height !== null) {
        setHeight(String(bySid[sid].height));
      }
      setUnit('cm');
    }
  };

  const guardClickCapture = (e: React.MouseEvent) => {
    if (!isValidHeight(height)) {
      e.preventDefault();
      e.stopPropagation();
      setSubmitError(t('errorMsg'));
    }
  };

  const guardKeyDownCapture = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isValidHeight(height)) {
      e.preventDefault();
      e.stopPropagation();
      setSubmitError(t('errorMsg'));
    }
  };

  const handleNext = () => {
    if (!isValidHeight(height)) {
      setSubmitError(t('errorMsg'));
      return;
    }
    setSubmitError(null);

    const numeric = toNumber(height);
    const valueInCm = unit === 'ft'
      ? Number((numeric * 30.48).toFixed(1))
      : Math.round(numeric);

    if (sid) {
      setField(sid, "height", valueInCm);
      if (unit === 'ft') {
        setField(sid, "height_raw", numeric);
      }
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
      <div className="funnel-content funnel-content--centered funnel-content--height">

        {submitError && (
          <p className="funnel-error" aria-live="polite">
            {submitError}
          </p>
        )}

        <h1 className="funnel-title">
          <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
        </h1>

        {locale === 'en' && (
          <div className="funnel-unit-switch-container">
            <div className="funnel-unit-switch" onClick={toggleUnit}>
              <div className="funnel-switch-slider" style={{ transform: unit === 'cm' ? 'translateX(100%)' : 'translateX(0)' }} />
              <div className={`funnel-unit-option ${unit === 'ft' ? 'active' : ''}`}>ft</div>
              <div className={`funnel-unit-option ${unit === 'cm' ? 'active' : ''}`}>cm</div>
            </div>
          </div>
        )}

        <div className="funnel-input-group">
          <img
            src={gender === 'F' ? IMAGES.female : IMAGES.male}
            alt={t('alt')}
            style={{ width: '140px', height: '359px', marginRight: '20px' }}
          />
          <div className="funnel-input-shell funnel-input-shell--narrow">
            <input
              inputMode="decimal"
              type="text"
              pattern={unit === 'cm' ? "\\d{2,3}(\\.\\d)?" : "\\d{1,2}(\\.\\d{1,2})?"}
              maxLength={5}
              value={height}
              onChange={handleChange}
              placeholder={unit === 'cm' ? t('placeholder') : '5.9'}
              aria-label={t('ariaLabel')}
            />
            <span className="funnel-unit">{unit}</span>
          </div>
        </div>

        <div
          className="funnel-submit-wrap"
          onClickCapture={guardClickCapture}
          onKeyDownCapture={guardKeyDownCapture}
        >
          <NextButton
            currentIdx={idx}
            stepId={stepId}
            fieldKey="height"
            fieldValue={Number.isFinite(valueToSave) ? valueToSave : undefined}
            onClick={handleNext} 
          />
        </div>
      </div>
    </main>
  );
}
