// pages/api/paypal/capture.js
//
// One-file drop-in:
// - Captures a PayPal order (sandbox or live, based on env)
// - Mints GL-XXXX / PASS-XXXX credentials
// - Retries on UNIQUE-constraint collision so no duplicate usernames
// - Returns { ok, order_id, amount, username, password }
//
// Requirements:
//   env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//        PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
//        PAYPAL_ENV   -> "live" or "sandbox"  (defaults to "sandbox")
// Optional:
//        NEXT_PUBLIC_ENTRY_PRICE_USD  (for sanity-check)

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// ---------- Config ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PAYPAL_ENV = (process.env.PAYPAL_ENV || "sandbox").toLowerCase(); // "live" | "sandbox"
const PAYPAL_BASE =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const ENTRY_PRICE = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99"); // sanity cap

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  // Fail fast at build/runtime misconfig, clear error in logs
  console.error("Missing Supabase env (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
}
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error("Missing PayPal env (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET).");
}

// ---------- Supabase (service role for server-side insert) ----------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ---------- Helpers ----------
function genCode(n = 4) {
  // Avoid ambiguous chars to keep codes readable in screenshots/photos
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(n);
  let s = "";
  for (let i = 0; i < n; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

/**
 * Insert a row with unique credentials, retrying on username collision.
 * Relies on a UNIQUE constraint:  ALTER TABLE public.quiz_results
 *   ADD CONSTRAINT quiz_results_username_key UNIQUE (username);
 */
async function mintUniqueCredentials(extraCols = {}, maxTries = 8) {
  let lastErr;
  for (let t = 0; t < maxTries; t++) {
    const suffix = genCode(4);
    const username = `GL-${suffix}`;
    const password = `PASS-${suffix}`;

    const { data, error } = await supabase
      .from("quiz_results")
      .insert([
        {
          status: "active",
          username,
          password,
          // keep room for caller-provided columns (like provider/order)
          ...extraCols,
        },
      ])
      .select("id, username, password")
      .single();

    if (!error) return data;

    // Unique violation: Postgres code 23505 or generic wording
    if (error.code === "23505" || /duplicate key|unique constraint/i.test(error.message || "")) {
      lastErr = error;
      continue; // try again with a new suffix
    }

    // Any other DB error: bail
    throw error;
  }
  throw lastErr || new Error("Could not mint a unique username after several attempts.");
}

async function getPayPalAccessToken() {
  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`PayPal OAuth failed: ${resp.status} ${txt}`);
  }
  const json = await resp.json();
  return json.access_token;
}

async function capturePayPalOrder(orderID, accessToken) {
  const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(`Capture failed: ${resp.status} ${JSON.stringify(json)}`);
  }
  return json;
}

function extractAmountFromCapture(captureJSON) {
  try {
    // Standard location for the first capture amount
    const cap = captureJSON?.purchase_units?.[0]?.payments?.captures?.[0];
    const valueStr = cap?.amount?.value;
    return Number(valueStr || "0");
  } catch {
    return 0;
  }
}

// ---------- API Handler ----------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { orderID } = req.body || {};
    if (!orderID || typeof orderID !== "string") {
      return res.status(400).json({ ok: false, error: "Missing orderID" });
    }

    // 1) OAuth
    const token = await getPayPalAccessToken();

    // 2) Capture
    const capture = await capturePayPalOrder(orderID, token);

    // Basic status guard
    const orderStatus = capture?.status || "";
    if (!/COMPLETED/i.test(orderStatus)) {
      return res.status(400).json({
        ok: false,
        error: `Order not completed (status: ${orderStatus})`,
        raw: capture,
      });
    }

    // 3) Amount sanity
    const amount = extractAmountFromCapture(capture);
    if (Number.isNaN(amount) || amount <= 0 || amount > Math.max(ENTRY_PRICE, 1000)) {
      return res.status(400).json({
        ok: false,
        error: `Suspicious amount: ${amount}`,
      });
    }

    // 4) Insert + retry on collision (NO duplicate usernames)
    const creds = await mintUniqueCredentials({
      provider: "paypal",
      order_id: orderID, // safe even if this column doesn't exist (Supabase ignores extra keys without column)
      amount_usd: amount, // optional if your table has it; harmless otherwise
    });

    // 5) Respond with credentials (frontend will show + “Start Quiz”)
    return res.status(200).json({
      ok: true,
      provider: "paypal",
      order_id: orderID,
      amount,
      username: creds.username,
      password: creds.password,
    });
  } catch (err) {
    console.error("paypal/capture error:", err);
    return res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
}
