import { sendGTMEvent } from '@next/third-parties/google'
import { trackInitiateCheckout } from '@/lib/analytics'
import { funnelDefinitions, type LocalePricingKey } from '@/lib/funnels/funnelDefinitions'
import type { Locale, CheckoutProvider } from '@/i18n/config'

type OfferKind = 'workout_solo' | 'workout_bundle' | 'calisthenics_solo' | 'calisthenics_bundle'

type LocalizedOffer = {
	amount: number
	description: string
	currency: string
}

type LocalizedPricing = {
	workout_solo: LocalizedOffer
	workout_bundle: LocalizedOffer
	calisthenics_solo: LocalizedOffer
	calisthenics_bundle: LocalizedOffer
}

const localeFallbackOrder: LocalePricingKey[] = ['pl', 'en', 'de', 'fr']

export function getLocalizedPricing(funnelKey: string, locale: Locale, marketCurrency: string): LocalizedPricing | null {
	const def = funnelDefinitions[funnelKey as keyof typeof funnelDefinitions]
	if (!def || !def.pricing) return null

	const preferredOrder: LocalePricingKey[] = [locale as LocalePricingKey, ...localeFallbackOrder]
	const pick = preferredOrder.find((loc) => def.pricing && def.pricing[loc]) as LocalePricingKey | undefined
	if (!pick || !def.pricing[pick]) return null

	const entry = def.pricing[pick]!
	const currency = entry.currency || marketCurrency

	// For kalistenika funnel, use calisthenics products, otherwise use workout products
	const isCalisthenicsFunnel = funnelKey === 'kalistenika'

	return {
		workout_solo: { ...(isCalisthenicsFunnel ? entry.calisthenics_solo : entry.workout_solo), currency },
		workout_bundle: { ...(isCalisthenicsFunnel ? entry.calisthenics_bundle : entry.workout_bundle), currency },
		calisthenics_solo: { ...entry.calisthenics_solo, currency },
		calisthenics_bundle: { ...entry.calisthenics_bundle, currency },
	}
}

export function trackViewItemEvent(params: { funnelKey: string; locale: Locale; marketCurrency: string }) {
	const pricing = getLocalizedPricing(params.funnelKey, params.locale, params.marketCurrency)
	const bundle = pricing?.workout_bundle
	if (!bundle) return

	sendGTMEvent({
		event: 'view_item',
		ecommerce: {
			currency: bundle.currency,
			value: bundle.amount,
			items: [
				{
					item_id: bundle.description,
					item_name: bundle.description,
					price: bundle.amount,
					currency: bundle.currency,
					quantity: 1,
				},
			],
		},
	})
}

export function trackBeginCheckoutEvent(params: {
	funnelKey: string
	locale: Locale
	marketCurrency: string
	kind: OfferKind
	checkoutProvider: CheckoutProvider
}) {
	const pricing = getLocalizedPricing(params.funnelKey, params.locale, params.marketCurrency)
	const offer = pricing ? pricing[params.kind] : null
	if (!offer) return

	trackInitiateCheckout({
		currency: offer.currency,
		value: offer.amount,
		content_name: offer.description,
		content_type: 'product',
	})

	sendGTMEvent({
		event: 'begin_checkout',
		ecommerce: {
			currency: offer.currency,
			value: offer.amount,
			items: [
				{
					item_id: offer.description,
					item_name: offer.description,
					price: offer.amount,
					currency: offer.currency,
					quantity: 1,
				},
			],
		},
	})
}
