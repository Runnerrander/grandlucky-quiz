/* eslint-env node */
/* global fetch */

// pages/api/paypal/capture.js  (captures the order, then stores rows)
const { createClient } = require('@supabase/supabase-js');

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

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }
  if (!supabase) {
    return res.status(500).json({
      ok: false,
      message: 'Server misconfigured: missing Supabase credentials.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const token = body.token || body.orderID || body.orderId || '';
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ ok: false, message: 'Missing PayPal order token.' });
    }

    // 1) Get access token
    const accessToken = await getAccessToken();

    // 2) CAPTURE the order (this is the missing piece)
    const capRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({}),
      }
    );

    // If order already captured, PayPal may return 201/200; for conflicts it may still include status
    const capText = await capRes.text().catch(() => '');
    let capJson = {};
    try { capJson = capText ? JSON.parse(capText) : {}; } catch (_e) {}

    const orderStatus = capJson?.status ?? 'UNKNOWN';
    const captureStatus =
      capJson?.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? 'UNKNOWN';

    const paid =
      orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED';

    if (!paid) {
      return res.status(400).json({
        ok: false,
        message: 'Payment not completed',
        details: { orderStatus, captureStatus, raw: capJson },
      });
    }

    // 3) Generate creds
    const username = makeUsername();
    const password = makePassword();

    // 4) registrations
    const { error: regErr } = await supabase
      .from('registrations')
      .insert([{
        session_id: `pp_${token}`,
        password,
        created_at: new Date().toISOString(),
        status: 'active',
        username,
      }]);
    if (regErr) {
      return res.status(500).json({
        ok: false,
        message: 'DB insert into registrations failed',
        details: { code: regErr.code, message: regErr.message, hint: regErr.hint ?? null },
      });
    }

    // 5) quiz_results
    const { error: qrErr } = await supabase
      .from('quiz_results')
      .insert([{
        username,
        provider: 'paypal',
        order_id: token,
        correct: 0,
        time_ms: 0,
      }]);
    if (qrErr) {
      return res.status(500).json({
        ok: false,
        message: 'DB insert into quiz_results failed',
        details: { code: qrErr.code, message: qrErr.message, hint: qrErr.hint ?? null },
      });
    }

    // 6) Done
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

module.exports = handler;
module.exports.default = handler;
