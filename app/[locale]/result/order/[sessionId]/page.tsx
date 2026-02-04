"use client";
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { sendGTMEvent } from '@next/third-parties/google';
import { useTranslations, useLocale } from 'next-intl';
import { trackPurchase } from '@/lib/analytics';

const ZamowieniePageContent = () => {
  const t = useTranslations('OrderPage');
  const params = useParams();
  const sessionId = params?.sessionId;
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) return;

    let attempts = 0;
    const maxAttempts = 10; // Poll up to 30 times (2 minutes total)
    const pollInterval = 4000; // 4 seconds between polls (max wait = (maxAttempts-1)*interval = 20s)
    let timeoutId: NodeJS.Timeout;

    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/data/status?sessionId=${sessionId}`);
        const data = await response.json();
        if (data.success) {
          setStatus('success');
          return;
        }
        // Payment not yet confirmed by P24 webhook, retry
        attempts++;
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(fetchPaymentStatus, pollInterval);
        } else {
          // Max attempts reached, show pending screen (not error)
          setStatus('pending');
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(fetchPaymentStatus, pollInterval);
        } else {
          setStatus('pending');
        }
      }
    };

    fetchPaymentStatus();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionId]);

  const [purchaseEventsSent, setPurchaseEventsSent] = useState(false);

  const hashSHA256 = async (str: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Immediately send purchase events on component mount - independent of status polling
  useEffect(() => {
    if (!sessionId || purchaseEventsSent) return;

    const sendPurchaseEvents = async (retries = 3) => {
      try {
        const response = await fetch(`/api/getPurchaseData?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching purchase data:', data.error);
          if (retries > 0) {
            setTimeout(() => sendPurchaseEvents(retries - 1), 2000);
          }
          return;
        }

        const sha256_email = await hashSHA256(data.email || '');
        const sha256_name = await hashSHA256(data.name || '');
        const purchaseValue = Number(data.amount);

        // Send GTM purchase event
        try {
          sendGTMEvent({
            event: 'purchase',
            ecommerce: {
              currency: data.currency,
              value: data.amount,
              items: [
                {
                  item_id: data.item_id,
                  item_name: data.item_name,
                  price: data.price,
                  quantity: 1,
                },
              ],
            },
            user_data: {
              sha256_email_address: sha256_email,
              sha256_first_name: sha256_name,
              session_id: sessionId,
            },
          });
          console.log('GTM purchase event sent successfully');
        } catch (gtmError) {
          console.error('Failed to send GTM purchase event:', gtmError);
        }

        // Send Facebook Pixel purchase event
        try {
          await trackPurchase({
            currency: data.currency,
            value: Number.isFinite(purchaseValue) ? purchaseValue : data.amount,
            content_type: 'product',
            contents: [
              {
                id: data.item_id,
                quantity: 1,
                item_price: data.price,
              },
            ],
          });
          console.log('Facebook Pixel purchase event sent successfully');
        } catch (pixelError) {
          console.error('Failed to send Facebook Pixel purchase event:', pixelError);
        }

        setPurchaseEventsSent(true);
      } catch (error) {
        console.error('Failed to fetch purchase data:', error);
        if (retries > 0) {
          setTimeout(() => sendPurchaseEvents(retries - 1), 2000);
        }
      }
    };

    sendPurchaseEvents();
  }, [sessionId, purchaseEventsSent]);

  const locale = useLocale();

  const assets = {
    logoHref: 'https://musclepals.com',
    logoSrc: `/${locale}/../vectors/logo.svg`,
    logoHeight: 50,
    backButtonImage: `/btns/${locale}/back-to-home-btn.svg`,
    heroSuccessSrc: `/${locale}/sample-guy.svg`
  };

  if (status === 'loading' || status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '0 24px' }}>
        <div style={{ marginBottom: 32, marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Image src={assets.logoSrc} alt={t('logoAlt')} width={220} height={assets.logoHeight} style={{ width: 'auto', height: assets.logoHeight, maxWidth: '100%' }} />
        </div>
        <div style={{ marginTop: 48, marginBottom: 32, fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif", fontSize: 22, fontWeight: 700, color: '#111', textAlign: 'center' }}>
          {status === 'loading' ? t('verifyingText') : t('processingText')}
        </div>
        {status === 'loading' && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" stroke="#111" strokeWidth="4" fill="none" strokeDasharray="38 38" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="30" r="10" fill="#fff" stroke="#111" strokeWidth="2" />
            </svg>
          </div>
        )}
        {status === 'pending' && (
          <>
            <div style={{ marginTop: 24, fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif", fontSize: 16, color: '#111', textAlign: 'center', maxWidth: 340 }}>
              <span
                dangerouslySetInnerHTML={{
                  __html: t.raw('pendingHtml')
                }}
              />
            </div>
            <div style={{ marginTop: 18, fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif", fontSize: 15, color: '#111', textAlign: 'center', maxWidth: 340 }}>
              {t('contactText')} <a href={`mailto:${t('successEmail')}`} style={{ color: '#111', textDecoration: 'underline' }}>{t('successEmail')}</a>
            </div>
          </>
        )}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif", padding: '0 24px' }}>
        <div style={{ maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', padding: 0, boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ marginBottom: 32, marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Image src={assets.logoSrc} alt={t('logoAlt')} width={220} height={assets.logoHeight} style={{ width: 'auto', height: assets.logoHeight, maxWidth: '100%' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, margin: '16px 0 0 0', color: '#111', lineHeight: 1.18 }}>
            <span dangerouslySetInnerHTML={{ __html: t.raw('successTitle') }} />
          </div>
          <div style={{ margin: '18px 0 0 0', display: 'flex', justifyContent: 'center' }}>
            <Image src={assets.heroSuccessSrc} alt={t('successImageAlt')} width={180} height={140} style={{ width: 400, height: 'auto' }} />
          </div>
          <div style={{ margin: '18px 0 0 0', fontSize: 18, color: '#111' }}>
            {t('successText1')}<br />{t('successText2')}
          </div>
          <div style={{ margin: '18px 0 0 0', fontSize: 15, color: '#111', textAlign: 'center', fontWeight: 400 }}>
            <b>{t('successText3')}</b><br />
            {t('successText4')}<br />
            <a href={`mailto:${t('successEmail')}`} style={{ color: '#111', textDecoration: 'underline' }}>{t('successEmail')}</a>
          </div>
          <div style={{ margin: '18px 0 0 0', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 260,
                margin: '0 auto',
              }}
            >
              <Image src={assets.backButtonImage} alt={t('buttonText')} width={181} height={33} style={{ width: '100%', height: 'auto', maxWidth: 260 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This should never be reached since we only have loading, pending, and success states
  return null;
};

const ZamowieniePage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ZamowieniePageContent />
  </Suspense>
);

export default ZamowieniePage;