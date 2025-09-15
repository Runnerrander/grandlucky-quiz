// pages/api/saveResult.js
// Idempotent save: if (username, round_id) already exists in quiz_results,
// return ok without inserting a duplicate.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE;

// Lazy client init (service role is required for server-side writes)
const supabase = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : null;

function asInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    if (!supabase) {
      return res.status(500).json({ ok: false, error: "Server misconfigured: Supabase env missing" });
    }

    // Accept both GET query or JSON POST body
    const src = req.method === "POST" && req.headers["content-type"]?.includes("application/json")
      ? (req.body || {})
      : req.query || {};

    const username = String(src.username || "").trim();
    const ms       = asInt(src.ms);
    const correct  = asInt(src.correct);
    const round_id = String(src.round_id || "unknown").trim();

    if (!username) {
      return res.status(400).json({ ok: false, error: "Missing username" });
    }
    if (!Number.isFinite(ms) || ms < 0) {
      return res.status(400).json({ ok: false, error: "Invalid ms" });
    }
    if (!Number.isFinite(correct) || correct < 0) {
      return res.status(400).json({ ok: false, error: "Invalid correct" });
    }
    if (!round_id) {
      return res.status(400).json({ ok: false, error: "Missing round_id" });
    }

    // 1) Check if a result already exists for this username+round
    const { data: existing, error: selErr } = await supabase
      .from("quiz_results")
      .select("id")
      .eq("username", username)
      .eq("round_id", round_id)
      .maybeSingle();

    if (selErr) {
      return res.status(500).json({ ok: false, error: selErr.message });
    }

    if (existing?.id) {
      // Already saved — return success without inserting a duplicate
      return res.status(200).json({ ok: true, id: existing.id, already: true });
    }

    // 2) Insert new row
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([{ username, time_ms: ms, correct, round_id }])
      .select("id")
      .maybeSingle();

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, id: data?.id ?? null, already: false });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown server error" });
  }
};
