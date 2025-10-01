// pages/api/paypal/capture.js
// Captures a PayPal order (LIVE by default) and returns quiz credentials.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ ok: false, error: "Missing orderId" });

  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; // public
  const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;     // server-only
  const API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com"; // live
  const EXPECTED_AMOUNT = (process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99").toString();
  const CURRENCY = "USD";

  const genCred = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const pick = () => alphabet[Math.floor(Math.random() * alphabet.length)];
    const code = Array.from({ length: 4 }, pick).join("");
    return { username: `GL-${code}`, password: `PASS-${code}` };
  };

  const basicAuth = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    // 1) OAuth2 token
    const tokRes = await fetch(`${API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: basicAuth, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    if (!tokRes.ok) {
      return res.status(tokRes.status).json({ ok: false, error: "oauth_failed", detail: await tokRes.text() });
    }
    const { access_token } = await tokRes.json();
    const authHeaders = { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };

    // helper to validate amount/currency from an order or capture object
    const validAmount = (amt) =>
      amt && amt.value?.toString() === EXPECTED_AMOUNT && (amt.currency_code || amt.currency)?.toUpperCase() === CURRENCY;

    // 2) Try to CAPTURE
    let capJson = null;
    let capRes = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, { method: "POST", headers: authHeaders });

    if (!capRes.ok) {
      // If already captured, PayPal may return 422; fall back to GET the order
      const txt = await capRes.text();
      const already = txt.includes("ORDER_ALREADY_CAPTURED") || txt.includes("DUPLICATE_INVOICE_ID");
      if (!already) {
        // Last resort: if GET shows COMPLETED we still accept
        const ord = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}`, { headers: authHeaders });
        const ordJson = ord.ok ? await ord.json() : null;
        const pu = ordJson?.purchase_units?.[0];
        const amt = pu?.amount;
        if (ordJson?.status === "COMPLETED" && validAmount(amt)) {
          const { username, password } = genCred();
          return res.status(200).json({ ok: true, orderId, amount: amt.value, currency: amt.currency_code, username, password });
        }
        return res.status(capRes.status).json({ ok: false, error: "capture_failed", detail: txt });
      }
    } else {
      capJson = await capRes.json();
    }

    // 3) Verify amount/currency from capture payload
    const pu = capJson?.purchase_units?.[0];
    const capture = pu?.payments?.captures?.[0];
    const status = capJson?.status || capture?.status;
    const amt = capture?.amount;

    if (status !== "COMPLETED" || !validAmount(amt)) {
      return res.status(400).json({
        ok: false,
        error: "verification_failed",
        detail: { status, amount: amt?.value, currency: amt?.currency_code },
      });
    }

    // 4) Generate credentials (same style as before). Persist comes in next step.
    const { username, password } = genCred();

    return res.status(200).json({
      ok: true,
      orderId,
      amount: amt.value,
      currency: amt.currency_code,
      username,
      password,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "server_error", detail: String(e?.message || e) });
  }
}
