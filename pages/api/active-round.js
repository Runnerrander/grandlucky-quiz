// pages/api/active-round.js
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

// helper: is "now" inside start/end window?
function inWindow(row, now) {
  const s = row.start_at ? new Date(row.start_at) : null;
  const e = row.deadline_at ? new Date(row.deadline_at) : null;
  return (!s || s <= now) && (!e || now <= e);
}

export default async function handler(req, res) {
  // 🔒 prevent 304 + caching so the client always gets a fresh 200 + JSON
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  // Force a new ETag each time so If-None-Match never hits
  res.setHeader("ETag", `${Date.now()}`);

  try {
    const now = new Date();
    const prefLang = (req.query.lang || "hu").toString();
    const any = "any" in req.query; // ?any=1 to ignore lang preference
    const debug = "debug" in req.query;

    // fetch all active rounds (newest first)
    const { data, error } = await supabase
      .from("trivia_rounds")
      .select("id,name,lang,category,start_at,deadline_at,is_active")
      .eq("is_active", true)
      .order("start_at", { ascending: false });

    if (error) {
      return res.status(200).json({ ok: false, error: error.message });
    }

    const rows = data || [];
    if (!rows.length) {
      return res.status(200).json({
        ok: false,
        error: "no_active_round",
        message: "No rounds with is_active=true.",
        ...(debug ? { nowISO: now.toISOString() } : {}),
      });
    }

    const preferred = any ? rows : rows.filter(r => r.lang === prefLang);
    const others = any ? [] : rows.filter(r => r.lang !== prefLang);

    // pick order:
    // 1) preferred lang & in window
    // 2) any lang & in window
    // 3) preferred lang (ignore window)
    // 4) any lang (ignore window)
    const pIn = preferred.find(r => inWindow(r, now));
    const aIn = !pIn ? rows.find(r => inWindow(r, now)) : null;
    const pAny = !pIn && !aIn ? preferred[0] : null;
    const aAny = !pIn && !aIn && !pAny ? others[0] : null;

    const chosen = pIn || aIn || pAny || aAny;
    if (!chosen) {
      return res.status(200).json({
        ok: false,
        error: "no_round_after_fallbacks",
        ...(debug ? { nowISO: now.toISOString() } : {}),
      });
    }

    const status = pIn
      ? "active_pref_lang"
      : aIn
      ? "active_any_lang"
      : pAny
      ? "outside_window_pref_lang"
      : "outside_window_any_lang";

    // Return ALL common key shapes so /trivia can use whichever it expects
    return res.status(200).json({
      ok: true,
      round_id: chosen.id,   // snake_case
      id: chosen.id,         // raw
      roundId: chosen.id,    // camelCase
      name: chosen.name,
      lang: chosen.lang,
      category: chosen.category,
      start_at: chosen.start_at,
      deadline_at: chosen.deadline_at,
      is_active: chosen.is_active,
      status,
      ...(debug ? { nowISO: now.toISOString() } : {}),
    });
  } catch (e) {
    return res
      .status(200)
      .json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" });
  }
}
