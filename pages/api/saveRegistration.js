// pages/api/saveRegistration.js
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || "";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

const supabase =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    : null;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session_id = (req.query.session_id || "").toString().trim();
    if (!session_id) throw new Error("Missing session_id");
    if (!supabase) throw new Error("Server misconfigured (Supabase env).");

    // 1) Find or create a row for this session
    const existing = await supabase
      .from("registrations")
      .select("*")
      .eq("session_id", session_id)
      .maybeSingle();

    let row = existing.data;

    if (!row) {
      // create placeholder row
      const insert = await supabase
        .from("registrations")
        .insert({ session_id, status: "pending" })
        .select()
        .single();
      if (insert.error) throw insert.error;
      row = insert.data;

      // credentials derived from DB id (guaranteed unique & numeric)
      const pad = (n) => String(n).padStart(4, "0");
      const username = `GL-${pad(row.id)}`;
      const password = `PASS-${pad(row.id)}`;

      const upd = await supabase
        .from("registrations")
        .update({ username, password })
        .eq("id", row.id)
        .select()
        .single();
      if (upd.error) throw upd.error;
      row = upd.data;
    }

    // 2) If this looks like a real Stripe session, verify payment
    if (stripe && session_id.startsWith("cs_")) {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      const paid = s?.payment_status === "paid";
      if (paid && row.status !== "active") {
        await supabase.from("registrations").update({ status: "active" }).eq("id", row.id);
      }
      // (If not paid, we still return creds but keep status pending.)
    }

    return res.status(200).json({
      ok: true,
      username: row.username,
      password: row.password,
    });
  } catch (err) {
    console.error("saveRegistration error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
