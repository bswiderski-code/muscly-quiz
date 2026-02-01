// lib/usePlanField.ts
"use client";
import { useCallback } from "react";
import { useFunnelStore, type FunnelAnswers } from "@/lib/store";
import type { FunnelKey } from "@/lib/funnels/funnels";

export function usePlanField<T extends keyof FunnelAnswers>(sid: string, field: T, funnel?: FunnelKey) {
  const value = useFunnelStore((s) => s.getFor(sid, funnel)?.[field]) as FunnelAnswers[T] | undefined;
  const setField = useFunnelStore((s) => s.setField);

  const set = useCallback(
    (v: NonNullable<FunnelAnswers[T]>) => setField(sid, field, v as any, funnel),
    [setField, sid, field, funnel]
  );

  return [value, set] as const;
}
