// pages/api/paypal/capture.js
import { createClient } from '@supabase/supabase-js';

const RAW_ENV = (process.env.PAYPAL_ENV || '').trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === 'live' ? 'live' : 'sandbox';
const PAYPAL_API_BASE =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supaAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase env (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

function makeUsername() {
  // “GL-” + 4 random alphanumerics (bigger space to avoid duplicates)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `GL-${s}`;
}

function makePassword() {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^*';
  let s = '';
  for (let i = 0; i < 10; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

async function getAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET');

  const creds = Buffer.from(`${id}:${secret}`).toString('base64');
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
    const text = await r.text().catch(() => '');
    throw new Error(`PayPal token failed (${r.status}): ${text}`);
  }
  const data = await r.json();
  return data.access_token;
}

export default async function handler(req, res) {
  try {
    // Get token (order id) from query or body
    const token =
      (req.query && (req.query.token || req.query.orderID)) ||
      (req.body &&
        (typeof req.body === 'string'
          ? (() => {
              try {
                return JSON.parse(req.body).token;
              } catch {
                return undefined;
              }
            })()
          : req.body.token));

    if (!token) {
      return res.status(400).json({
        ok: false,
        message: 'Missing PayPal token.',
        details: { env: { RAW_ENV, PAYPAL_ENV } },
      });
    }

    // Capture the order with PayPal
    const bearer = await getAccessToken();

    const capRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearer}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        // no body
      }
    );

    const capJson = await capRes.json().catch(() => ({}));

    if (!capRes.ok) {
      return res.status(200).json({
        ok: false,
        message: 'PayPal capture failed.',
        details: { status: capRes.status, body: capJson, env: { RAW_ENV, PAYPAL_ENV } },
      });
    }

    // Verify completed
    const pu = capJson?.purchase_units?.[0];
    const capture = pu?.payments?.captures?.[0];
    const orderStatus = capJson?.status || 'UNKNOWN';
    const captureStatus = capture?.status || 'UNKNOWN';

    if (!(orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED')) {
      return res.status(200).json({
        ok: false,
        message: 'Payment not completed.',
        details: { orderStatus, captureStatus },
      });
    }

    // Generate creds and insert into DB
    const supa = supaAdmin();
    const password = makePassword();

    // Try a few times to avoid unique-username clashes
    let username = null;
    let lastErr = null;

    for (let i = 0; i < 5; i++) {
      const candidate = makeUsername();

      const { error } = await supa
        .from('quiz_results')
        .insert({
          username: candidate,
          password,
          status: 'active',
          provider: 'paypal',
          // IMPORTANT: use 'order_id' (your column), not 'paypal_order_id'
          order_id: String(token),
        });

      if (!error) {
        username = candidate;
        break;
      }

      // 23505 = unique violation
      if (error.code === '23505') {
        lastErr = error;
        continue; // retry with a new username
      }

      // Any other DB error -> stop
      return res.status(200).json({
        ok: false,
        message: 'DB insert failed',
        details: error,
      });
    }

    if (!username) {
      return res.status(200).json({
        ok: false,
        message: 'DB insert failed (could not get a unique username).',
        details: lastErr || null,
      });
    }

    // Success – return credentials
    return res.status(200).json({
      ok: true,
      username,
      password,
      provider: 'paypal',
    });
  } catch (err) {
    console.error('[paypal/capture] error:', err);
    return res.status(200).json({
      ok: false,
      message: 'Internal error',
      details: String(err),
    });
  }
}
