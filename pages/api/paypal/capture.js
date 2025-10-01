// pages/api/paypal/capture.js

import { createClient } from '@supabase/supabase-js';

/** ---------- Supabase (server) ---------- */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// (Don’t throw here; we validate again inside the handler)
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/** ---------- PayPal (server) ---------- */
const RAW_ENV = (process.env.PAYPAL_ENV || '').trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === 'live' ? 'live' : 'sandbox';
const PAYPAL_API_BASE =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

/** ---------- helpers ---------- */
async function getAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET');
  }

  const creds = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  const r = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`PayPal token error (${r.status}): ${txt}`);
  }
  const j = await r.json();
  return j.access_token;
}

function makeUsername() {
  // GL-XXXX
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

/** ---------- API handler ---------- */
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

    // 1) PayPal access token
    const accessToken = await getAccessToken();

    // 2) Verify order (PayPal may have auto-captured)
    const orderRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!orderRes.ok) {
      const txt = await orderRes.text().catch(() => '');
      return res.status(400).json({
        ok: false,
        message: 'Failed to verify PayPal order.',
        details: { status: orderRes.status, body: txt },
      });
    }

    const order = await orderRes.json();
    const orderStatus = order?.status ?? 'UNKNOWN';
    const captureStatus =
      order?.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? 'UNKNOWN';

    const paid = orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED';
    if (!paid) {
      return res.status(400).json({
        ok: false,
        message: 'Payment not completed',
        details: { orderStatus, captureStatus },
      });
    }

    // 3) Credentials
    const username = makeUsername();
    const password = makePassword();

    // 4) Store quiz result — include time_ms to satisfy NOT NULL
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([
        {
          username,
          status: 'active',
          provider: 'paypal',
          order_id: token,
          time_ms: 0, // satisfy NOT NULL time_ms
        },
      ]) // <-- fixed: only one closing ] before )
      .select('username');

    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'DB insert failed',
        details: { code: error.code, message: error.message, hint: error.hint ?? null },
      });
    }

    // 5) Return creds
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
