// pages/api/saveRegistration.js
// Verifies a Stripe Checkout Session (paid/complete) and upserts a row in Supabase.
// Also supports dev "PING…" session_ids for quick testing (no Stripe call).

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/** ──────────────────────────────────────────────────────────────────────────
 *  Env requirements (Vercel → Project → Settings → Environment Variables):
 *   - STRIPE_SECRET_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE    (server-side key; never expose to browser)
 *  Table: public.registrations (columns)
 *    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
 *    session_id TEXT NOT NULL UNIQUE
 *    username TEXT NOT NULL
 *    password TEXT NOT NULL
 *    status   TEXT NOT NULL DEFAULT 'pending'
 *    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 *  Unique index on session_id is recommended.
 *  ───────────────────────────────────────────────────────────────────────── */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Build Supabase admin client
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("Supabase environment variables are missing.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });
}

// Small deterministic 4-digit code from any string (stable per session_id)
function codeFrom(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  const n = (h % 9000) + 1000; // 1000..9999
  return String(n);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    // Accept GET ?session_id=… or POST { session_id / sessionId }
    const sessionId =
      (req.method === "POST"
        ? req.body?.session_id || req.body?.sessionId
        : req.query?.session_id || req.query?.sessionId) || "";

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    const supabase = getSupabase();

    // Idempotency: if a row already exists for this session, return its creds.
    {
      const { data: existing, error: exErr } = await supabase
        .from("registrations")
        .select("username,password,status")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (exErr) {
        // Not fatal for client UX; still report
        console.error("Supabase select error:", exErr);
      }
      if (existing) {
        return res.status(200).json({
          ok: true,
          session_id: sessionId,
          username: existing.username,
          password: existing.password,
          status: existing.status || "pending",
          cached: true,
        });
      }
    }

    // Dev shortcut: session_id starting with "PING" returns stub creds, and stores as 'pending'
    if (/^PING/i.test(sessionId)) {
      const code = codeFrom(sessionId);
      const username = `GL-${code}`;
      const password = `PASS-${code}`;

      const { error: upErr } = await supabase
        .from("registrations")
        .upsert(
          [{ session_id: sessionId, username, password, status: "pending" }],
          { onConflict: "session_id" }
        );

      if (upErr) console.error("Supabase upsert (PING) error:", upErr);

      return res.status(200).json({
        ok: true,
        session_id: sessionId,
        username,
        password,
        status: "pending",
        mode: "stub",
      });
    }

    // Real Stripe verification
    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing.");
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY /*, { apiVersion: "2023-10-16" }*/);

    // Retrieve and validate the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // Accept if Checkout is complete and either paid or no payment required.
    const isComplete =
      session?.status === "complete" &&
      (session?.payment_status === "paid" ||
        session?.payment_status === "no_payment_required");

    if (!isComplete) {
      return res.status(400).json({
        ok: false,
        error: `Checkout session not complete/paid (status=${session?.status}, payment_status=${session?.payment_status})`,
      });
    }

    // Create deterministic-but-unique creds for this session
    const code = codeFrom(sessionId + (session.customer || "") + (session.customer_email || ""));
    const username = `GL-${code}`;
    const password = `PASS-${code}`;

    // Upsert (idempotent) and return the row
    const { data: upData, error: upErr } = await supabase
      .from("registrations")
      .upsert(
        [{ session_id: sessionId, username, password, status: "paid" }],
        { onConflict: "session_id" }
      )
      .select("username,password,status")
      .single();

    if (upErr) {
      console.error("Supabase upsert error:", upErr);
      return res.status(500).json({ ok: false, error: "Database upsert failed." });
    }

    return res.status(200).json({
      ok: true,
      session_id: sessionId,
      username: upData.username,
      password: upData.password,
      status: upData.status,
    });
  } catch (e) {
    console.error("saveRegistration error:", e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
