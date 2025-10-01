// /pages/api/paypal/create.js
// Returns { id, approveURL } for redirect to PayPal.

const RAW_ENV = (process.env.PAYPAL_ENV || "").trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === "live" ? "live" : "sandbox";
const PAYPAL_API_BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const BRAND_NAME = "GrandLucky Travel";
const RETURN_URL = "https://www.grandluckytravel.com/thank-you";
const CANCEL_URL = "https://www.grandluckytravel.com/checkout";

function priceFromEnv() {
  const raw = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD ?? "9.99");
  return isFinite(raw) && raw > 0 ? raw.toFixed(2) : "9.99";
}

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
  if (!r.ok) {
    throw new Error(`PayPal token error ${r.status}: ${text}`);
  }
  return JSON.parse(text).access_token;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const value = priceFromEnv();
    const token = await getAccessToken();

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value } }],
      application_context: {
        brand_name: BRAND_NAME,
        user_action: "PAY_NOW",
        return_url: RETURN_URL,
        cancel_url: CANCEL_URL,
      },
    };

    const r = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(400).json({
        error: "PayPal create order failed",
        details: { status: r.status, data, env: { RAW_ENV, PAYPAL_ENV } },
      });
    }

    const approveURL = (data.links || []).find((l) => l.rel === "approve")?.href;
    if (!approveURL) {
      return res.status(400).json({
        error: "Missing approve URL from PayPal response",
        details: { data, env: { RAW_ENV, PAYPAL_ENV } },
      });
    }

    return res
      .status(200)
      .json({ id: data.id, approveURL, env: { RAW_ENV, PAYPAL_ENV } });
  } catch (err) {
    console.error("[paypal/create] error:", err);
    return res.status(500).json({
      error: "Internal error",
      details: String(err),
      env: { RAW_ENV, PAYPAL_ENV },
    });
  }
}
