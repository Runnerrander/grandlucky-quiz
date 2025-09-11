// pages/api/submit-quiz.js
// Stores the quiz result automatically into public.trivia_submissions.
// Accepts POST JSON: { username, ms, correct=5, round_id }
// Also supports GET ?username=&ms= for quick manual testing.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

const supabase =
  supabaseUrl && serviceRole ? createClient(supabaseUrl, serviceRole) : null;

function bad(res, code, error) {
  return res.status(code).json({ ok: false, error });
}

export default async function handler(req, res) {
  try {
    if (!supabase) {
      return bad(res, 500, "Server misconfigured: Supabase env vars missing");
    }

    // Allow quick GET testing in the browser:
    if (req.method === "GET") {
      const { username = "", ms = "0", round_id = "", correct = "5" } =
        req.query || {};
      return insertRow(res, {
        username: String(username).trim(),
        ms: Number(ms) || 0,
        correct: Number(correct) || 5,
        round_id: round_id ? String(round_id) : null,
      });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, GET");
      return bad(res, 405, "Method not allowed");
    }

    const body = req.body || {};
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const ms = Number(body.ms);
    const correct = Number(body.correct ?? 5);
    const round_id =
      typeof body.round_id === "string" && body.round_id.trim()
        ? body.round_id.trim()
        : null;

    if (!username) return bad(res, 400, "username required");
    if (!Number.isFinite(ms) || ms < 0) return bad(res, 400, "ms must be >= 0");
    if (!Number.isFinite(correct)) return bad(res, 400, "correct must be a number");

    return insertRow(res, { username, ms, correct, round_id });
  } catch (e) {
    return bad(res, 500, e?.message || "Unknown server error");
  }
}

async function insertRow(res, { username, ms, correct, round_id }) {
  // IMPORTANT: column names below assume your existing table shape.
  // If your time column is named differently (e.g. `elapsed_ms`),
  // change `time_ms` to match your table.
  const row = {
    username,
    time_ms: ms,     // <- change to `elapsed_ms` if that's your column name
    correct,
    round_id,
  };

  const { data, error } = await supabase
    .from("trivia_submissions")
    .insert(row)
    .select()
    .maybeSingle();

  if (error) return bad(res, 500, error.message);
  return res.status(200).json({ ok: true, data });
}
