// pages/api/submit-quiz.js
// Stores quiz completion automatically into public.quiz_results

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

    const { data, error } = await supabase
      .from("quiz_results")
      .insert([{ username, time_ms: ms, correct, round_id }])
      .select("id")
      .maybeSingle();

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown server error" });
  }
};
