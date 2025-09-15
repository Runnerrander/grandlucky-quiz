// pages/api/submit-quiz.js
// Stores quiz completion into public.quiz_results

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client (service role required for writes)
const supabase = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : null;

function asInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }
    if (!supabase) {
      return res
        .status(500)
        .json({ ok: false, error: 'Server misconfigured: Supabase env missing' });
    }

    // Support JSON POST or querystring GET
    const src =
      req.method === 'POST' &&
      (req.headers['content-type'] || '').includes('application/json')
        ? (req.body || {})
        : (req.query || {});

    const username = String(src.username || '').trim();
    const ms = asInt(src.ms);
    const correct = asInt(src.correct);
    const round_id = String(src.round_id || 'R1').trim();

    if (!username) return res.status(400).json({ ok: false, error: 'Missing username' });
    if (!Number.isFinite(ms) || ms < 0) return res.status(400).json({ ok: false, error: 'Invalid ms' });
    if (!Number.isFinite(correct) || correct < 0) return res.status(400).json({ ok: false, error: 'Invalid correct' });

    const { data, error } = await supabase
      .from('quiz_results')
      .insert([{ username, time_ms: ms, correct, round_id }])
      .select('*')
      .single();

    if (error) {
      // If there happens to be a unique constraint and we hit it, return existing row instead of failing
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('username', username)
          .eq('round_id', round_id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        return res.status(200).json({
          ok: true,
          id: existing?.id ?? null,
          row: existing || null,
          note: 'duplicate',
        });
      }

      return res.status(500).json({ ok: false, error: error.message || 'DB error' });
    }

    return res.status(200).json({ ok: true, id: data?.id ?? null, row: data || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown server error' });
  }
};
