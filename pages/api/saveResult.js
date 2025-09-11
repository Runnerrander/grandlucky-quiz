// pages/api/saveResult.js
// Inserts a quiz result into public.quiz_results
// Accepts GET (query params) and POST (JSON body)

const { createClient } = require("@supabase/supabase-js");

// Env vars: make sure these exist in Vercel
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

// Single client (service role so RLS never blocks this server route)
const supabase =
  SUPABASE_URL && SERVICE_ROLE ? createClient(SUPABASE_URL, SERVICE_ROLE) : null;

function toInt(x) {
  if (x === null || x === undefined) return NaN;
  const n = parseInt(String(x), 10);
  return Number.isFinite(n) ? n : NaN;
}

function cleanText(x, max = 120) {
  return String(x || "")
    .trim()
    .slice(0, max);
}

export default async function handler(req, res) {
  // CORS / caching – conservative
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (!supabase) {
      return res
        .status(500)
        .json({ ok: false, error: "Server misconfigured: Supabase env missing" });
    }

    // Read inputs from GET ?query or POST JSON
    const src = req.method === "POST" ? req.body || {} : req.query || {};

    const username = cleanText(src.username || src.user, 64);
    const round_id = cleanText(src.round_id || src.roundId || "default", 80);

    // Support ms / time_ms / timeMs
    const time_ms = toInt(src.ms ?? src.time_ms ?? src.timeMs);
    // Support correct / correct_count
    const correct = toInt(src.correct ?? src.correct_count);

    // Basic validation
    if (!username) {
      return res.status(400).json({ ok: false, error: "Missing username" });
    }
    if (!Number.isFinite(time_ms) || time_ms < 0 || time_ms > 60 * 60 * 1000) {
      return res
        .status(400)
        .json({ ok: false, error: "Invalid time_ms (expect 0..3600000)" });
    }
    if (!Number.isFinite(correct) || correct < 0 || correct > 100) {
      return res
        .status(400)
        .json({ ok: false, error: "Invalid correct (expect 0..100)" });
    }

    // Insert row
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([{ username, round_id, time_ms, correct }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, id: data.id, row: data });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Unknown server error" });
  }
}
