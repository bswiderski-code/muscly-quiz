'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './StepRangeSlider.module.css';

type StepRangeSliderProps = {
  steps: string[];
  initialIndex?: number;
  rememberedIndex?: number;
  onChange?: (index: number, label: string) => void;
  className?: string;
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const RAIL_SIDE_INSET = 14;
const THUMB_HALF = 11;
const VIEW_MARGIN = 8;
const CARET_INSET = 10;

function thumbLeftInRail(pct0to100: number): string {
  const t = pct0to100 / 100;
  return `calc(${THUMB_HALF}px + (100% - ${THUMB_HALF * 2}px) * ${t})`;
}

/** Intersect with visual viewport and overflow:hidden/clip ancestors (e.g. funnel-page, MobileContainer). */
function getHorizontalClipBounds(startEl: HTMLElement): {
  left: number;
  right: number;
} {
  const vv = window.visualViewport;
  let left = vv?.offsetLeft ?? 0;
  let right = left + (vv?.width ?? window.innerWidth);

  let p: HTMLElement | null = startEl.parentElement;
  while (p) {
    const s = window.getComputedStyle(p);
    const ox = s.overflowX;
    const oo = s.overflow;
    const clips =
      ox === 'hidden' ||
      ox === 'clip' ||
      oo === 'hidden' ||
      oo === 'clip';
    if (clips) {
      const r = p.getBoundingClientRect();
      left = Math.max(left, r.left);
      right = Math.min(right, r.right);
    }
    if (p === document.documentElement) break;
    p = p.parentElement;
  }
  return { left, right };
}

export default function StepRangeSlider({
  steps,
  initialIndex = 0,
  rememberedIndex,
  onChange,
  className,
}: StepRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sliderStackRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLSpanElement | null>(null);
  const isControlled = rememberedIndex != null;

  /** px from sliderStack left; anchor = thumb center line */
  const [tooltipLeftPx, setTooltipLeftPx] = useState(0);
  /** viewport px: final left edge = thumbCenterV + tooltipTranslateX */
  const [tooltipTranslateX, setTooltipTranslateX] = useState(0);
  const [caretOffsetPx, setCaretOffsetPx] = useState<number | null>(null);

  const [uIndex, setUIndex] = useState(() =>
    clamp(initialIndex, 0, Math.max(steps.length - 1, 0))
  );

  const index = isControlled
    ? clamp(rememberedIndex as number, 0, Math.max(steps.length - 1, 0))
    : uIndex;

  const [isDragging, setIsDragging] = useState(false);

  const pct = useMemo(
    () => (steps.length <= 1 ? 0 : (index / (steps.length - 1)) * 100),
    [index, steps.length]
  );

  const selectedLabel = steps[index] ?? '';

  const clampTooltipToViewport = useCallback(() => {
    const stack = sliderStackRef.current;
    const bubble = bubbleRef.current;
    if (!stack || !bubble || typeof window === 'undefined') return;

    const w = bubble.getBoundingClientRect().width;
    if (w < 4) return;

    const stackR = stack.getBoundingClientRect();
    const t = steps.length <= 1 ? 0 : index / (steps.length - 1);
    const shrink = RAIL_SIDE_INSET * 2 + THUMB_HALF * 2;
    const edge = RAIL_SIDE_INSET + THUMB_HALF;
    const thumbCenterLocal = edge + (stackR.width - shrink) * t;
    const thumbCenterV = stackR.left + thumbCenterLocal;

    const { left: clipL, right: clipR } = getHorizontalClipBounds(stack);
    const minLeft = clipL + VIEW_MARGIN;
    const maxLeft = clipR - w - VIEW_MARGIN;

    const idealLeft = thumbCenterV - w / 2;
    const clipW = clipR - clipL;
    const clampedLeft =
      maxLeft >= minLeft
        ? clamp(idealLeft, minLeft, maxLeft)
        : clipL + Math.max(0, (clipW - w) / 2);

    setTooltipLeftPx(thumbCenterLocal);
    setTooltipTranslateX(clampedLeft - thumbCenterV);

    const rawCaret = thumbCenterV - clampedLeft;
    if (w >= CARET_INSET * 2) {
      setCaretOffsetPx(clamp(rawCaret, CARET_INSET, w - CARET_INSET));
    } else {
      setCaretOffsetPx(w / 2);
    }
  }, [index, steps.length]);

  useLayoutEffect(() => {
    clampTooltipToViewport();
    const id = requestAnimationFrame(() => clampTooltipToViewport());
    return () => cancelAnimationFrame(id);
  }, [clampTooltipToViewport, selectedLabel]);

  useLayoutEffect(() => {
    const stack = sliderStackRef.current;
    const bubble = bubbleRef.current;
    if (!stack) return;
    const ro = new ResizeObserver(() => clampTooltipToViewport());
    ro.observe(stack);
    if (bubble) ro.observe(bubble);
    const vv = window.visualViewport;
    const schedule = () => clampTooltipToViewport();
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      ro.disconnect();
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [clampTooltipToViewport]);

  const positionToIndex = useCallback(
    (pos01: number) =>
      clamp(Math.round(pos01 * (steps.length - 1)), 0, steps.length - 1),
    [steps.length]
  );

  const pointerToIndex = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return 0;
      const rail = el.querySelector<HTMLElement>('[data-step-rail]');
      if (!rail) return 0;
      const rect = rail.getBoundingClientRect();
      const inner = rect.width - THUMB_HALF * 2;
      if (inner <= 0) return 0;
      const pos01 = clamp(
        (clientX - rect.left - THUMB_HALF) / inner,
        0,
        1
      );
      return positionToIndex(pos01);
    },
    [positionToIndex]
  );

  const emitChange = useCallback(
    (i: number) => {
      if (!onChange) return;
      const lbl = steps[i] ?? '';
      onChange(i, lbl);
    },
    [onChange, steps]
  );

  const setIndexFromUI = useCallback(
    (i: number) => {
      i = clamp(i, 0, Math.max(steps.length - 1, 0));
      if (i === index) return;
      if (isControlled) {
        emitChange(i);
      } else {
        setUIndex(i);
        emitChange(i);
      }
    },
    [emitChange, index, isControlled, steps.length]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        e.preventDefault();
      }
      setIndexFromUI(pointerToIndex(e.clientX));
    };
    const end = () => setIsDragging(false);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
    return () => {
      window.removeEventListener('pointermove', onMove, { passive: false });
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [isDragging, setIndexFromUI, pointerToIndex]);

  const stepBy = useCallback(
    (delta: number) => {
      const next = clamp(index + delta, 0, steps.length - 1);
      setIndexFromUI(next);
    },
    [index, steps.length, setIndexFromUI]
  );

  const trackClass = `${styles.track} ${isDragging ? styles.dragging : ''}`;
  const handle = (
    <button
      type="button"
      className={styles.handle}
      style={{ left: thumbLeftInRail(pct) }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          stepBy(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          stepBy(1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          setIndexFromUI(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          setIndexFromUI(steps.length - 1);
        }
      }}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={steps.length - 1}
      aria-valuenow={index}
      aria-valuetext={steps[index] ?? ''}
      tabIndex={0}
    />
  );

  const trackNode = (
    <div
      ref={trackRef}
      className={trackClass}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        setIndexFromUI(pointerToIndex(e.clientX));
      }}
    >
      <div className={styles.rail} data-step-rail>
        <div className={styles.trackBg}>
          <div
            className={styles.fill}
            style={{
              width: `calc(${THUMB_HALF}px + (100% - ${THUMB_HALF * 2}px) * ${pct / 100})`,
            }}
          />
        </div>
        <div className={styles.dots} aria-hidden>
          {steps.map((_, i) => {
            const stepPct =
              steps.length <= 1 ? 0 : (i / (steps.length - 1)) * 100;
            const passed = i <= index;
            return (
              <span
                key={i}
                className={`${styles.dot} ${passed ? styles.dotPassed : styles.dotRest}`}
                style={{ left: thumbLeftInRail(stepPct) }}
              />
            );
          })}
        </div>
        {handle}
      </div>
    </div>
  );

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <div ref={sliderStackRef} className={styles.sliderStack}>
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltipLeftPx}px`,
            transform: `translateX(${tooltipTranslateX}px)`,
          }}
        >
          <span ref={bubbleRef} className={styles.tooltipBubble}>
            {selectedLabel}
            <span
              className={styles.caretWrap}
              style={{
                left: caretOffsetPx != null ? `${caretOffsetPx}px` : '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <span className={styles.tooltipCaret} aria-hidden="true" />
            </span>
          </span>
        </div>
        {trackNode}
      </div>

      <div className={styles.edgeLabels}>
        <span className={styles.edgeLabel}>{steps[0] ?? ''}</span>
        <span className={styles.edgeLabel}>
          {steps[steps.length - 1] ?? ''}
        </span>
      </div>
    </div>
  );
}
