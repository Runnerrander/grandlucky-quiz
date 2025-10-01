// pages/api/paypal/debug.js
export default async function handler(req, res) {
  const {
    PAYPAL_ENV,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    NEXT_PUBLIC_ENTRY_PRICE_USD,
  } = process.env;

  const isLive = PAYPAL_ENV === "live";
  const base = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    // get token
    const basicAuth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");

    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return res.status(200).json({
        ok: false,
        stage: "token",
        message:
          "PayPal token failed. Wrong ENV or invalid client credentials.",
        details: { PAYPAL_ENV, status: tokenRes.status, body },
      });
    }

    const { access_token } = await tokenRes.json();

    // create one test order
    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99",
            },
          },
        ],
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      return res.status(200).json({
        ok: false,
        stage: "order",
        message: "Failed to create PayPal order.",
        details: { status: orderRes.status, orderData },
      });
    }

    return res.status(200).json({
      ok: true,
      stage: "done",
      message: "ENV + credentials look good.",
      details: {
        RAW_ENV: PAYPAL_ENV,
        price: NEXT_PUBLIC_ENTRY_PRICE_USD,
        orderId: orderData.id,
        approveURL: orderData.links?.find((l) => l.rel === "approve")?.href,
      },
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      stage: "catch",
      message: err.message,
    });
  }
}
