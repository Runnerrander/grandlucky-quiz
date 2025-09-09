// pages/api/trivia/rounds.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const lang = String(req.query.lang || "hu").toLowerCase();

    const { data, error } = await supabase
      .from("trivia_rounds")
      .select("id,name,lang,category,start_at,deadline_at,is_active")
      .eq("lang", lang)
      .order("start_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ rounds: data || [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unexpected error" });
  }
}
