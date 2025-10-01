// pages/api/paypal/create.js
import { NextResponse } from 'next/server'; // harmless if unused in node env

/** ---------- PayPal config ---------- */
const RAW_ENV = (process.env.PAYPAL_ENV || '').trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === 'live' ? 'live' : 'sandbox';
const PAYPAL_API_BASE =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

/** ---------- App config ---------- */
const ENTRY_PRICE = String(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || '9.99');
const BRAND_NAME = 'GrandLucky Travel';

/** Helpers */
async function getAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET');
  }
  const creds = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const r = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`PayPal token error (${r.status}): ${txt}`);
  }
  const j = await r.json();
  return j.access_token;
}

function getBaseURL(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

/** API handler */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const baseURL = getBaseURL(req);
    const RETURN_URL = `${baseURL}/success`;
    const CANCEL_URL = `${baseURL}/checkout`;

    const accessToken = await getAccessToken();

    // Create the order with CAPTURE intent (this is the key fix)
    const createRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `ord-${Date.now()}-${Math.random().toString(36).slice(2)}`, // idempotency
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: ENTRY_PRICE,
            },
            description: 'GrandLucky quiz entry',
          },
        ],
        application_context: {
          brand_name: BRAND_NAME,
          user_action: 'PAY_NOW',
          return_url: RETURN_URL,
          cancel_url: CANCEL_URL,
        },
      }),
    });

    if (!createRes.ok) {
      const txt = await createRes.text().catch(() => '');
      return res.status(400).json({
        ok: false,
        message: 'Failed to create PayPal order',
        details: { status: createRes.status, body: txt },
      });
    }

    const order = await createRes.json();
    const orderId = order?.id || '';
    const approveURL =
      order?.links?.find((l) => l.rel === 'approve')?.href || '';

    if (!orderId || !approveURL) {
      return res.status(400).json({
        ok: false,
        message: 'Missing orderId or approve URL from PayPal',
        details: order,
      });
    }

    return res.status(200).json({
      ok: true,
      orderId,
      approveURL,
      env: PAYPAL_ENV,
      price: ENTRY_PRICE,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: 'Internal error (create)',
      details: err && err.message ? err.message : String(err),
    });
  }
}
