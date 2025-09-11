// pages/api/saveRegistration.js
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || "";

// Create clients (only if keys exist)
const stripe = stripeSecret?.startsWith("sk_")
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const sid = (req.query.session_id || req.query.sessionId || "").toString();
    if (!sid) return res.status(400).json({ error: "Missing session_id" });

    // Fast path for manual tests (no Stripe call):
    if (sid.toUpperCase().startsWith("PING")) {
      const tail = (sid.slice(-4).toUpperCase() || "TEST");
      return res.status(200).json({ ok: true, username: `GL-${tail}`, password: `PASS-${tail}` });
    }

    if (!stripe) throw new Error("Stripe secret key missing");

    // Verify the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (!session || session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment not found/paid" });
    }

    // Generate credentials from the session_id tail
    const tail = sid.slice(-4).toUpperCase();
    const username = `GL-${tail}`;
    const password = `PASS-${tail}`;

    // Optional: persist to Supabase (if table and key are present)
    if (supabase) {
      const { error } = await supabase
        .from("registrations") // <- your table name
        .upsert(
          { session_id: sid, username, password },
          { onConflict: "session_id" }
        );

      if (error) {
        // Not fatal to the response (still return creds). Check Vercel logs for details.
        console.error("Supabase upsert error:", error);
      }
    }

    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    console.error("saveRegistration error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
