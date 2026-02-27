/* eslint-env node */

// pages/api/submit-quiz.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (!supabase) {
    return res.status(500).json({
      ok: false,
      message:
        "Server misconfigured: missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    const username = String(body.username || "").trim();
    const round_id = String(body.round_id || "").trim();
    const answers = body.answers ?? body.selected ?? body.responses ?? null;

    const correct_count = Number.isFinite(body.correct_count)
      ? body.correct_count
      : Number.isFinite(body.correct)
      ? body.correct
      : 0;

    const total_questions = Number.isFinite(body.total_questions)
      ? body.total_questions
      : Number.isFinite(body.total)
      ? body.total
      : 5;

    const total_time_ms = Number.isFinite(body.total_time_ms)
      ? body.total_time_ms
      : Number.isFinite(body.time_ms)
      ? body.time_ms
      : NaN;

    if (!username) {
      return res.status(400).json({ ok: false, message: "Missing username" });
    }
    if (!round_id) {
      return res.status(400).json({ ok: false, message: "Missing round_id" });
    }
    if (!Number.isFinite(total_time_ms)) {
      return res.status(400).json({ ok: false, message: "Missing total_time_ms" });
    }

    // ✅ Save ONLY to trivia_submissions (this is the “new contest” table)
    const payload = {
      round_id,
      username,
      answers: answers ?? [],
      correct_count: Number(correct_count) || 0,
      total_questions: Number(total_questions) || 5,
      total_time_ms: Number(total_time_ms),
      submitted_at: new Date().toISOString(),
    };

    // If you have a unique constraint (round_id, username), this prevents duplicates
    const { data, error } = await supabase
      .from("trivia_submissions")
      .upsert(payload, { onConflict: "round_id,username" })
      .select("id, round_id, username, correct_count, total_questions, total_time_ms")
      .single();

    if (error) {
      return res.status(500).json({
        ok: false,
        message: "Failed to save into trivia_submissions",
        details: { code: error.code, message: error.message, hint: error.hint || null },
      });
    }

    return res.status(200).json({ ok: true, saved: data });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Internal error",
      details: String(err?.message || err),
    });
  }
};

module.exports.default = module.exports;