// lib/store.ts
'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getMarketForHost } from '@/i18n/config'

// Decoupled from specific funnel definitions to allow scalability
export type FunnelKey = string

const detectLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  const market = getMarketForHost(window.location.host)
  return market.isKnownHost ? market.locale : 'en'
}

export type FunnelAnswers = {
  // Dynamic access for any step ID
  [key: string]: string | number | undefined
  
  // Common fields (kept for type safety/autocompletion in components)
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
  calistenic_experience?: string
  usedMetric?: 'us' | 'eu'
  height_raw?: number
  weight_raw?: number
  weight_goal_raw?: number
}

type ByFunnel = Record<FunnelKey, Record<string, FunnelAnswers>>

type State = {
  // Legacy convenience view: always points to the default funnel bucket
  bySid: Record<string, FunnelAnswers>
  // Canonical storage keyed by funnel -> sid
  byFunnel: ByFunnel
  defaultFunnel: FunnelKey | null
  language: string
  setField: (sid: string, field: keyof FunnelAnswers, value: string | number, funnel?: FunnelKey) => void
  getField: (sid: string, field: keyof FunnelAnswers, funnel?: FunnelKey) => string | number | undefined
  getFor: (sid: string, funnel?: FunnelKey) => FunnelAnswers | undefined
  reset: (sid: string, funnel?: FunnelKey) => void
  setDefaultFunnel: (funnel: FunnelKey) => void
  setLanguage: (lang: string) => void
  getLanguage: () => string
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
          // Enforce single funnel memory: only keep the current funnel's data
          byFunnel: { [funnel]: state.byFunnel[funnel] ?? {} },
          bySid: state.byFunnel[funnel] ?? {},
        })),
      setLanguage: (lang) => set({ language: lang }),
      getLanguage: () => get().language,
    }),
    {
      name: 'workout-answers',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      // migrate persisted state from older versions to the current shape
      migrate: async (persistedState: any) => {
        if (!persistedState) return persistedState
        const raw = persistedState.state ?? persistedState
        if (!raw) return persistedState

        const legacyBySid: Record<string, any> = raw.bySid ?? {}
        const legacyDefault: FunnelKey | null = raw.defaultFunnel ?? null
        const mergedByFunnel: ByFunnel = {
          ...(raw.byFunnel ?? {}),
          ...(legacyDefault ? { [legacyDefault]: { ...(raw.byFunnel?.[legacyDefault] ?? {}), ...legacyBySid } } : {}),
        }

        const normalizedByFunnel = Object.fromEntries(
          Object.entries(mergedByFunnel).map(([funnelKey, bucket]) => [
            funnelKey as FunnelKey,
            bucket as Record<string, FunnelAnswers>,
          ]),
        ) as ByFunnel

        const fallbackDefault = legacyDefault ?? (Object.keys(normalizedByFunnel)[0] as FunnelKey | undefined) ?? null

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

// Add global console command for debugging
if (typeof window !== 'undefined') {
  (window as any).zustandstate = () => console.log(useFunnelStore.getState())
}
