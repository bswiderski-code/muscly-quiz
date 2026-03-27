'use client'

import { useFunnelStore } from "@/lib/quiz/store";
import { useTranslations } from "next-intl";
import React, { useMemo } from 'react';
import type { FunnelKey } from '@/lib/quiz/funnels'

const PlanSummary = ({ sid, funnelKey }: { sid: string; funnelKey: FunnelKey }) => {
  const t = useTranslations('Summary');

  const answers = useFunnelStore((s) => s.getFor(sid, funnelKey)) || {};
  const { diet_goal, frequency, location, priority, equipment } = answers;
  
  const isHomePlan = Boolean(location && location !== 'gym');

  // Mapowanie celów z JSON
  const dietGoalMap = t.raw('goals') as unknown as Record<string, string>;
  const locationMap = t.raw('location') as unknown as Record<string, string>;
  const priorityLabels = t.raw('priorities') as Record<string, string>;
  const equipmentMap = t.raw('equipment.map') as Record<string, string>;
  const fitnessText = t('fitnessFocusText'); // Pobieramy czysty tekst sprawności

  // Format diet goal (sam string)
  const formattedDietGoal = diet_goal ? dietGoalMap[diet_goal] || diet_goal : undefined;

  const goalFocusMessage = formattedDietGoal ? t.rich('goalFocus', {
    goal: formattedDietGoal,
    strong: (chunks) => <strong>{chunks}</strong>
  }) : null;

  const fitnessFocusMessage = t.rich('fitnessFocus', {
    fitness: fitnessText,
    strong: (chunks) => <strong>{chunks}</strong>
  });

  // Tłumaczenie Częstotliwości
  const frequencyMessage = useMemo(() => {
    if (!frequency) return null;
    const n = parseInt(frequency, 10);
    if (isNaN(n) || n < 1 || n > 5) return null;

    const daysLabel =
      n === 1
        ? t('frequency.daySingular')
        : n >= 2 && n <= 4
        ? t('frequency.dayPluralFew') // Correct plural form for 2-4
        : t('frequency.dayPluralMany'); // Correct plural form for 5+

    return t.rich('frequency.intro', {
      n: String(n),
      days: daysLabel,
      strong: (chunks) => <strong>{chunks}</strong>,
    });
  }, [frequency, t]);

  const locationMessage = useMemo(() => {
    if (!isHomePlan || !location) return null;
    const message = locationMap?.[location];
    return typeof message === 'string' && message.trim().length > 0 ? message : null;
  }, [isHomePlan, location, locationMap]);

  const priorityMessage = useMemo(() => {
    const priorities = priority?.split(',').filter(Boolean) || [];
    const mappedPriorities = priorities.map((p) => {
      if (priorityLabels && typeof priorityLabels === 'object') {
        return priorityLabels[p] || priorityLabels.default || p;
      }
      return p;
    });

    if (mappedPriorities.length === 0) {
      return t.rich('priority.none', {
        strong: (chunks) => <strong>{chunks}</strong>,
      });
    }

    if (mappedPriorities.length === 1) {
      return t.rich('priority.one', {
        p1: mappedPriorities[0],
        strong: (chunks) => <strong>{chunks}</strong>,
      });
    }

    if (mappedPriorities.length === 2) {
      return t.rich('priority.two', {
        p1: mappedPriorities[0],
        p2: mappedPriorities[1],
        strong: (chunks) => <strong>{chunks}</strong>,
      });
    }

    // 3 lub więcej: X, Y i Z
    const conjunction = t('conjunction_and').trim();
    const last = mappedPriorities[mappedPriorities.length - 1];
    const rest = mappedPriorities.slice(0, -1).join(', ');
    const formatted = `${rest} ${conjunction} ${last}`;
    return t.rich('priority.many', {
      list: formatted,
      strong: (chunks) => <strong>{chunks}</strong>,
    });
  }, [priority, t, priorityLabels]);

  const equipmentMessage = useMemo(() => {
    if (!isHomePlan) return null; // tylko gdy plan dotyczy domu
    const selections = equipment?.split('|').filter(Boolean) ?? [];
    if (selections.length === 0) return null;

    const conjunction = t('conjunction_and').trim();
    const formatList = (items: string[]) => {
      if (items.length === 0) return '';
      if (items.length === 1) return items[0];
      const head = items.slice(0, -1).join(', ');
      return `${head} ${conjunction} ${items[items.length - 1]}`;
    };

    if (selections.length === 1 && selections[0] === 'none') {
      return t.rich('equipment.introNone', {
        strong: (chunks) => <strong>{chunks}</strong>,
      });
    }

    const translated = selections
      .filter((value) => value !== 'none')
      .map((value) => equipmentMap[value] || value);

    if (translated.length === 0) return null;

    return t.rich('equipment.intro', {
      list: formatList(translated),
      strong: (chunks) => <strong>{chunks}</strong>,
    });
  }, [equipmentMap, isHomePlan, equipment, t]);


  const cardStyle: React.CSSProperties = {
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: '13px 14px',
    background: 'var(--ds-card-bg)',
    boxSizing: 'border-box',
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--ds-text)',
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', fontFamily: "inherit" }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        
        {priorityMessage && (
          <div style={cardStyle}>{priorityMessage}</div>
        )}

        {equipmentMessage && (
          <div style={cardStyle}>{equipmentMessage}</div>
        )}

        {locationMessage && (
          <div style={cardStyle}>
            <span dangerouslySetInnerHTML={{ __html: locationMessage }} />
          </div>
        )}
        
        {formattedDietGoal && (
          <div style={cardStyle}>{goalFocusMessage}</div>
        )}
        
        {frequencyMessage && (
          <div style={cardStyle}>{frequencyMessage}</div>
        )}
        
        <div style={cardStyle}>{fitnessFocusMessage}</div>
      </div>
    </div>
  );
};

export default PlanSummary;