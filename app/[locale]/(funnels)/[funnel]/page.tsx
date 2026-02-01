import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Locale } from '@/i18n/config'
import { redirect } from '@/i18n/routing'
import { getFirstStep, getFunnelSlug, getStepSlug, resolveFunnelKey, isFunnelAllowedOnDomain } from '@/lib/funnels/funnels'
import { generateFunnelLandingMetadata } from '@/lib/metadata/funnelLandingMetadata'
import type { Metadata } from 'next'
import { getIncomingHost } from '@/lib/domain/incomingHost'

type Params = { locale: Locale; funnel: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, funnel } = await params
  const funnelKey = resolveFunnelKey(funnel, locale)
  
  if (!funnelKey) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    }
  }

  return generateFunnelLandingMetadata(funnelKey, locale)
}

export default async function FunnelLandingPageRoute({ params }: { params: Promise<Params> }) {
  const { locale, funnel } = await params
  const h = await headers()
  const host = getIncomingHost(h)

  const funnelKey = resolveFunnelKey(funnel, locale)
  if (!funnelKey) {
    notFound()
  }

  // Check domain restrictions
  if (!isFunnelAllowedOnDomain(funnelKey, host)) {
    notFound()
  }

  // Skip landing page and redirect to first step
  const firstStep = getFirstStep(funnelKey)
  const stepSlug = getStepSlug(funnelKey, firstStep, locale)
  const funnelSlug = getFunnelSlug(funnelKey, locale)

  return redirect({
    href: {
      pathname: '/[funnel]/[step]',
      params: { funnel: funnelSlug, step: stepSlug }
    },
    locale
  })
}
