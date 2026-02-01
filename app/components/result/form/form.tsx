'use client'

import { useEffect, useState } from "react";
import { useFunnelStore } from "@/lib/store";
import { useTranslations } from "next-intl";
import type { FunnelKey } from '@/lib/funnels/funnels';
import type { Locale, CheckoutProvider } from '@/i18n/config';
import { ContactForm } from "./ContactForm";
import { PaymentSection } from "./PaymentSection";
import { getSuggestedEmailForCommonDomainTypos, validTlds } from "@/lib/emailValidator";
import styles from './form.module.css';
import { StripePayButton } from '../stripebtn';
import { PLPayButton } from '../plpaybtn';
import { getLocalizedPricing, trackBeginCheckoutEvent, trackViewItemEvent } from './form_pixel';
import CheckoutIntro from './checkout_intro';
import { getResultPageConfig } from '../templates/config';

export type CheckoutFormPayloadContext = {
  name: string;
  email: string;
  agree: boolean;
  sessionId: string;
  funnelKey?: FunnelKey;
  answers: Record<string, unknown>;
};

export type CheckoutFormProps = {
  sessionId: string;
  funnelKey?: FunnelKey;
  locale: Locale;
  checkoutProvider: CheckoutProvider;
  marketCurrency: string;
  separatorText: string;
  paymentNoteHtml?: string;
  buildPayload?: (ctx: CheckoutFormPayloadContext) => Record<string, unknown>;
};

export default function CheckoutForm({
  sessionId,
  funnelKey,
  locale,
  checkoutProvider,
  marketCurrency,
  separatorText,
  paymentNoteHtml,
  buildPayload,
}: CheckoutFormProps) {
  const t = useTranslations('ReportForm');
  const productsT = useTranslations('CheckoutProducts');

  // Get result page config for funnel-specific customization
  const resultConfig = getResultPageConfig(funnelKey || 'workout');
  const checkoutIntroImage = resultConfig.checkoutIntroImage;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [agreeError, setAgreeError] = useState("");
  const [agreeHealthError, setAgreeHealthError] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeHealth, setAgreeHealth] = useState(false);
  const [hasShownEmailError, setHasShownEmailError] = useState(false);
  const [hasShownDomainTypoError, setHasShownDomainTypoError] = useState(false);
  const [deviceType, setDeviceType] = useState<'apple' | 'android' | 'other'>('other');

  const answers = useFunnelStore((s) => s.getFor(sessionId, funnelKey) ?? {});
  const answersRecord = (answers as Record<string, unknown>) ?? {};

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod|macintosh/.test(userAgent)) {
        setDeviceType('apple');
      } else if (/android/.test(userAgent)) {
        setDeviceType('android');
      }
    }
  }, []);

  useEffect(() => {
    trackViewItemEvent({
      funnelKey: funnelKey ?? 'workout',
      locale,
      marketCurrency,
    });
  }, [funnelKey, locale, marketCurrency]);

  function allFieldsValid() {
    return name.trim() && email.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  function handlePayClick(payHandler: (formData: Record<string, unknown>) => void) {
    setAgreeError("");
    setAgreeHealthError("");
    if (!allFieldsValid()) {
      setFormError(t('errorMsg1'));
      return;
    }

    if (!agree) {
      setFormError("");
      setAgreeError(t('agreementRequiredError'));
      return;
    }

    if (!agreeHealth) {
      setFormError("");
      setAgreeHealthError(t('healthDataAgreementRequiredError'));
      return;
    }

    const suggestedEmail = getSuggestedEmailForCommonDomainTypos(email);
    if (suggestedEmail && suggestedEmail.toLowerCase() !== email.trim().toLowerCase()) {
      if (!hasShownDomainTypoError) {
        setHasShownDomainTypoError(true);
        setFormError(t('errorMsgDomainTypo', { suggestedEmail }));
        return;
      }
    }

    const domain = email.split('@')[1] ?? '';
    const tld = domain.split('.').pop();
    if (!tld || !validTlds.includes(tld)) {
      if (!hasShownEmailError) {
        setHasShownEmailError(true);
        setFormError(t('errorMsg2'));
        return;
      }
    }
    setFormError("");

    const basePayload: CheckoutFormPayloadContext = {
      name,
      email,
      agree,
      sessionId,
      funnelKey,
      answers: answersRecord,
    };

    const extra = buildPayload ? buildPayload(basePayload) : {};
    payHandler({
      ...answersRecord,
      ...extra,
      // Always allow explicit overrides.
      name,
      email,
      sessionId,
    });
  }

  const pricing = getLocalizedPricing(funnelKey ?? 'workout', locale, marketCurrency);
  const soloOffer = pricing?.workout_solo;
  const bundleOffer = pricing?.workout_bundle;

  const checkoutSoloCopy = (productsT.raw('workout_solo') as { productName?: string; buttonSvg?: string }) ?? {};
  const checkoutBundleCopy = (productsT.raw('workout_bundle') as { productName?: string; buttonSvg?: string }) ?? {};
  const defaultSoloButton = (checkoutSoloCopy.buttonSvg || "/btns/{locale}/workout_bef.svg").replace('{locale}', locale);
  const defaultBundleButton = (checkoutBundleCopy.buttonSvg || "/btns/{locale}/bundle_bef.svg").replace('{locale}', locale);

  const offers = [] as { key: string; node: React.ReactNode }[];

  if (checkoutProvider === 'stripe' && soloOffer && bundleOffer) {
    offers.push(
      {
        key: 'stripe_solo',
        node: (
          <StripePayButton
            onPay={handlePayClick}
            currency={soloOffer.currency}
            amount={soloOffer.amount}
            description={soloOffer.description}
            productName={checkoutSoloCopy.productName ?? soloOffer.description}
            buttonSvg={defaultSoloButton}
            onBeforePay={() =>
              trackBeginCheckoutEvent({
                funnelKey: funnelKey ?? 'workout',
                locale,
                marketCurrency,
                kind: 'workout_solo',
                checkoutProvider,
              })
            }
          />
        ),
      },
      {
        key: 'stripe_bundle',
        node: (
          <StripePayButton
            onPay={handlePayClick}
            currency={bundleOffer.currency}
            amount={bundleOffer.amount}
            description={bundleOffer.description}
            productName={checkoutBundleCopy.productName ?? bundleOffer.description}
            buttonSvg={defaultBundleButton}
            onBeforePay={() =>
              trackBeginCheckoutEvent({
                funnelKey: funnelKey ?? 'workout',
                locale,
                marketCurrency,
                kind: 'workout_bundle',
                checkoutProvider,
              })
            }
          />
        ),
      },
    );
  } else if (checkoutProvider !== 'stripe' && soloOffer && bundleOffer) {
    offers.push(
      {
        key: 'pl_solo',
        node: (
          <PLPayButton
            onPay={handlePayClick}
            amountPln={soloOffer.amount}
            description={soloOffer.description}
            productName={checkoutSoloCopy.productName ?? soloOffer.description}
            buttonSvg={defaultSoloButton}
            onBeforePay={() =>
              trackBeginCheckoutEvent({
                funnelKey: funnelKey ?? 'workout',
                locale,
                marketCurrency,
                kind: 'workout_solo',
                checkoutProvider,
              })
            }
          />
        ),
      },
      {
        key: 'pl_bundle',
        node: (
          <PLPayButton
            onPay={handlePayClick}
            amountPln={bundleOffer.amount}
            description={bundleOffer.description}
            productName={checkoutBundleCopy.productName ?? bundleOffer.description}
            buttonSvg={defaultBundleButton}
            onBeforePay={() =>
              trackBeginCheckoutEvent({
                funnelKey: funnelKey ?? 'workout',
                locale,
                marketCurrency,
                kind: 'workout_bundle',
                checkoutProvider,
              })
            }
          />
        ),
      },
    );
  }

  return (
    <div className={styles.container}>
      <CheckoutIntro funnelKey={funnelKey ?? 'workout'} locale={locale} imageSrc={checkoutIntroImage} />

      <ContactForm
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        agree={agree}
        setAgree={setAgree}
        agreeHealth={agreeHealth}
        setAgreeHealth={setAgreeHealth}
        agreeError={agreeError}
        agreeHealthError={agreeHealthError}
        onClearErrors={() => {
          setFormError("");
          setAgreeError("");
          setAgreeHealthError("");
          setHasShownEmailError(false);
          setHasShownDomainTypoError(false);
        }}
      />

      {formError && <div className={styles.error}>{formError}</div>}

      <PaymentSection
        deviceType={deviceType}
        locale={locale}
        checkoutProvider={checkoutProvider}
        offers={offers.map((o) => (
          <div key={o.key}>{o.node}</div>
        ))}
        separatorText={separatorText}
        paymentNoteHtml={paymentNoteHtml}
      />

      {/* details prop removed */}
    </div>
  );
}
