// pages/api/paypal/capture.js
//
// Captures a PayPal order and, on success, creates credentials in `quiz_results`
// with { username, password, status: "active", provider: "paypal" }.
// Returns { ok: true, username, password } to the client.
//
// Assumes these env vars exist on Vercel:
//   PAYPAL_ENV=live|sandbox
//   PAYPAL_CLIENT_ID=...
//   PAYPAL_CLIENT_SECRET=...
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (or SUPABASE_SERVICE_ROLE)
//
// Notes:
// - Tolerates real-world PayPal responses: success if order.status === "COMPLETED"
//   OR any capture has status COMPLETED/PENDING.
// - If capture API returns a non-2xx (e.g., already captured), we still fetch
//   the order and decide from its final state.
// - Uses upsert on unique(username) to avoid duplicate rows.

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const token = req.body?.token || req.query?.token || "";
    if (!token) {
      return res.status(400).json({ ok: false, message: "Missing PayPal token" });
    }

    // ---- PayPal base + credentials -------------------------------------------------
    const RAW_ENV = (process.env.RAW_ENV || "").trim().toLowerCase();
    const PAYPAL_ENV = (process.env.PAYPAL_ENV || RAW_ENV || "live")
      .trim()
      .toLowerCase();
    const PAYPAL_API_BASE =
      PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({
        ok: false,
        message: "Server misconfigured (PayPal credentials missing)",
      });
    }

    // ---- OAuth: client_credentials -------------------------------------------------
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokJson = await safeJson(tokRes);
    if (!tokRes.ok) {
      return res.status(401).json({
        ok: false,
        stage: "oauth",
        message: "Failed to get PayPal access token",
        details: scrub(tokJson),
      });
    }
    const accessToken = tokJson?.access_token;

    // ---- Attempt capture -----------------------------------------------------------
    // Even if this returns non-2xx (e.g., already captured), we will still GET the
    // order details and decide based on final state.
    const capRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const capJson = await safeJson(capRes);

    // ---- Always fetch the order to see its final state ----------------------------
    const ordRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(token)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const ordJson = await safeJson(ordRes);

    // ---- Decide success ------------------------------------------------------------
    const orderStatus = ordJson?.status || capJson?.status || "UNKNOWN";
    const captures = ((ordJson?.purchase_units || []).flatMap(
      (u) => u?.payments?.captures || []
    )).filter(Boolean);
    const captureStatuses = captures
      .map((c) => c?.status)
      .filter((s) => typeof s === "string");

    const success =
      orderStatus === "COMPLETED" ||
      captureStatuses.includes("COMPLETED") ||
      captureStatuses.includes("PENDING"); // some live flows briefly return PENDING

    if (!success) {
      return res.status(402).json({
        ok: false,
        message: "PayPal capture not completed",
        details: {
          PAYPAL_ENV,
          http_capture: capRes.status,
          orderStatus,
          captureStatuses,
          capJson: scrub(capJson),
          ordJson: scrub(ordJson),
        },
      });
    }

    // ---- Supabase: save credentials -----------------------------------------------
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRole =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      "";
    if (!supabaseUrl || !serviceRole) {
      return res.status(500).json({
        ok: false,
        message: "Server misconfigured (Supabase env missing)",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const username = await makeUniqueUsername(supabase);
    const password = makePassword();

    // Insert (or upsert) row; table has UNIQUE(username)
    const payload = {
      username,
      password,
      status: "active",
      provider: "paypal",
      paypal_order_id: token,
    };

    const { data: saved, error: insErr } = await supabase
      .from("quiz_results")
      .upsert(payload, { onConflict: "username" })
      .select()
      .limit(1);

    if (insErr) {
      return res.status(500).json({
        ok: false,
        message: "DB insert failed",
        details: { code: insErr.code, message: insErr.message },
      });
    }

    return res.status(200).json({
      ok: true,
      username,
      password,
    });
  } catch (err) {
    console.error("[paypal/capture] fatal", err);
    return res.status(500).json({
      ok: false,
      message: "Internal error",
      details: String(err?.message || err),
    });
  }
}

// ---------- helpers ---------------------------------------------------------------

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { _raw: text };
  }
}

function scrub(obj) {
  // Remove noisy payloads from logs / responses
  try {
    const clone = JSON.parse(JSON.stringify(obj || {}));
    if (clone?.links) delete clone.links;
    return clone;
  } catch {
    return {};
  }
}

function makePassword() {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 10; i++) p += alpha[Math.floor(Math.random() * alpha.length)];
  return p;
}

async function makeUniqueUsername(supabase) {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let t = 0; t < 6; t++) {
    let u = "GL";
    for (let i = 0; i < 6; i++) u += alpha[Math.floor(Math.random() * alpha.length)];
    const { data, error } = await supabase
      .from("quiz_results")
      .select("id")
      .eq("username", u)
      .limit(1);
    if (!error && (!data || data.length === 0)) return u;
  }
  return "GL" + Date.now().toString().slice(-6);
}
