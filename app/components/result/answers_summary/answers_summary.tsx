import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useFunnelStore, type FunnelAnswers } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { getFunnelSlug, getStepOrder, getStepSlug, resolveFunnelKey, type FunnelKey } from '@/lib/funnels/funnels';
import { ALL_STEPS } from '@/lib/steps/stepIds';
import { getAnswersSummaryConfig } from './config';
import { getAnswerEmoji, formatDefaultLabel, CONJUNCTIONS, VALUE_FORMATS, formatValue } from './mappings';

interface AnswersSummaryProps {
  sid: string;
  funnelSlug?: string;
  answersButtonImage?: string;
}

// Emoji function moved to mappings.ts

export default function AnswersSummary({ sid, funnelSlug, answersButtonImage }: AnswersSummaryProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('AnswersSummary');
  const locale = useLocale();

  const labels = t.raw('labels') as Partial<Record<keyof FunnelAnswers, string>>;
  const genderMap = t.raw('gender') as Record<string, string>;
  const dietGoalMap = t.raw('dietGoal') as Record<string, string>;
  const activityMap = t.raw('activityMap') as Record<string, string>;
  const experienceMap = t.raw('experienceMap') as Record<string, string>;
  const difficultyMap = t.raw('difficultyMap') as Record<string, string>;
  const locationTypeMap = t.raw('locationTypeMap') as Record<string, string>;
  const equipmentMap = t.raw('equipmentMap') as Record<string, string>;
  const conjunctionAnd = CONJUNCTIONS.and;
  const priorityMap = t.raw('priorityMap') as Record<string, string>;
  const format = t.raw('format') as Record<string, string>;

  const buttonImageSrc = answersButtonImage 
    ? answersButtonImage.replace('{locale}', locale) 
    : t('buttonImage');
  const buttonAltText = t('buttonAlt');
  const backLinkText = t('backLinkText');

  const resolvedFunnel = useMemo<FunnelKey | null>(() => {
    if (!funnelSlug) return null;
    return resolveFunnelKey(funnelSlug, locale);
  }, [funnelSlug, locale]);

  const answers = useFunnelStore((s) => s.getFor(sid, resolvedFunnel ?? undefined) ?? {});
  const locationValue = (answers as Record<string, unknown>)?.location;
  const isHomePlan = Boolean(locationValue && locationValue !== 'gym');

  // Get configuration for this funnel
  const summaryConfig = getAnswersSummaryConfig(resolvedFunnel ?? 'workout');

  const backLinkHref = useMemo(() => {
    if (!resolvedFunnel) return null;
    const order = getStepOrder(resolvedFunnel);
    const lastStep = order[order.length - 1];
    const funnelPath = getFunnelSlug(resolvedFunnel, locale);
    const stepPath = getStepSlug(resolvedFunnel, lastStep, locale);
    return `/${funnelPath}/${stepPath}`;
  }, [locale, resolvedFunnel]);

  const getDisplayValue = (key: string, value: any) => {
    if (key === 'gender') return genderMap[value] || value;
    if (key === 'diet_goal') return dietGoalMap[value] || value;
    if (key === 'bodyfat') return formatValue(value, format.bodyfat || VALUE_FORMATS.bodyfat);
    if (key === 'height') return formatValue(value, format.height || VALUE_FORMATS.height);
    if (key === 'weight' || key === 'weight_goal') return formatValue(value, format.weight || VALUE_FORMATS.weight);
    if (key === 'age') return formatValue(value, format.age || VALUE_FORMATS.age);
    if (key === 'frequency') return formatValue(value, format.frequency || VALUE_FORMATS.frequency);
    if (key === 'fitness') return formatValue(value, format.fitness || VALUE_FORMATS.fitness);
    if (key === 'sleep') {
      let val = String(value);
      val = val.replace(/gt/g, '>').replace(/lt/g, '<');
      return formatValue(val, format.sleep || VALUE_FORMATS.sleep);
    }
    if (key === 'pushups') return formatValue(value, format.pushups || VALUE_FORMATS.pushups);
    if (key === 'pullups') {
      if (String(value) === '0' || value === 0) {
        return format.pullups_none || formatValue(value, VALUE_FORMATS.pullups);
      }
      return formatValue(value, format.pullups || VALUE_FORMATS.pullups);
    }
    if (key === 'duration') return t('format.duration', { count: Number(value) });
    if (key === 'activity') return activityMap[value] || value;
    if (key === 'experience' || key === 'calistenic_experience') return experienceMap[value] || value;
    if (key === 'difficulty') return difficultyMap[value] || value;
    if (key === 'location') {
      const normalized = value === 'gym' ? 'gym' : 'house';
      return locationTypeMap[normalized] || normalized;
    }
    if (key === 'equipment') {
      if (!isHomePlan) return '';
      const raw = typeof value === 'string' ? value : '';
      const selections = raw.split('|').map((s) => s.trim()).filter(Boolean);
      if (selections.length === 0) return t('equipmentNotSelected');
      const mapped = selections.map((s) => equipmentMap[s] || s);
      if (mapped.length === 1) return mapped[0];
      if (mapped.length === 2) return `${mapped[0]} ${conjunctionAnd} ${mapped[1]}`;
      return `${mapped.slice(0, -1).join(', ')} ${conjunctionAnd} ${mapped[mapped.length - 1]}`;
    }
    if (key === 'priority') {
      if (!value) return '';
      const priorities = String(value).split(',').filter(Boolean);
      const mapped = priorities.map((p) => priorityMap[p] || p);
      if (mapped.length === 2) {
        return mapped.join(` ${conjunctionAnd} `);
      } else if (mapped.length > 2) {
        return mapped.slice(0, -1).join(', ') + ` ${conjunctionAnd} ` + mapped[mapped.length - 1];
      }
      return mapped.join(', ');
    }
    return value;
  };

  const hiddenKeys = summaryConfig.hiddenKeys;

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '0 auto 0px auto',
        width: '100%',
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'block',
          width: '100%',
        }}
      >
        <Image
          src={buttonImageSrc}
          alt={buttonAltText}
          width={312}
          height={37}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? 'none' : 0,
          opacity: open ? 1 : 0,
          overflow: open ? 'visible' : 'hidden',
          transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
          background: '#fff',
          border: open ? '3px solid #000' : '3px solid transparent',
          borderRadius: 14,
          marginTop: 8,
          boxShadow: open ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          padding: open ? '18px 18px 12px 18px' : '0 18px',
          fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif",
        }}
      >
        {open && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: 17,
              lineHeight: 1.25,
              width: '100%',
            }}
          >
            {ALL_STEPS
              .filter(stepId => {
                const value = answers[stepId];
                const isVisible = !hiddenKeys.has(stepId) && !(value === undefined || value === '');
                const conditionalCheck = summaryConfig.conditionalRules?.equipmentOnlyForHome
                  ? (stepId !== 'equipment' || isHomePlan)
                  : true;
                return isVisible && conditionalCheck;
              })
              .map(stepId => [stepId, answers[stepId]] as const)
              .map(([key, value]) => {
              const emoji = getAnswerEmoji(key, value);
              const label =
                labels[key as keyof typeof labels] ||
                formatDefaultLabel(key);
              return (
                <li
                  key={key}
                  style={{
                    marginBottom: 4,
                    display: 'block',
                    fontSize: '1rem',
                    width: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  <span style={{ marginRight: 8, fontSize: 22, verticalAlign: 'middle' }}>{emoji}</span>
                  <span style={{ fontWeight: 700, verticalAlign: 'middle' }}>{label}:</span>
                  <span style={{ marginLeft: 4, verticalAlign: 'middle', display: 'inline' }}>{getDisplayValue(key, value)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {open && backLinkHref && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <a
            href={backLinkHref}
            style={{
              fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif",
              fontSize: 15,
              color: '#000',
              textDecoration: 'underline',
              fontWeight: 400,
              display: 'inline-block',
              marginTop: 4,
            }}
          >
            {backLinkText}
          </a>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 600px) {
          div[style*='maxWidth: 400'] {
            max-width: 98vw !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          ul {
            font-size: 15px !important;
          }
          li {
            font-size: 0.97rem !important;
            margin-bottom: 5px !important;
          }
        }
      `}</style>
    </div>
  );
}
