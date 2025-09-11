// pages/api/saveResult.js
// Save quiz completion into the most recent registrations row for a username.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (!supabase) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: Supabase env vars missing" });
    }

    const { username, ms, round_id } = req.body || {};

    // Basic validation
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ error: "username required" });
    }
    const time_ms = Number(ms);
    if (!Number.isFinite(time_ms) || time_ms < 0) {
      return res.status(400).json({ error: "ms must be a non-negative number" });
    }

    // 1) find the most recent registrations row for this username
    const { data: found, error: findErr } = await supabase
      .from("registrations")
      .select("id")
      .eq("username", username)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) {
      return res.status(500).json({ error: `Lookup failed: ${findErr.message}` });
    }

    if (found && found.id) {
      // 2) update that row
      const { error: updErr } = await supabase
        .from("registrations")
        .update({
          time_ms,
          completed_at: new Date().toISOString(),
          status: "completed",
          ...(round_id ? { round_id: String(round_id) } : {}),
        })
        .eq("id", found.id);

      if (updErr) {
        return res.status(500).json({ error: `Update failed: ${updErr.message}` });
      }
      return res.status(200).json({ ok: true, updated: true });
    } else {
      // 3) if no row exists (edge case), insert a minimal one
      const { error: insErr } = await supabase.from("registrations").insert([
        {
          username: String(username),
          password: "", // unknown at this point
          session_id: "", // unknown at this point
          status: "completed",
          time_ms,
          completed_at: new Date().toISOString(),
          ...(round_id ? { round_id: String(round_id) } : {}),
        },
      ]);

      if (insErr) {
        return res.status(500).json({ error: `Insert failed: ${insErr.message}` });
      }
      return res.status(200).json({ ok: true, inserted: true });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: err?.message || "Unknown server error" });
  }
};
