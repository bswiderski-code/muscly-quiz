'use client'

import * as React from 'react'
import { getStepOrder, type FunnelKey } from '@/lib/quiz/funnels'
import type { StepId } from '@/lib/quiz/stepIds'
import { useLocale } from 'next-intl'
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import IGNORED_STEPS from '@/lib/quiz/ignoredSteps'
import { MAIN_SITE_URL } from '@/config/site'

type Props = {
  currentIdx: number
  onBack?: () => void
  className?: string
  funnel?: FunnelKey
  skipStepIds?: StepId[]
}

export default function ProgressHeader({ currentIdx, onBack, className, funnel: funnelProp, skipStepIds }: Props) {
  const locale = useLocale()
  const funnel = funnelProp ?? useCurrentFunnel()
  const order = React.useMemo(() => getStepOrder(funnel), [funnel])
  const ignored = React.useMemo(() => {
    const extra = skipStepIds ?? []
    return new Set<StepId>([...IGNORED_STEPS, ...extra])
  }, [skipStepIds])

  const visibleTotal = React.useMemo(
    () => Math.max(1, order.filter((step) => !ignored.has(step)).length),
    [order, ignored],
  )

  const visibleCurrent = React.useMemo(() => {
    const completed = order.slice(0, currentIdx + 1).filter((step) => !ignored.has(step)).length
    return Math.max(0, completed - 1)
  }, [currentIdx, order, ignored])

  const targetPct = Math.min(99, (visibleCurrent / Math.max(1, visibleTotal - 1)) * 100)

  const storageKey = '__progressHeader_prevPct';

  // 👉 Seed from previous value so first paint isn't 0%
  const [pct, setPct] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey);
        const v = saved !== null ? Number(saved) : NaN;
        if (Number.isFinite(v)) return v;
      } catch {}
    }
    return targetPct; // fallback on first step
  });

  // When target changes, transition from old 'pct' to new 'targetPct'
  React.useEffect(() => {
    setPct(targetPct);
    try { sessionStorage.setItem(storageKey, String(targetPct)); } catch {}
  }, [targetPct]);

  const handleBack = () => {
    if (currentIdx === 0) {
      window.location.href = `${MAIN_SITE_URL}/${locale}`;
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 14,
        paddingBottom: 14,
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        style={{
          appearance: 'none',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: currentIdx === 0 || onBack ? 'pointer' : 'default',
          opacity: currentIdx === 0 || onBack ? 1 : 0.4,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 16L7 10L12.5 4" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={99}
        aria-label="Progress"
        title={`${Math.round(pct)}%`}
        style={{
          flex: 1,
          height: 6,
          borderRadius: 9999,
          background: '#3F3F46',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: '#D9F166',
            borderRadius: 9999,
            transition: 'width 500ms cubic-bezier(.22,.61,.36,1)',
            willChange: 'width',
          }}
        />
      </div>
    </div>
  );
}
