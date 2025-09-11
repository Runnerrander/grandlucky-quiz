// pages/api/saveResult.js
// Stores quiz result into public.quiz_results (accepts GET or POST)

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const supabase =
  SUPABASE_URL && SERVICE_ROLE ? createClient(SUPABASE_URL, SERVICE_ROLE) : null;

function toInt(x) {
  const n = parseInt(String(x ?? ""), 10);
  return Number.isFinite(n) ? n : NaN;
}
function clean(text, max = 120) {
  return String(text ?? "").trim().slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, error: "Supabase env missing" });
    }

    // Allow only GET or POST
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Read params from GET query or POST body
    const src = req.method === "POST" ? (req.body || {}) : (req.query || {});
    const username = clean(src.username || src.user, 64);
    const round_id = clean(src.round_id || src.roundId || "default", 80);
    const time_ms  = toInt(src.ms ?? src.time_ms ?? src.timeMs);
    const correct  = toInt(src.correct ?? src.correct_count);

    // Validate
    if (!username) return res.status(400).json({ ok: false, error: "Missing username" });
    if (!Number.isFinite(time_ms) || time_ms < 0 || time_ms > 3600000)
      return res.status(400).json({ ok: false, error: "Invalid time_ms" });
    if (!Number.isFinite(correct) || correct < 0 || correct > 100)
      return res.status(400).json({ ok: false, error: "Invalid correct" });

    // Insert
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([{ username, round_id, time_ms, correct }])
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, id: data.id, row: data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
