// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const n = Math.max(1, Math.min(50, parseInt(req.query.n ?? req.query.limit, 10) || 6));

  // Read username/round_id from query or Referer (like your original)
  let username = String(req.query.username || req.query.u || '').trim();
  let round_id = String(req.query.round_id || '').trim();
  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      const u = url.searchParams.get('u') || url.searchParams.get('username');
      if (u) username = String(u);
      const r = url.searchParams.get('round_id');
      if (r) round_id = String(r);
    } catch {}
  }

  // Strict requirement: both are mandatory
  if (!username || !round_id) {
    return res.status(400).json({
      error: 'Missing required params: username and round_id',
      hint: 'Call like: /api/get-questions?round_id=<UUID>&username=<name>&lang=hu&n=5'
    });
  }

  try {
    const { data, error } = await supabase.rpc('get_diverse_questions', {
      p_round_id: round_id,
      p_username: username,
      p_lang: lang,
      p_n: n,
    });
    if (error) throw error;

    const questions = (data || []).slice(0, n).map((q) => {
      const choices =
        Array.isArray(q.choices) ? q.choices :
        typeof q.choices === 'string' ? safeJsonParse(q.choices, []) : [];
      return {
        id: String(q.id),
        text: String(q.question ?? ''),
        choices: choices.slice(0, 3),
        correct_idx: Number.isInteger(q.correct_idx) ? q.correct_idx : 0,
      };
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      version: 'v6.rpc-only-diverse-norepeat',
      questions,
      size: questions.length,
      meta: { rpc_used: true, used_lang: lang }
    });
  } catch (err) {
    console.error('get-questions RPC error:', err);
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
}

/* util */
function safeJsonParse(s, defVal) {
  try { return JSON.parse(s); } catch { return defVal; }
}
