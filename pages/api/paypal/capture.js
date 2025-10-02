/* eslint-env node */
/* global fetch */

// pages/api/paypal/capture.js  (ES module style)
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

export default async function handler(req, res) {
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
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const token = body.token || body.orderID || body.orderId || '';
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ ok: false, message: 'Missing PayPal order token.' });
    }

    // 1) Capture (or accept already-captured)
    const accessToken = await getAccessToken();

    let paid = false;
    let captureJson = null;

    // Try to capture
    const capRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (capRes.ok) {
      captureJson = await capRes.json().catch(() => null);
      const capStatus =
        captureJson?.purchase_units?.[0]?.payments?.captures?.[0]?.status || 'UNKNOWN';
      paid = capStatus === 'COMPLETED';
    } else {
      // If capture failed, check order status anyway (already captured etc.)
      const ordRes = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}`,
        { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!ordRes.ok) {
        const txt = await ordRes.text().catch(() => '');
        return res.status(400).json({
          ok: false,
          message: 'Failed to verify/capture PayPal order.',
          details: { status: ordRes.status, body: txt },
        });
      }
      const order = await ordRes.json().catch(() => null);
      const orderStatus = order?.status || 'UNKNOWN';
      const capStatus =
        order?.purchase_units?.[0]?.payments?.captures?.[0]?.status || 'UNKNOWN';
      paid = orderStatus === 'COMPLETED' || capStatus === 'COMPLETED';
    }

    if (!paid) {
      return res.status(400).json({
        ok: false,
        message: 'Payment not completed',
      });
    }

    // 2) Create credentials
    const username = makeUsername();
    const password = makePassword();

    // 3) Insert registration row (no unique-index dependency)
    const regIns = await supabase
      .from('registrations')
      .insert([
        {
          session_id: `pp_${token}`,
          username,
          password,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (regIns.error) {
      return res.status(500).json({
        ok: false,
        message: 'Failed to write into registrations.',
        details: {
          code: regIns.error.code,
          message: regIns.error.message,
          hint: regIns.error.hint ?? null,
        },
      });
    }

    // 4) (Optional) seed quiz_results so the user exists on scoreboard
    const qrIns = await supabase
      .from('quiz_results')
      .insert([{ username, provider: 'paypal', order_id: token, correct: 0, time_ms: 0 }]);

    if (qrIns.error) {
      // Not fatal for the user, but return detail so we can see it in Success page if desired
      return res.status(200).json({
        ok: true,
        message: 'Payment captured & registration saved (seed of quiz_results failed).',
        creds: { username, password },
        warn: {
          where: 'quiz_results.insert',
          code: qrIns.error.code,
          message: qrIns.error.message,
          hint: qrIns.error.hint ?? null,
        },
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Payment captured & registration saved.',
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
