'use client'

import { useEffect, useTransition } from 'react'
import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { v4 as uuid } from 'uuid'
import { useFunnelStore, type FunnelAnswers } from './store'
import { FUNNELS, getFunnelSlug, getResultSlug, getStepOrder, getStepSlug, type FunnelKey } from './funnels'
import type { StepId } from './stepIds'
import { useLocale } from 'next-intl'
import { useCurrentFunnel } from './funnelContext'
import { getSkippedSteps, resolveNextStep } from './navigation'

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000`
}

export function useStepController(stepId: StepId, options?: { funnel?: FunnelKey }) {
  const locale = useLocale()
  const contextFunnel = useCurrentFunnel()
  const funnel = options?.funnel ?? contextFunnel
  const router = useRouter()
  const field = stepId as keyof FunnelAnswers
  const order = getStepOrder(funnel)
  const skipRules = FUNNELS[funnel]?.steps.skipRules ?? []
  const idx = order.indexOf(stepId)
  const isFirst = idx === 0
  const isLast = idx === order.length - 1

  const [sid, setSid] = useState('')
  const [isPending, startTransition] = useTransition()

  const setDefaultFunnel = useFunnelStore(s => s.setDefaultFunnel)
  const setField = useFunnelStore(s => s.setField)
  const planEntry = useFunnelStore(s => (sid ? s.getFor(sid, funnel) : undefined))

  useEffect(() => {
    setDefaultFunnel(funnel)

    const funnelDef = FUNNELS[funnel]
    if (funnelDef?.forcedAnswers && sid) {
      Object.entries(funnelDef.forcedAnswers).forEach(([key, value]) => {
        const currentVal = useFunnelStore.getState().getField(sid, key as keyof FunnelAnswers, funnel)
        if (currentVal !== value) {
          setField(sid, key as keyof FunnelAnswers, value, funnel)
        }
      })
    }
  }, [funnel, sid, setDefaultFunnel, setField])

  useEffect(() => {
    let s = getCookie('sid')
    if (!s) {
      s = uuid()
      setCookie('sid', s)
    }
    setSid(s)
  }, [])

  const currentValue = planEntry?.[field]
  const value = currentValue !== undefined && currentValue !== null ? String(currentValue) : ''

  const skippedForPrev = getSkippedSteps(planEntry ?? {}, skipRules)
  let prevIdx = idx - 1
  let effectivePrevStepId: StepId | null = null
  while (prevIdx >= 0) {
    const candidate = order[prevIdx]
    if (!skippedForPrev.has(candidate)) {
      effectivePrevStepId = candidate
      break
    }
    prevIdx--
  }

  const resolveNextStepId = (selectedValue?: string): StepId | null => {
    const val = selectedValue !== undefined ? selectedValue : value
    const nextAnswers = { ...(planEntry ?? {}), [field]: val }
    return resolveNextStep(stepId, order, nextAnswers, skipRules)
  }

  const effectiveNextStepId = resolveNextStepId()

  const funnelSlug = getFunnelSlug(funnel)
  const resultSlug = getResultSlug(funnel)
  const hrefForStep = (target: StepId | null) =>
    target
      ? ({
          pathname: '/[funnel]/[step]',
          params: { funnel: funnelSlug, step: getStepSlug(funnel, target) },
        } as const)
      : null

  const prevHref = hrefForStep(effectivePrevStepId)
  const nextHref = hrefForStep(effectiveNextStepId)
  const resultHref = sid
    ? ({ pathname: '/result/[funnel]/[sessionId]', params: { funnel: resultSlug, sessionId: sid } } as const)
    : null

  useEffect(() => {
    if (prevHref) router.prefetch(prevHref as any)
    if (nextHref) router.prefetch(nextHref as any)
    if (isLast && resultHref) router.prefetch(resultHref)
  }, [prevHref, nextHref, isLast, resultHref, router])

  function select(val: string, opts?: { advance?: boolean }) {
    if (!sid) return
    if (stepId === 'gender') {
      useFunnelStore.getState().clearAll()
    }
    setField(sid, field, val, funnel)
    if (opts?.advance !== false) {
      const href = hrefForStep(resolveNextStepId(val)) ?? resultHref
      if (href) startTransition(() => router.push(href as any))
    }
  }

  function goPrev() {
    if (prevHref) startTransition(() => router.push(prevHref as any))
  }

  function goNext() {
    const href = nextHref ?? resultHref
    if (!href) return
    startTransition(() => router.push(href as any))
  }

  function goTo(step: StepId) {
    startTransition(() => router.push(hrefForStep(step) as any))
  }

  return {
    stepId, idx, total: order.length, isFirst, isLast,
    funnel,
    sid, value,
    select, goPrev, goNext, goTo,
    isPending,
    prevHref, nextHref, resultHref,
  }
}
