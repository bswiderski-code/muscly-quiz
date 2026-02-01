'use client'

import { createContext, useContext } from 'react'
import type { FunnelKey } from './funnels'

const FunnelContext = createContext<FunnelKey>('plan')

export function FunnelProvider({ funnel, children }: { funnel: FunnelKey; children: React.ReactNode }) {
  return <FunnelContext.Provider value={funnel}>{children}</FunnelContext.Provider>
}

export function useCurrentFunnel(): FunnelKey {
  return useContext(FunnelContext)
}
