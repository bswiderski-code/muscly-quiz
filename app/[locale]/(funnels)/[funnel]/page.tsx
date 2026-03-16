import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Locale } from '@/i18n/config'
import { redirect } from '@/i18n/routing'
import { getFirstStep, getFunnelSlug, getStepSlug, resolveFunnelKey, isFunnelAllowedOnDomain } from '@/lib/quiz/funnels'

import type { Metadata } from 'next'
import { getIncomingHost } from '@/lib/domain/incomingHost'

type Params = { locale: Locale; funnel: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, funnel } = await params
  const funnelKey = resolveFunnelKey(funnel)
  
  if (!funnelKey) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    }
  }

  return {
    robots: { index: false, follow: false },
  }
}

export default async function FunnelLandingPageRoute({ params }: { params: Promise<Params> }) {
  const { locale, funnel } = await params
  const h = await headers()
  const host = getIncomingHost(h)

  const funnelKey = resolveFunnelKey(funnel)
  if (!funnelKey) {
    notFound()
  }

  // Check domain restrictions
  if (!isFunnelAllowedOnDomain(funnelKey, host)) {
    notFound()
  }

  // Skip landing page and redirect to first step
  const firstStep = getFirstStep(funnelKey)
  const stepSlug = getStepSlug(funnelKey, firstStep)
  const funnelSlug = getFunnelSlug(funnelKey)

  return redirect({
    href: {
      pathname: '/[funnel]/[step]',
      params: { funnel: funnelSlug, step: stepSlug }
    },
    locale
  })
}
