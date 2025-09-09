// pages/api/list-submissions.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

export default async function handler(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const round_id = typeof req.query.round_id === "string" ? req.query.round_id : null;

    let query = supabase
      .from("trivia_submissions")
      .select("username, round_id, correct_count, total_time_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (round_id) query = query.eq("round_id", round_id);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ rows: data });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}
