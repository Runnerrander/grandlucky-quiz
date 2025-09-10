// pages/api/checkout.js
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const stripe = new Stripe(stripeSecret ?? "", { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!stripeSecret || !stripeSecret.startsWith("sk_")) {
      throw new Error("Missing or invalid STRIPE_SECRET_KEY");
    }
    if (!priceId || !priceId.startsWith("price_")) {
      throw new Error("Missing or invalid STRIPE_PRICE_ID");
    }

    // Build absolute URLs that work on Vercel preview & production
    const baseUrl = (req.headers.origin ?? `https://${req.headers.host}`).replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("checkout error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
}
