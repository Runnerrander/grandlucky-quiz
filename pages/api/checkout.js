// pages/api/checkout.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Build the absolute origin for local dev or Vercel
    const proto =
      (req.headers["x-forwarded-proto"] &&
        String(req.headers["x-forwarded-proto"]).split(",")[0]) ||
      "http";
    const host =
      (req.headers["x-forwarded-host"] &&
        String(req.headers["x-forwarded-host"]).split(",")[0]) ||
      req.headers.host;
    const origin = `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // your one-time price
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      // optional: metadata, locale, etc.
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
