// pages/api/paypal/create.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
    const base = env === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "Missing PayPal credentials." });
    }

    // 1) OAuth token
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokResp = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tok = await tokResp.json();
    if (!tokResp.ok) {
      return res.status(400).json({ error: tok });
    }

    // 2) Create order
    const amount = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99")
      .toFixed(2);

    const proto =
      req.headers["x-forwarded-proto"] ||
      (req.headers.host?.includes("localhost") ? "http" : "https");
    const host = `${proto}://${req.headers.host}`;

    const { locale } = (await readBody(req)) || {};
    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: amount },
          // Shows on some statements when possible (cards):
          soft_descriptor: "GrandLucky Entry",
          custom_id: "entry",
        },
      ],
      application_context: {
        brand_name: "GrandLucky Travel",
        user_action: "PAY_NOW",
        return_url: `${host}/thank-you?provider=paypal`,
        cancel_url: `${host}/checkout`,
        locale: locale === "hu" ? "hu_HU" : "en_US",
      },
    };

    const orderResp = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tok.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderBody),
    });
    const order = await orderResp.json();
    if (!orderResp.ok) {
      return res.status(400).json({ error: order });
    }

    const approve = order.links?.find((l) => l.rel === "approve")?.href;
    if (!approve) return res.status(400).json({ error: "No approve link" });

    return res.status(200).json({ url: approve });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error creating PayPal order." });
  }
}

// small helper to read JSON body safely
async function readBody(req) {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8") || "{}";
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
