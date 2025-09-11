// pages/api/saveRegistration.js
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
const stripeSecret = process.env.STRIPE_SECRET_KEY;

// Create a Supabase service client if envs are present
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const sid =
      (req.query && (req.query.session_id || req.query.sessionId)) ||
      (req.body && (req.body.session_id || req.body.sessionId)) ||
      "";
    const session_id = String(sid || "").trim();

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    // Quick test path — no DB write
    if (session_id === "PING1234") {
      return res.status(200).json({
        ok: true,
        username: "GL-1234",
        password: "PASS-1234",
        test: true,
      });
    }

    // Optional: verify Stripe checkout session (best-effort)
    let paid = true;
    if (stripeSecret && /^cs_/.test(session_id)) {
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
          expand: ["payment_intent"],
        });
        paid =
          session?.payment_status === "paid" ||
          session?.status === "complete" ||
          session?.payment_intent?.status === "succeeded";
      } catch {
        // Ignore verification errors; don't block user
      }
    }

    // Generate simple creds from the session_id tail
    const tail = session_id.slice(-4).toUpperCase();
    const username = `GL-${tail}`;
    const password = `PASS-${tail}`;

    // Write to Supabase if configured and (likely) paid
    if (supabase && paid) {
      await supabase.from("registrations").insert({
        session_id,
        username,
        password,
        created_at: new Date().toISOString(),
      });
    }

    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    console.error("saveRegistration error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
