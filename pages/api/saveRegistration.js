// pages/api/saveRegistration.js
import { createClient } from "@supabase/supabase-js";

function makeCreds(sessionId) {
  const digits = String(sessionId || "").replace(/\D+/g, "").slice(-4) || "ID";
  return {
    username: `GL-${digits}`,
    password: `PASS-${digits}`,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sid =
      (req.query && req.query.session_id && String(req.query.session_id)) || "";

    if (!sid.trim()) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceKey) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: Supabase env vars missing" });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Generate credentials deterministically from session_id
    const { username, password } = makeCreds(sid);

    // Insert or update (unique on session_id)
    const { error } = await supabase
      .from("registrations")
      .upsert(
        {
          session_id: sid,
          username,
          password,
          status: "pending",
        },
        { onConflict: "session_id" }
      );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Return the credentials for the success page
    return res.status(200).json({ ok: true, username, password });
  } catch (e) {
    console.error("saveRegistration error:", e);
    return res
      .status(500)
      .json({ error: e?.message || "Internal server error" });
  }
}
