// pages/api/submit-quiz.js
// Idempotently store quiz completion into public.quiz_results.
// On duplicate (same round_id + username), return ok:true and the existing row id.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // last resort (should be service role on server)

const supabase = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : null;

function asInt(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    if (!supabase) {
      return res
        .status(500)
        .json({ ok: false, error: "Server misconfigured: Supabase env missing" });
    }

    // Accept GET query or JSON POST body
    const src =
      req.method === "POST" &&
      req.headers["content-type"]?.includes("application/json")
        ? (req.body || {})
        : (req.query || {});

    const username = String(src.username || src.user || "").trim();
    const round_id = String(src.round_id || src.roundId || "unknown").trim();

    // Support multiple key names (various callers)
    const ms = asInt(src.ms ?? src.time_ms ?? src.total_time_ms);
    const correct = asInt(src.correct ?? src.correct_count ?? src.cc);

    if (!username) {
      return res.status(400).json({ ok: false, error: "Missing username" });
    }
    if (!round_id) {
      return res.status(400).json({ ok: false, error: "Missing round_id" });
    }
    if (!Number.isFinite(ms) || ms < 0) {
      return res.status(400).json({ ok: false, error: "Invalid ms" });
    }
    if (!Number.isFinite(correct) || correct < 0) {
      return res.status(400).json({ ok: false, error: "Invalid correct" });
    }

    // Try insert
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([{ username, time_ms: ms, correct, round_id }])
      .select("id")
      .maybeSingle();

    // Success on first write
    if (!error) {
      return res.status(200).json({
        ok: true,
        id: data?.id ?? null,
        message: "saved",
      });
    }

    // If duplicate (unique violation), treat as success and return existing row id
    const isUniqueViolation =
      error?.code === "23505" ||
      /duplicate key|unique constraint/i.test(error?.message || "");

    if (isUniqueViolation) {
      const { data: existing } = await supabase
        .from("quiz_results")
        .select("id, time_ms, correct")
        .eq("round_id", round_id)
        .eq("username", username)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      return res.status(200).json({
        ok: true,
        alreadySaved: true,
        id: existing?.id ?? null,
        message: "already saved",
      });
    }

    // Other errors
    return res.status(500).json({ ok: false, error: error.message || "save failed" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown server error" });
  }
};
