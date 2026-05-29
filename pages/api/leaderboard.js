/* eslint-env node */

// pages/api/leaderboard.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/* CURRENT ROUND ID */
const ROUND_ID = "122d8061-e046-4fa9-9c2b-aaaf05ccba2d";

/* ZOOM LINK */
const ZOOM_LINK =
  "https://us06web.zoom.us/j/82929363166?pwd=0fIJOzctYlZWc3oAsMP4lLPAkJI6Hf.1";

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res
        .status(405)
        .json({ ok: false, message: "Method not allowed" });
    }

    if (!supabase) {
      return res.status(500).json({
        ok: false,
        message:
          "Missing Supabase environment variables",
      });
    }

    const includeTime =
      String(req.query.include_time || "").trim() === "1" ||
      String(req.query.include_time || "")
        .trim()
        .toLowerCase() === "true";

    /* LEADERBOARD */
    const { data, error } = await supabase
      .from("trivia_submissions")
      .select(
        "username,total_time_ms,correct_count,total_questions,created_at,round_id"
      )
      .eq("round_id", ROUND_ID)
      .eq("correct_count", 5)
      .eq("total_questions", 5)
      .order("total_time_ms", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      return res.status(500).json({
        ok: false,
        message: "DB error",
        details: {
          code: error.code || "DB",
          message:
            error.message || "Unknown DB error",
        },
      });
    }

    const leaderboard = (data || []).map((row, i) => {
      const item = {
        rank: i + 1,
        username: row.username,
      };

      if (includeTime) {
        item.time_ms = row.total_time_ms;
      }

      return item;
    });

    /* TOP 20 ACCESS */
    const top20 = (data || []).slice(0, 20);

    res.setHeader(
      "Content-Type",
      "application/json; charset=utf-8"
    );

    return res.status(200).json({
      ok: true,
      round_id: ROUND_ID,
      source: "trivia_submissions",
      zoom_enabled: true,
      zoom_link: ZOOM_LINK,
      leaderboard,
      top20,
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