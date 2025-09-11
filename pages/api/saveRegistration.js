// pages/api/saveRegistration.js
// Verifies a Stripe Checkout Session (paid), then upserts a row in Supabase.
// Still supports dev "PING…" session_ids for quick testing.

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const session_id =
      (req.query.session_id || (req.body && req.body.session_id) || "").toString();

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    // DEV shortcut: allow PING* ids to keep your current test flow working.
    if (/^PING/i.test(session_id)) {
      const tail = session_id.slice(-4).toUpperCase();
      return res.status(200).json({
        ok: true,
        username: `GL-${tail}`,
        password: `PASS-${tail}`,
      });
    }

    // Basic env checks
    if (!stripeSecret) {
      return res.status(500).json({ error: "Server misconfigured: STRIPE_SECRET_KEY missing" });
    }
    if (!supabase) {
      return res.status(500).json({ error: "Server misconfigured: Supabase env vars missing" });
    }

    // Sanity check: Stripe session id format
    if (!/^cs_(test|live)_[A-Za-z0-9]+/.test(session_id)) {
      return res.status(400).json({ error: "Invalid session_id format" });
    }

    const stripe = new Stripe(stripeSecret);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent", "line_items"],
      });
    } catch (err) {
      return res.status(400).json({ error: `Stripe retrieve failed: ${err.message}` });
    }

    // Require successful payment
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Session not paid yet" });
    }

    // Generate simple credentials (replace with your real logic if desired)
    const tail = session_id.slice(-4).toUpperCase();
    const username = `GL-${tail}`;
    const password = `PASS-${tail}`;

    // Upsert row keyed by unique session_id
    const { data, error } = await supabase
      .from("registrations")
      .upsert(
        {
          session_id,
          username,
          password,
          status: "active",
        },
        { onConflict: "session_id" }
      )
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
}
