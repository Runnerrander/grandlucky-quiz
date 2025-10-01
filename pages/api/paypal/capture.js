// /pages/api/paypal/capture.js
// Captures a PayPal order and returns { username, password } after saving to Supabase.

import { createClient } from "@supabase/supabase-js";

const RAW_ENV = (process.env.PAYPAL_ENV || "").trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === "live" ? "live" : "sandbox";
const PAYPAL_API_BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Supabase (service role for inserts)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!client || !secret) throw new Error("Missing PAYPAL_CLIENT_ID/SECRET");

  const creds = Buffer.from(`${client}:${secret}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  const r = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`PayPal token error ${r.status}: ${text}`);
  return JSON.parse(text).access_token;
}

function randChars(len) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
function makeUsername() {
  return `GL-${randChars(6)}`;
}
function makePassword() {
  return randChars(10);
}

async function insertRowUnique({ username, password, orderId }) {
  if (!supabase) throw new Error("Supabase not configured on server");
  // try up to 5 different usernames if UNIQUE(username) collides
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        username,
        password,
        status: "active",
        provider: "paypal",
        paypal_order_id: orderId,
        created_at: new Date().toISOString(),
      })
      .select("username,password")
      .single();

    if (!error && data) return data;

    const isUnique =
      (error?.code && error.code === "23505") ||
      (error?.message && /duplicate key value/i.test(error.message));
    if (isUnique) {
      username = makeUsername(); // try a new one
      continue;
    }
    throw new Error(`Insert failed: ${error?.message || String(error)}`);
  }
  throw new Error("Could not generate a unique username after several attempts.");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // PayPal returns token in the query on return_url (?token=XXX)
    const token =
      (req.method === "GET" ? req.query.token : req.body?.token) ||
      req.query?.orderID ||
      req.body?.orderID;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Missing PayPal order token" });
    }

    // if we've already saved this token, return existing creds (idempotent)
    if (supabase) {
      const { data } = await supabase
        .from("quiz_results")
        .select("username,password,paypal_order_id")
        .eq("paypal_order_id", token)
        .maybeSingle();
      if (data?.username && data?.password) {
        return res.status(200).json({ username: data.username, password: data.password });
      }
    }

    const accessToken = await getAccessToken();

    // capture
    const r = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: "{}", // must be a non-empty body for some accounts
    });

    const json = await r.json();
    if (!r.ok) {
      return res.status(400).json({ error: "PayPal capture failed", details: { status: r.status, json } });
    }

    const orderStatus = json.status || "UNKNOWN";
    const captureStatus = json?.purchase_units?.[0]?.payments?.captures?.[0]?.status || "UNKNOWN";
    const completed = orderStatus === "COMPLETED" || captureStatus === "COMPLETED";
    if (!completed) {
      return res.status(402).json({ error: "Payment not completed", details: { orderStatus, captureStatus } });
    }

    // create credentials + insert
    let username = makeUsername();
    const password = makePassword();
    const saved = await insertRowUnique({ username, password, orderId: token });

    return res.status(200).json({ username: saved.username, password: saved.password });
  } catch (err) {
    console.error("[paypal/capture] error:", err);
    return res.status(500).json({ error: "Internal error", details: String(err) });
  }
}
