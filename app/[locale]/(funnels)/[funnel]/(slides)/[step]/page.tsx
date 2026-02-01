import type { Metadata } from 'next'
import type React from 'react'
import { notFound } from 'next/navigation'
import { funnelStepMetadata, getSeoTitle, getSeoDescription } from '@/lib/metadata'
import { getPathname, redirect } from '@/i18n/routing'
import { getBaseUrlFromHeaders } from '@/lib/requestBaseUrl'
import { FunnelProvider } from '@/lib/funnels/funnelContext'
import {
  getFirstStep,
  getFunnelSlug,
  getStepSlug,
  resolveFunnelKey,
  resolveStepId,
  type FunnelKey,
} from '@/lib/funnels/funnels'
import type { StepId } from '@/lib/steps/stepIds.ts';

async function loadStepComponent(stepId: StepId): Promise<React.ComponentType | null> {
  try {
    const mod = await import(`@/app/funnel-slides/${stepId}/Slide`)
    return mod.default
  } catch (error) {
    console.error(`Unable to load slide for step '${stepId}':`, error)
    return null
  }
}

type Params = { locale: string; funnel: string; step: string }

function buildCanonicalHref(funnel: FunnelKey, step: StepId, locale: string) {
  return {
    pathname: '/[funnel]/[step]',
    params: {
      funnel: getFunnelSlug(funnel, locale),
      step: getStepSlug(funnel, step, locale),
    },
  } as const
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, funnel, step } = await params
  const funnelKey = resolveFunnelKey(funnel, locale)
  const baseUrl = await getBaseUrlFromHeaders()
  
  const title = await getSeoTitle(locale, 'planForm')
  const description = await getSeoDescription(locale, 'planForm')

  if (!funnelKey) {
    const base = funnelStepMetadata({
      title,
      description,
      locale,
      baseUrl,
    })
    return { ...base, robots: { index: false, follow: false } }
  }

  const resolvedStepId = resolveStepId(funnelKey, step, locale) ?? getFirstStep(funnelKey)
  const canonicalPath = getPathname({ href: buildCanonicalHref(funnelKey, resolvedStepId, locale), locale })

  const base = funnelStepMetadata({
    title,
    description,
    canonicalPath,
    locale,
    baseUrl,
  })

  return { ...base, robots: { index: false, follow: false } }
}

export default async function FunnelStepPage({ params }: { params: Promise<Params> }) {
  const { locale, funnel, step } = await params
  const funnelKey = resolveFunnelKey(funnel, locale)

  if (!funnelKey) {
    notFound()
  }

  const resolvedStepId = resolveStepId(funnelKey, step, locale)
  const targetStepId = resolvedStepId ?? getFirstStep(funnelKey)

  if (!resolvedStepId) {
    return redirect({ href: buildCanonicalHref(funnelKey, targetStepId, locale), locale })
  }

  const Component = await loadStepComponent(targetStepId)
  if (!Component) {
    notFound()
  }

  return (
    <FunnelProvider funnel={funnelKey}>
      <div className={`funnel-container funnel-${funnelKey}`}>
        <Component />
      </div>
    </FunnelProvider>
  )
}
