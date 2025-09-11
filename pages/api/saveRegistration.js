// pages/api/saveRegistration.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const session_id =
      (req.query && req.query.session_id && String(req.query.session_id)) || "";
    if (!session_id.trim()) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    // Use last 4 alphanumeric chars (digits if available) for pretty creds
    const tail =
      (session_id.match(/[0-9]{2,}$/)?.[0] ??
        session_id.slice(-4).replace(/[^A-Za-z0-9]/g, ""))
        .toUpperCase() || "TEST";

    const username = `GL-${tail}`;
    const password = `PASS-${tail}`;

    // 1) If already saved, return existing creds (idempotent)
    const { data: existing, error: selErr } = await supabase
      .from("registrations")
      .select("username,password")
      .eq("session_id", session_id)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing) {
      return res.status(200).json({
        ok: true,
        username: existing.username,
        password: existing.password,
      });
    }

    // 2) Insert new row
    const { error: insErr } = await supabase.from("registrations").insert({
      session_id,
      username,
      password,
      status: "pending",
    });
    if (insErr) throw insErr;

    return res.status(200).json({ ok: true, username, password });
  } catch (err) {
    const msg =
      err?.message ||
      (typeof err === "string" ? err : "Unexpected server error");
    return res.status(500).json({ error: msg });
  }
}
