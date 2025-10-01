// pages/api/paypal/create.js
// Creates a PayPal order and returns { approveURL }.
// NOTE: We send users back to /success so the flow matches your old Stripe UX.

const RAW_ENV = (process.env.PAYPAL_ENV || "").trim().toLowerCase();
const PAYPAL_ENV = RAW_ENV === "live" ? "live" : "sandbox";
const PAYPAL_API_BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const ENTRY_PRICE = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99")
  .toFixed(2);

// IMPORTANT: point PayPal back to /success (not /thank-you)
const RETURN_URL = "https://www.grandluckytravel.com/success";
const CANCEL_URL = "https://www.grandluckytravel.com/checkout";
const BRAND_NAME = "Grandlucky Travel";

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

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const accessToken = await getAccessToken();

    const orderBody = {
      intent: "CAPTURE",
      application_context: {
        brand_name: BRAND_NAME,
        return_url: RETURN_URL, // <— lands on /success
        cancel_url: CANCEL_URL,
        user_action: "PAY_NOW",
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: ENTRY_PRICE,
          },
        },
      ],
    };

    const r = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderBody),
    });

    const json = await r.json();

    if (!r.ok) {
      return res
        .status(400)
        .json({ error: "PayPal create order failed", details: json });
    }

    const approveURL =
      json?.links?.find((l) => l.rel === "approve")?.href || null;

    if (!approveURL) {
      return res
        .status(400)
        .json({ error: "Missing approve URL from PayPal", details: json });
    }

    return res.status(200).json({
      ok: true,
      env: PAYPAL_ENV,
      orderId: json.id,
      approveURL,
      price: ENTRY_PRICE,
    });
  } catch (err) {
    console.error("[paypal/create] error:", err);
    return res.status(500).json({ error: "Internal error", details: String(err) });
  }
}
