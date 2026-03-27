'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getMarketForHost } from '@/i18n/config'

const detectLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  const market = getMarketForHost(window.location.host)
  return market.isKnownHost ? market.locale : 'en'
}

export type FunnelAnswers = {
  [key: string]: string | number | undefined
  name?: string
  email?: string
  gender?: string
  experience?: string
  difficulty?: string
  height?: number
  weight?: number
  age?: number
  activity?: string
  diet_goal?: string
  bodyfat?: string
  location?: string
  equipment?: string
  weight_goal?: number
  priority?: string
  frequency?: string
  fitness?: number
  sleep?: string
  bmi?: number
  duration?: number
  pushups?: string
  pullups?: string
  usedMetric?: 'us' | 'eu'
  height_raw?: number
  weight_raw?: number
  weight_goal_raw?: number
  cardio?: string
  physique_goal?: string
  dream_physique?: string
}

type ByFunnel = Record<string, Record<string, FunnelAnswers>>

type State = {
  bySid: Record<string, FunnelAnswers>
  byFunnel: ByFunnel
  defaultFunnel: string | null
  language: string
  setField: (sid: string, field: keyof FunnelAnswers, value: string | number, funnel?: string) => void
  getField: (sid: string, field: keyof FunnelAnswers, funnel?: string) => string | number | undefined
  getFor: (sid: string, funnel?: string) => FunnelAnswers | undefined
  reset: (sid: string, funnel?: string) => void
  setDefaultFunnel: (funnel: string) => void
  setLanguage: (lang: string) => void
  getLanguage: () => string
  clearAll: () => void
}

export const useFunnelStore = create<State>()(
  persist(
    (set, get) => ({
      bySid: {},
      byFunnel: {} as ByFunnel,
      defaultFunnel: null,
      language: detectLanguage(),
      setField: (sid, field, value, funnel) =>
        set((state) => {
          const targetFunnel = funnel ?? state.defaultFunnel
          if (!targetFunnel) return state
          const bucket = state.byFunnel[targetFunnel] ?? {}
          const updatedBucket = {
            ...bucket,
            [sid]: { ...(bucket[sid] ?? {}), [field]: value },
          }
          const byFunnel = { ...state.byFunnel, [targetFunnel]: updatedBucket }
          const nextDefault = state.defaultFunnel ?? targetFunnel
          const bySid = targetFunnel === nextDefault ? updatedBucket : state.bySid
          return { byFunnel, bySid, defaultFunnel: nextDefault }
        }),
      getField: (sid, field, funnel) => {
        const targetFunnel = funnel ?? get().defaultFunnel
        if (!targetFunnel) return undefined
        return get().byFunnel[targetFunnel]?.[sid]?.[field]
      },
      getFor: (sid, funnel) => {
        const targetFunnel = funnel ?? get().defaultFunnel
        if (!targetFunnel) return undefined
        return get().byFunnel[targetFunnel]?.[sid]
      },
      reset: (sid, funnel) =>
        set((state) => {
          const targetFunnel = funnel ?? state.defaultFunnel
          if (!targetFunnel) return state
          const bucket = state.byFunnel[targetFunnel] ?? {}
          if (!bucket[sid]) return state
          const { [sid]: _omit, ...rest } = bucket
          const byFunnel = { ...state.byFunnel, [targetFunnel]: rest }
          const bySid = targetFunnel === state.defaultFunnel ? rest : state.bySid
          return { byFunnel, bySid }
        }),
      setDefaultFunnel: (funnel) =>
        set((state) => ({
          defaultFunnel: funnel,
          byFunnel: { [funnel]: state.byFunnel[funnel] ?? {} },
          bySid: state.byFunnel[funnel] ?? {},
        })),
      setLanguage: (lang) => set({ language: lang }),
      getLanguage: () => get().language,
      clearAll: () => set({ bySid: {}, byFunnel: {} }),
    }),
    {
      name: 'workout-answers',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: async (persistedState: any) => {
        if (!persistedState) return persistedState
        const raw = persistedState.state ?? persistedState
        if (!raw) return persistedState

        const legacyBySid: Record<string, any> = raw.bySid ?? {}
        const legacyDefault: string | null = raw.defaultFunnel ?? null
        const mergedByFunnel: ByFunnel = {
          ...(raw.byFunnel ?? {}),
          ...(legacyDefault ? { [legacyDefault]: { ...(raw.byFunnel?.[legacyDefault] ?? {}), ...legacyBySid } } : {}),
        }

        const normalizedByFunnel = Object.fromEntries(
          Object.entries(mergedByFunnel).map(([funnelKey, bucket]) => [
            funnelKey,
            bucket as Record<string, FunnelAnswers>,
          ]),
        ) as ByFunnel

        const fallbackDefault = legacyDefault ?? Object.keys(normalizedByFunnel)[0] ?? null

        const newRaw = {
          ...raw,
          defaultFunnel: fallbackDefault,
          byFunnel: normalizedByFunnel,
          bySid: fallbackDefault ? normalizedByFunnel[fallbackDefault] ?? {} : {},
        }

        if (persistedState.state !== undefined) {
          return { ...persistedState, state: newRaw }
        }
        return newRaw
      },
    },
  ),
)

if (typeof window !== 'undefined') {
  (window as any).zustandstate = () => console.log(useFunnelStore.getState())
}
