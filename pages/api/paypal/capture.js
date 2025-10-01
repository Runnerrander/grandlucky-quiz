// pages/api/paypal/capture.js
import { createClient } from '@supabase/supabase-js';

/* -------- Supabase (server) -------- */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/* -------- PayPal (server) -------- */
const RAW_ENV = (process.env.PAYPAL_ENV || '').trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === 'live' ? 'live' : 'sandbox';
const PAYPAL_API_BASE =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

/* -------- helpers -------- */
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

function makeUsername() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `GL-${s}`;
}
function makePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

/* -------- API handler -------- */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !supabase) {
    return res.status(500).json({
      ok: false,
      message: 'Server misconfigured: missing Supabase credentials.',
    });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const token = body.token || body.orderID || body.orderId || '';

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ ok: false, message: 'Missing PayPal order token.' });
    }

    // 1) Access token
    const accessToken = await getAccessToken();

    // 2) Get the order
    let orderRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}`,
      { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!orderRes.ok) {
      const txt = await orderRes.text().catch(() => '');
      return res.status(400).json({
        ok: false,
        message: 'Failed to verify PayPal order.',
        details: { status: orderRes.status, body: txt },
      });
    }
    let order = await orderRes.json();
    let orderStatus = order?.status ?? 'UNKNOWN';
    let captureStatus =
      order?.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? 'UNKNOWN';

    // 3) If only APPROVED, perform the capture now
    if (orderStatus === 'APPROVED') {
      const capRes = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
        }
      );

      if (!capRes.ok && capRes.status !== 201 && capRes.status !== 200) {
        const txt = await capRes.text().catch(() => '');
        return res.status(400).json({
          ok: false,
          message: 'PayPal capture failed',
          details: { status: capRes.status, body: txt },
        });
      }

      order = await capRes.json();
      orderStatus = order?.status ?? orderStatus;
      captureStatus =
        order?.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? captureStatus;
    }

    const paid = orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED';
    if (!paid) {
      return res.status(400).json({
        ok: false,
        message: 'Payment not completed',
        details: { orderStatus, captureStatus },
      });
    }

    // 4) Create credentials and store result
    const username = makeUsername();
    const password = makePassword();

    const { error } = await supabase
      .from('quiz_results')
      .insert([
        {
          username,
          status: 'active',
          provider: 'paypal',
          order_id: token,
          time_ms: 0, // satisfy NOT NULL
        },
      ])
      .select('username');

    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'DB insert failed',
        details: { code: error.code, message: error.message, hint: error.hint ?? null },
      });
    }

    // 5) Respond with credentials
    return res.status(200).json({
      ok: true,
      message: 'Payment captured & row stored.',
      creds: { username, password },
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: 'Internal error',
      details: String(err && err.message ? err.message : err),
    });
  }
}
