/* eslint-env node */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const ZOOM_LINK =
  "https://us06web.zoom.us/j/82929363166?pwd=0fIJOzctYlZWc3oAsMP4lLPAkJI6Hf.1";

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    if (!supabase) {
      return res.status(500).json({
        ok: false,
        message: "Supabase not configured",
      });
    }

    const username = String(req.body?.username || "")
      .trim()
      .toUpperCase();

    const password = String(req.body?.password || "").trim();

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: "Missing credentials",
      });
    }

    // verify registration credentials
    const { data: reg, error: regError } = await supabase
      .from("registrations")
      .select("username,password")
      .eq("username", username)
      .eq("password", password)
      .limit(1)
      .maybeSingle();

    if (regError || !reg) {
      return res.status(401).json({
        ok: false,
        message: "Invalid username or password",
      });
    }

    // get current top 20
    const { data: top, error: topError } = await supabase
      .from("trivia_submissions")
      .select("username,total_time_ms,created_at")
      .eq("correct_count", 5)
      .eq("total_questions", 5)
      .order("total_time_ms", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(20);

    if (topError) {
      return res.status(500).json({
        ok: false,
        message: "Failed to load leaderboard",
      });
    }

    const allowed = (top || []).some(
      (x) => String(x.username || "").toUpperCase() === username
    );

    if (!allowed) {
      return res.status(403).json({
        ok: false,
        message: "This username is not currently qualified for Zoom access",
      });
    }

    return res.status(200).json({
      ok: true,
      zoom_link: ZOOM_LINK,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: String(err?.message || err),
    });
  }
};

module.exports.default = module.exports;