// lib/n8n.ts
import crypto from 'crypto';

type N8nEvent =
  | 'checkout.succeeded';

const sendToN8n = async <T extends Record<string, unknown>>(url: string, event: N8nEvent, data: T) => {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const payload = { event, ...data };
  const body = JSON.stringify(payload);

  let signature = '';
  if (secret) {
    signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  } else {
    console.warn('N8N_WEBHOOK_SECRET is not set, webhook will not be signed.');
  }

  // krótkie połączenie: nie blokujemy głównej ścieżki
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);

  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };

    if (signature) {
      headers['x-n8n-signature'] = signature;
    }

    await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    }).catch((err) => {
      console.error('N8n fetch error:', err);
      /* nie przerywaj flow jeśli n8n chwilowo nie odpowie */
    });
  } finally {
    clearTimeout(timer);
  }
}

export { sendToN8n };
