// pages/api/saveRegistration.js
// Verifies a Stripe Checkout Session, then upserts a row in Supabase.
// Also supports dev "PING…" session_ids for quick testing (now upserts those too).

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// tiny helper: deterministic 4-digit code from a string (stable per session_id)
function codeFrom(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const n = (h % 9000) + 1000; // 1000..9999
  return String(n);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    // Support GET (current flow) and POST (future-proof).
    const session_id =
      (req.method === "GET"
        ? req.query?.session_id
        : req.body?.session_id || req.body?.sessionId) || "";

    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "Missing session_id" });
    }

    // If we already stored this session, return the same creds (idempotent).
    if (supabase) {
      const { data: existing, error: exErr } = await supabase
        .from("registrations")
        .select("username,password,status")
        .eq("session_id", session_id)
        .maybeSingle();

      if (!exErr && existing) {
        return res.status(200).json({
          ok: true,
          username: existing.username,
          password: existing.password,
        });
      }
    }

    // --- DEV shortcut: PING* session_ids -----------------------------------
    if (/^PING/i.test(session_id)) {
      const code = codeFrom(session_id);
      const username = `GL-${code}`;
      const password = `PASS-${code}`;

      // Upsert for visibility in Supabase
      if (supabase) {
        await supabase
          .from("registrations")
          .upsert(
            { session_id, username, password, status: "pending" },
            { onConflict: "session_id" }
          );
      }

      return res.status(200).json({ ok: true, username, password });
    }

    // --- Real Stripe verification ------------------------------------------
    if (!stripeSecret) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: STRIPE_SECRET_KEY missing" });
    }
    if (!supabase) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: Supabase env vars missing" });
    }

    // Optional sanity check; comment out if your IDs might differ
    if (!/^cs_(test|live)_[A-Za-z0-9]+/.test(session_id)) {
      return res.status(400).json({ error: "Invalid session_id format" });
    }

    const stripe = new Stripe(stripeSecret);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent"],
      });
    } catch (err) {
      return res
        .status(400)
        .json({ error: `Stripe retrieve failed: ${err.message}` });
    }

    // Accept when checkout is complete AND paid (or no payment required).
    const isComplete =
      session?.status === "complete" &&
      (session?.payment_status === "paid" ||
        session?.payment_status === "no_payment_required");

    if (!isComplete) {
      return res.status(400).json({
        error: `Session not complete/paid (status=${session?.status}, payment_status=${session?.payment_status})`,
      });
    }

    const code = codeFrom(
      session_id + (session.customer || "") + (session.customer_email || "")
    );
    const username = `GL-${code}`;
    const password = `PASS-${code}`;

    // Upsert row keyed by unique session_id
    const { error: upErr } = await supabase
      .from("registrations")
      .upsert(
        { session_id, username, password, status: "paid" },
        { onConflict: "session_id" }
      );

    if (upErr) {
      return res.status(500).json({ error: upErr.message });
    }

    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unknown server error" });
  }
};
