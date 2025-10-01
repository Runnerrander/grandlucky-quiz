// /pages/api/paypal/debug.js
// Safe live check: tries to get a PayPal token and create a live order.
// Open in browser after deploy: https://www.grandluckytravel.com/api/paypal/debug
// It prints exactly what's failing (token vs order), without leaking secrets.

const PAYPAL_ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export default async function handler(req, res) {
  try {
    const id = process.env.PAYPAL_CLIENT_ID || "";
    const secret = process.env.PAYPAL_CLIENT_SECRET || "";
    const priceStr = (process.env.NEXT_PUBLIC_ENTRY_PRICE_USD ?? "9.99") + "";

    if (!id || !secret) {
      return res.status(200).json({
        ok: false,
        stage: "env",
        message:
          "Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in Vercel env. Set LIVE keys.",
        details: { PAYPAL_ENV, price: priceStr },
      });
    }

    // 1) Token
    const creds = Buffer.from(`${id}:${secret}`).toString("base64");
    const form = new URLSearchParams({ grant_type: "client_credentials" });

    const tokenResp = await fetch(`${BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });

    const tokenText = await tokenResp.text();
    if (!tokenResp.ok) {
      return res.status(200).json({
        ok: false,
        stage: "token",
        message:
          "PayPal LIVE token failed. This usually means WRONG ENV (live vs sandbox) or invalid/locked live credentials.",
        details: {
          PAYPAL_ENV,
          status: tokenResp.status,
          body: safeJson(tokenText),
        },
      });
    }
    const token = JSON.parse(tokenText).access_token;

    // 2) Create order @ your price
    const value = normalizePrice(priceStr);
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value } }],
      application_context: {
        brand_name: "GrandLucky Travel",
        user_action: "PAY_NOW",
        return_url: "https://www.grandluckytravel.com/thank-you",
        cancel_url: "https://www.grandluckytravel.com/checkout",
      },
    };

    const orderResp = await fetch(`${BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderPayload),
    });

    const orderText = await orderResp.text();
    if (!orderResp.ok) {
      return res.status(200).json({
        ok: false,
        stage: "order",
        message:
          "PayPal LIVE order creation failed. Often caused by live account not fully enabled/approved.",
        details: {
          PAYPAL_ENV,
          status: orderResp.status,
          body: safeJson(orderText),
        },
      });
    }

    const orderJson = safeJson(orderText);
    const approveURL =
      (orderJson.links || []).find((l) => l.rel === "approve")?.href || null;

    if (!approveURL) {
      return res.status(200).json({
        ok: false,
        stage: "approve",
        message: "LIVE order created but no approve link returned.",
        details: { PAYPAL_ENV, orderId: orderJson.id, links: orderJson.links },
      });
    }

    return res.status(200).json({
      ok: true,
      stage: "done",
      message: "LIVE is working. You can be redirected to PayPal.",
      details: {
        PAYPAL_ENV,
        price: value,
        orderId: orderJson.id,
        approveURL,
      },
    });
  } catch (e) {
    return res.status(200).json({
      ok: false,
      stage: "unexpected",
      message: "Unexpected server error.",
      details: String(e),
    });
  }
}

function normalizePrice(p) {
  const n = Number(p);
  if (!isFinite(n) || n <= 0) return "9.99";
  return n.toFixed(2);
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
