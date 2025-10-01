// pages/api/paypal/capture.js

import { createClient } from '@supabase/supabase-js';

/** ---------- Supabase (server) ---------- */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

async function getOrder(orderId, accessToken) {
  const r = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Failed to get order (${r.status}): ${txt}`);
  }
  return r.json();
}

async function captureOrderIfNeeded(orderId, accessToken) {
  // 1) Check current status
  let order = await getOrder(orderId, accessToken);
  let orderStatus = order?.status ?? 'UNKNOWN';
  let captureStatus =
    order?.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? 'UNKNOWN';

  const paid =
    orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED';
  if (paid) {
    return { paid: true, orderStatus, captureStatus };
  }

  // 2) Not paid -> actively capture when APPROVED
  if (orderStatus === 'APPROVED') {
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          // Idempotency so a double click doesn't double-capture
          'PayPal-Request-Id': `cap-${orderId}`,
        },
      }
    );

    // Some gateways return 201/200 on success, 422 if already captured.
    if (!captureRes.ok && captureRes.status !== 422) {
      const txt = await captureRes.text().catch(() => '');
      throw new Error(`Capture failed (${captureRes.status}): ${txt}`);
    }

    // 3) Re-check order after capture (or 422 already-captured)
    order = await getOrder(orderId, accessToken);
    orderStatus = order?.status ?? 'UNKNOWN';
    captureStatus =
      order?.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? 'UNKNOWN';

    const nowPaid =
      orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED';
    return { paid: nowPaid, orderStatus, captureStatus };
  }

  // If not APPROVED, still not paid
  return { paid: false, orderStatus, captureStatus };
}

/** ---------- API handler ---------- */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res
      .status(405)
      .json({ ok: false, message: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      ok: false,
      message:
        'Server misconfigured: missing Supabase credentials.',
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {};
    const token = body.token || body.orderID || body.orderId || '';

    if (!token || typeof token !== 'string') {
      return res
        .status(400)
        .json({ ok: false, message: 'Missing PayPal order token.' });
    }

    const accessToken = await getAccessToken();

    // Capture if only APPROVED
    const { paid, orderStatus, captureStatus } =
      await captureOrderIfNeeded(token, accessToken);

    if (!paid) {
      return res.status(400).json({
        ok: false,
        message: 'Payment not completed',
        details: { orderStatus, captureStatus },
      });
    }

    // Generate credentials
    const username = makeUsername();
    const password = makePassword();

    // Store quiz result (include NOT NULL columns)
    const { error } = await supabase
      .from('quiz_results')
      .insert([
        {
          username,
          status: 'active',
          provider: 'paypal',
          order_id: token,
          correct: 0,
          time_ms: 0,
        },
      ])
      .select('id')
      .single();

    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'DB insert failed',
        details: { code: error.code, message: error.message, hint: error.hint ?? null },
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Payment captured & row stored.',
      creds: { username, password },
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: 'Internal error',
      details:
        err && err.message ? err.message : String(err),
    });
  }
}
