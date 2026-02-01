'use client'

import * as React from 'react'
import { useRouter } from '@/i18n/routing';
import { getFunnelSlug, getStepOrder, getStepSlug, type FunnelKey } from '@/lib/funnels/funnels'
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useLocale } from 'next-intl'
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import IGNORED_STEPS from '@/lib/steps/ignoredSteps';

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

  const router = useRouter();
  const funnelSlug = React.useMemo(() => getFunnelSlug(funnel, locale), [funnel, locale])

  const handleBack = () => {
    if (currentIdx === 0) {
      router.push({ pathname: '/[funnel]', params: { funnel: funnelSlug } } as any);
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
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 18,
        paddingTop: 16,
        paddingBottom: 16,
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
        }}
      >
        <img src="/btns/goback.svg" alt="Cofnij" width={32} height={32} style={{ display: 'block' }} />
      </button>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={99}
        aria-label="Postęp"
        title={`${Math.round(pct)}%`}
        style={{
          position: 'relative',
          height: 24,
          borderRadius: 9999,
          border: '3px solid #000',
          background: '#EEEEEE',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,                     // ← only value we change
            background: 'linear-gradient(to top, #B20000 60%, #810000ff 100%)',
            borderRadius: 9999,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            transition: 'width 500ms cubic-bezier(.22,.61,.36,1)', // smooth ease-out
            willChange: 'width',
          }}
        >
          {pct >= 7 && `${Math.round(pct)}%`}
        </div>
      </div>
    </div>
  );
}
