// pages/api/saveRegistration.js
import { createClient } from "@supabase/supabase-js";

/**
 * This endpoint is idempotent by Stripe session_id:
 * - If a row exists for session_id, returns the existing username/password
 * - Otherwise generates credentials, inserts, and returns them
 *
 * Expected request (GET):
 *   /api/saveRegistration?session_id=cs_test_...
 *
 * Response (200 JSON):
 *   { ok: true, username: "GL-AB12CD", password: "X7K9P2Q4" }
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

function randAlphaNum(len) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alikes
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const session_id = (req.query.session_id || "").toString();
    if (!session_id) {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return res.status(500).json({ ok: false, error: "Supabase env vars missing" });
    }

    // 1) Return existing if already created
    let { data: existing, error: selErr } = await supabase
      .from("registrations")
      .select("username, password")
      .eq("session_id", session_id)
      .maybeSingle();

    if (selErr) {
      // Not a hard failure if it's just "No rows", but return structured error if real
      if (!/No rows/.test(selErr.message)) {
        return res.status(500).json({ ok: false, error: `Select failed: ${selErr.message}` });
      }
    }

    if (existing && existing.username && existing.password) {
      return res.status(200).json({ ok: true, ...existing });
    }

    // 2) Generate new credentials
    const username = `GL-${randAlphaNum(6)}`;
    const password = randAlphaNum(8);

    // 3) Insert (idempotent on session_id UNIQUE constraint)
    const { error: insErr } = await supabase.from("registrations").insert({
      session_id,
      username,
      password,
      created_at: new Date().toISOString(),
    });

    if (insErr) {
      // If unique constraint raced, fetch the row and return it
      const conflict =
        /duplicate key value|unique constraint|Unique violation/i.test(insErr.message);
      if (!conflict) {
        return res.status(500).json({ ok: false, error: `Insert failed: ${insErr.message}` });
      }
      const { data: again, error: againErr } = await supabase
        .from("registrations")
        .select("username, password")
        .eq("session_id", session_id)
        .single();
      if (againErr) {
        return res.status(500).json({ ok: false, error: `Fetch-after-conflict failed: ${againErr.message}` });
      }
      return res.status(200).json({ ok: true, ...again });
    }

    // 4) Success
    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    console.error("saveRegistration error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Internal error" });
  }
}
