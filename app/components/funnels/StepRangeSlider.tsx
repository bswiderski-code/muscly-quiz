'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './StepRangeSlider.module.css';
import { useCurrentFunnel } from '@/lib/quiz/funnelContext';
import type { FunnelKey } from '@/lib/quiz/funnels';

type StepRangeSliderProps = {
  steps: string[];
  initialIndex?: number;          // dla trybu niekontrolowanego
  rememberedIndex?: number;       // jeśli podane -> tryb kontrolowany
  onChange?: (index: number, label: string) => void;
  className?: string;
  funnel?: FunnelKey;             // optional funnel override
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
/** MUSI odpowiadać --pad w CSS (połowa średnicy gałki) */
const PAD_PX = 32;

export default function StepRangeSlider({
  steps,
  initialIndex = 0,
  rememberedIndex,
  onChange,
  className,
  funnel: propFunnel,
}: StepRangeSliderProps) {
  const contextFunnel = useCurrentFunnel();
  const funnel = propFunnel ?? contextFunnel;
  const trackRef = useRef<HTMLDivElement | null>(null);

  // --- tryb kontrolowany vs niekontrolowany
  const isControlled = rememberedIndex != null;

  // niekontrolowany: własny stan indeksu
  const [uIndex, setUIndex] = useState(() =>
    clamp(initialIndex, 0, Math.max(steps.length - 1, 0))
  );

  // aktualny indeks "do renderu"
  const index = isControlled
    ? clamp(rememberedIndex as number, 0, Math.max(steps.length - 1, 0))
    : uIndex;

  const [dragging, setDragging] = useState(false);
  const [fillPx, setFillPx] = useState(0);

  // --- pochodne
  const pctFromIndex = useCallback(
    (i: number) => (steps.length <= 1 ? 0 : (i / (steps.length - 1)) * 100),
    [steps.length]
  );
  const pct = useMemo(() => pctFromIndex(index), [index, pctFromIndex]);
  const label = useMemo(() => steps[index] ?? '', [steps, index]);

  const positionToIndex = useCallback(
    (pos01: number) =>
      clamp(Math.round(pos01 * (steps.length - 1)), 0, steps.length - 1),
    [steps.length]
  );

  const pointerToIndex = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const pos01 = clamp((clientX - rect.left) / rect.width, 0, 1);
      return positionToIndex(pos01);
    },
    [positionToIndex]
  );

  // --- przeliczenie wypełnienia (tylko UI)
  useEffect(() => {
    const recomputeFill = () => {
      const el = trackRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      const pos01 = steps.length > 1 ? index / (steps.length - 1) : 0;
      setFillPx(PAD_PX + pos01 * w);
    };

    recomputeFill();

    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recomputeFill);
    ro.observe(el);
    window.addEventListener('resize', recomputeFill);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recomputeFill);
    };
  }, [index, steps.length]);

  // --- emisja zmian WYŁĄCZNIE w fazie zdarzeń
  const emitChange = useCallback(
    (i: number) => {
      if (!onChange) return;
      const lbl = steps[i] ?? '';
      onChange(i, lbl);
    },
    [onChange, steps]
  );

  // --- ustawianie indeksu (bez side-effectów w renderze)
  const setIndexFromUI = useCallback(
    (i: number) => {
      i = clamp(i, 0, Math.max(steps.length - 1, 0));
      if (i === index) return; // brak zmian -> brak emisji
      if (isControlled) {
        // kontrolowany: rodzic aktualizuje wartość; my tylko emitujemy
        emitChange(i);
      } else {
        // niekontrolowany: aktualizujemy lokalny stan i informujemy rodzica
        setUIndex(i);
        emitChange(i);
      }
    },
    [emitChange, index, isControlled, steps.length]
  );

  // --- obsługa drag
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      setIndexFromUI(pointerToIndex(e.clientX));
    };
    const end = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [dragging, setIndexFromUI, pointerToIndex]);

  // --- klawiatura
  const stepBy = useCallback(
    (delta: number) => {
      const next = clamp(index + delta, 0, steps.length - 1);
      setIndexFromUI(next);
    },
    [index, steps.length, setIndexFromUI]
  );

  const cssVars = {
    ['--pct' as any]: String(pct),
    ['--fillpx' as any]: `${fillPx}px`,
  } as React.CSSProperties;

  return (
    <div className={`${styles.wrapper} ${styles[`funnel_${funnel}`]} ${className ?? ''}`}>
      <div
        className={`${styles.rail} ${dragging ? styles.dragging : ''}`}
        style={cssVars}
        onPointerDown={(e) => {
          e.preventDefault();
          setDragging(true);
          setIndexFromUI(pointerToIndex(e.clientX));
        }}
      >
        <div className={styles.bar}>
          <div className={styles.fill} />
        </div>

        <div ref={trackRef} className={styles.track}>
          <div className={styles.dots}>
            {steps.map((s, i) => (
              <button
                key={i}
                className={`${styles.dot} ${
                  i <= index ? styles.dotActive : styles.dotIdle
                }`}
                style={{ left: `calc(${pctFromIndex(i)}%)` }}
                onClick={() => setIndexFromUI(i)}
                aria-label={`Ustaw na ${s}`}
                tabIndex={-1}
              />
            ))}
          </div>

          <button
            className={styles.handle}
            onPointerDown={(e) => {
              e.preventDefault();
              setDragging(true);
              setIndexFromUI(pointerToIndex(e.clientX));
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
            aria-valuetext={label}
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
