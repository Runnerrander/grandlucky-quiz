// pages/api/saveRegistration.js
import { supabaseAdmin } from "../../lib/supabaseClient";

// (optional) deterministic username helper if you ever want it
function makeUsername(sessionId) {
  const short = String(sessionId).replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  return `gl-${short}`;
}
function makePassword() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

export default async function handler(req, res) {
  console.log("💾 saveRegistration API called");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { sessionId } = req.body || {};
    console.log("🛰 Received sessionId from frontend:", sessionId);

    if (!sessionId) {
      return res.status(400).json({ success: false, error: "Missing sessionId" });
    }

    // 1) Fast path: if it already exists, just return it (idempotent)
    {
      const { data: existing } = await supabaseAdmin
        .from("registrations")
        .select("username, password")
        .eq("session_id", sessionId)
        .single();

      if (existing) {
        console.log("⚡ Already saved for this session, returning existing creds");
        return res.status(200).json({ success: true, data: existing });
      }
    }

    // 2) (optional) Verify paid with Stripe here if you want — skip for minimal change
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    // if (session.payment_status !== "paid") {
    //   return res.status(409).json({ success: false, error: "Session not paid yet" });
    // }

    // 3) Generate new credentials
    // Use your original random style to avoid changing look & feel
    const username = "user" + Math.floor(Math.random() * 10000);
    // Or deterministic: const username = makeUsername(sessionId);
    const password = makePassword();

    // 4) Try to INSERT once
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("registrations")
      .insert([{ status: "paid", username, password, session_id: sessionId }])
      .select("username, password")
      .single();

    if (insertErr) {
      // If another request won the race, Postgres throws unique violation (code 23505)
      if (insertErr.code === "23505") {
        console.warn("🔁 Unique violation (race). Reading existing row.");
        const { data: row, error: readErr } = await supabaseAdmin
          .from("registrations")
          .select("username, password")
          .eq("session_id", sessionId)
          .single();
        if (row) return res.status(200).json({ success: true, data: row });
        return res.status(500).json({ success: false, error: readErr?.message || "Read failed" });
      }
      // Any other DB error
      return res.status(500).json({ success: false, error: insertErr.message || "Insert failed" });
    }

    console.log("✅ Registration saved:", inserted);
    return res.status(200).json({ success: true, data: inserted });
  } catch (err) {
    console.error("❌ Error saving registration:", err?.message || err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
}
