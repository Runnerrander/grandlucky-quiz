// pages/api/saveRegistration.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

function badEnv(res) {
  return res
    .status(500)
    .json({ ok: false, error: "Missing or invalid Supabase environment vars." });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!supabaseUrl || !serviceRoleKey) return badEnv(res);

  try {
    const session_id =
      (req.query && req.query.session_id) ||
      (req.body && req.body.session_id) ||
      "";

    const sid = String(session_id || "").trim();
    if (!sid) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required query param: session_id" });
    }

    // Simple, deterministic credentials based on the session tail
    const tail = sid.slice(-4).toUpperCase();
    const username = `GL-${tail}`;
    const password = `PASS-${tail}`;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Upsert so repeated calls don’t create duplicates
    const { error } = await supabase
      .from("registrations")
      .upsert(
        {
          session_id: sid,
          username,
          password,
        },
        { onConflict: "session_id" }
      );

    if (error) {
      console.error("supabase upsert error:", error);
      return res.status(500).json({ ok: false, error: "DB error" });
    }

    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: "Internal error while saving registration" });
  }
}
