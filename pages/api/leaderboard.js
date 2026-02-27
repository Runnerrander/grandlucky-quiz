/* eslint-env node */

// pages/api/leaderboard.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

async function getActiveRoundId() {
  // Try to auto-detect the active open round (if you didn't set ROUND_ID)
  const { data, error } = await supabase
    .from("trivia_rounds")
    .select("id, status, is_active, start_at")
    .eq("is_active", true)
    .eq("status", "open")
    .order("start_at", { ascending: false })
    .limit(1);

  if (error) return { round_id: null, meta: null, err: error };
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return { round_id: row?.id || null, meta: row || null, err: null };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    if (!supabase) {
      return res.status(500).json({
        ok: false,
        message:
          "Server misconfigured: missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
      });
    }

    // include_time=1 will include time_ms in response (optional)
    const includeTime =
      String(req.query.include_time || "").trim() === "1" ||
      String(req.query.include_time || "").trim().toLowerCase() === "true";

    // Round id priority:
    // 1) ?round_id=...
    // 2) ROUND_ID (server env recommended)
    // 3) NEXT_PUBLIC_ROUND_ID (your existing)
    // 4) auto-detect active open round in trivia_rounds
    let round_id =
      (typeof req.query.round_id === "string" && req.query.round_id.trim()) ||
      (process.env.ROUND_ID || "").trim() ||
      (process.env.NEXT_PUBLIC_ROUND_ID || "").trim() ||
      null;

    let roundMeta = null;

    if (!round_id) {
      const { round_id: autoId, meta, err } = await getActiveRoundId();
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "Failed to auto-detect active round",
          details: { code: err.code || "DB", message: err.message || "Unknown DB error" },
        });
      }
      round_id = autoId;
      roundMeta = meta;
    }

    if (!round_id) {
      return res.status(400).json({
        ok: false,
        message:
          "Missing round_id. Provide ?round_id=... or set ROUND_ID / NEXT_PUBLIC_ROUND_ID, or mark an active open round in trivia_rounds.",
      });
    }

    // Pull top 10 for this round_id from quiz_results_plus
    // Only perfect (5) results
    const { data, error } = await supabase
      .from("quiz_results_plus")
      .select("username, time_ms, correct, created_at, round_id")
      .eq("round_id", round_id)
      .eq("correct", 5)
      .order("time_ms", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      return res.status(500).json({
        ok: false,
        message: "DB error",
        details: { code: error.code || "DB", message: error.message || "Unknown DB error" },
      });
    }

    // Ranking ONLY (rank + username). time_ms is optional via include_time=1
    const leaderboard = (data || []).map((row, i) => {
      const base = { rank: i + 1, username: row.username };
      if (includeTime) base.time_ms = row.time_ms;
      return base;
    });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json({
      ok: true,
      round_id,
      source: "quiz_results_plus",
      ...(roundMeta ? { round_meta: roundMeta } : {}),
      leaderboard,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Internal error",
      details: String(err?.message || err),
    });
  }
};

module.exports.default = module.exports;