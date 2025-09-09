// pages/api/trivia/submit.js
import { createClient } from "@supabase/supabase-js";

// CONFIG
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(URL, KEY);

// business rules
const TARGET_CORRECT = 5; // must match client
const TABLE = "trivia_submissions"; // your submissions table name

function toInt(v, def = 0) {
  const n = typeof v === "number" ? v : parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : def;
}
function okStr(s) {
  return typeof s === "string" ? s.trim() : "";
}

function redirectUrl({ username, round_id, correct_count, total_time_ms }) {
  const qs = new URLSearchParams({
    u: username || "",
    round_id: round_id || "",
    cc: String(correct_count || 0),
    ms: String(total_time_ms || 0),
  }).toString();
  return `/final?${qs}`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      // check if user already submitted for this round
      const username = okStr(req.query.username);
      const round_id = okStr(req.query.round_id);
      if (!username || !round_id) {
        return res.status(400).json({ error: "username and round_id required" });
      }

      const { data, error } = await supabase
        .from(TABLE)
        .select("id, username, round_id, correct_count, total_time_ms, created_at")
        .eq("username", username)
        .eq("round_id", round_id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return res.status(200).json({ existing: data || null });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use GET or POST" });
    }

    const body = req.body || {};
    const username = okStr(body.username);
    const round_id = okStr(body.round_id);
    const correct_count = toInt(body.correct_count, 0);
    const total_time_ms = toInt(body.total_time_ms, 0);
    const answers = body.answers ?? null;
    const tie_decision = okStr(body.tie_decision); // "", "add_5s"

    if (!username || !round_id) {
      return res.status(400).json({ error: "username and round_id required" });
    }
    if (correct_count < 0 || total_time_ms <= 0) {
      return res.status(400).json({ error: "invalid correct_count or total_time_ms" });
    }

    // Has this user already finalized a submission?
    const { data: existing, error: exErr } = await supabase
      .from(TABLE)
      .select("id, username, round_id, correct_count, total_time_ms, created_at")
      .eq("username", username)
      .eq("round_id", round_id)
      .limit(1)
      .maybeSingle();
    if (exErr) throw exErr;
    if (existing) {
      // Already submitted earlier — return that
      return res.status(200).json({
        success: true,
        existing,
        redirect: redirectUrl(existing),
      });
    }

    // TIE decision pathway (user picked "add 5s" after initial tie)
    if (tie_decision === "add_5s") {
      const finalMs = total_time_ms + 5000;

      const insertRow = {
        username,
        round_id,
        correct_count,
        total_time_ms: finalMs,
        answers, // optional audit; ensure column type can accept json
      };

      const { data: ins, error: insErr } = await supabase
        .from(TABLE)
        .insert(insertRow)
        .select("id, username, round_id, correct_count, total_time_ms")
        .single();

      if (insErr) throw insErr;

      return res.status(200).json({
        success: true,
        final: ins,
        redirect: redirectUrl(ins),
      });
    }

    // Normal submission flow: detect perfect-time tie first
    const isPerfect = correct_count >= TARGET_CORRECT;

    if (isPerfect) {
      // anyone (else) with the same exact time in this round?
      const { data: ties, error: tieErr } = await supabase
        .from(TABLE)
        .select("id, username")
        .eq("round_id", round_id)
        .eq("correct_count", TARGET_CORRECT)
        .eq("total_time_ms", total_time_ms);

      if (tieErr) throw tieErr;

      // If any record exists with the same perfect time,
      // treat as a tie (even if different day/hour).
      const hasOther = Array.isArray(ties) && ties.length > 0;
      if (hasOther) {
        return res.status(200).json({
          tie: true,
          message:
            "Another player finished with the exact same time. Choose: new quiz or +5s penalty.",
          echo: {
            username,
            round_id,
            correct_count,
            total_time_ms,
            // keep answers so we can finalize with +5s without re-sending from client
            answers: answers ?? null,
          },
        });
      }
    }

    // No tie (or not perfect) — finalize immediately
    const insertRow = {
      username,
      round_id,
      correct_count,
      total_time_ms,
      answers, // optional audit
    };

    const { data: ins, error: insErr } = await supabase
      .from(TABLE)
      .insert(insertRow)
      .select("id, username, round_id, correct_count, total_time_ms")
      .single();

    if (insErr) throw insErr;

    return res.status(200).json({
      success: true,
      final: ins,
      redirect: redirectUrl(ins),
    });
  } catch (e) {
    console.error("[submit] error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
