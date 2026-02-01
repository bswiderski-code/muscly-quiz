'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from '@/i18n/routing'
import { v4 as uuid } from 'uuid'
import { useFunnelStore, type FunnelAnswers } from '@/lib/store'
import { FUNNELS, getFunnelSlug, getResultSlug, getStepOrder, getStepSlug, type FunnelKey } from '@/lib/funnels/funnels'
import type { StepId } from '@/lib/steps/stepIds'
import { useLocale } from 'next-intl'
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'

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
  const funnel = options?.funnel ?? useCurrentFunnel()
  const router = useRouter()
  const field = stepId as keyof FunnelAnswers
  const order = getStepOrder(funnel)
  const idx = order.indexOf(stepId)
  const isFirst = idx === 0
  const isLast = idx === order.length - 1

  const [sid, setSid] = useState('')
  const [isPending, startTransition] = useTransition()

  const setDefaultFunnel = useFunnelStore(s => s.setDefaultFunnel)
  const setField = useFunnelStore(s => s.setField)
  const planEntry = useFunnelStore((s) => (sid ? s.getFor(sid, funnel) : undefined))

  useEffect(() => {
    setDefaultFunnel(funnel)

    // Apply forced answers if defined for the funnel
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

  // ensure sid
  useEffect(() => {
    let s = getCookie('sid')
    if (!s) { s = uuid(); setCookie('sid', s) }
    setSid(s)
  }, [])

  // current value (prefilled)
  const currentValue = planEntry?.[field]
  const value = currentValue !== undefined && currentValue !== null ? String(currentValue) : ''

  // Branching Logic
  const skipRules = FUNNELS[funnel]?.steps.skipRules ?? []

  const getSkippedSteps = (answers: Partial<FunnelAnswers> | undefined) => {
    if (!answers) return new Set<StepId>()
    const skipped = new Set<StepId>()
    for (const rule of skipRules) {
      const triggerValue = answers[rule.trigger.step as keyof FunnelAnswers]
      if (triggerValue !== undefined && String(triggerValue) === rule.trigger.value) {
        rule.skip.forEach(s => skipped.add(s))
      }
    }
    return skipped
  }

  // Calculate effective previous step
  const skippedForPrev = getSkippedSteps(planEntry)
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
    // Simulate answers with the new value for the current step
    const currentAnswers = planEntry ?? {}
    const val = selectedValue !== undefined ? selectedValue : value
    const nextAnswers = { ...currentAnswers, [field]: val }
    
    const skipped = getSkippedSteps(nextAnswers)

    let nextIdx = idx + 1
    while (nextIdx < order.length) {
      const candidate = order[nextIdx]
      if (!skipped.has(candidate)) return candidate
      nextIdx++
    }
    return null
  }

  const effectiveNextStepId = resolveNextStepId()

  const funnelSlug = getFunnelSlug(funnel, locale)
  const resultSlug = getResultSlug(funnel, locale)
  const hrefForStep = (target: StepId | null) =>
    target
      ? ({
          pathname: '/[funnel]/[step]',
          params: { funnel: funnelSlug, step: getStepSlug(funnel, target, locale) },
        } as const)
      : null

  const prevHref = hrefForStep(effectivePrevStepId)
  const nextHref = hrefForStep(effectiveNextStepId)
  const resultHref = sid
    ? ({ pathname: '/wynik/[funnel]/[sessionId]', params: { funnel: resultSlug, sessionId: sid } } as const)
    : null

  // prefetch neighbors (+result on last step)
  useEffect(() => {
    if (prevHref) router.prefetch(prevHref as any)
    if (nextHref) router.prefetch(nextHref as any)
    if (isLast && resultHref) router.prefetch(resultHref)
  }, [prevHref, nextHref, isLast, resultHref, router])

  // API you use in slides:
  function select(val: string, opts?: { advance?: boolean }) {
    if (!sid) return
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
    // meta
    stepId, idx, total: order.length, isFirst, isLast,
    funnel,
    // data
    sid, value,
    // actions
    select, goPrev, goNext, goTo,
    // ui
    isPending,
    // optional: expose hrefs if you want to <Link/>
    prevHref, nextHref, resultHref,
  }
}
