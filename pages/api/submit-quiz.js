// pages/api/submit-quiz.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

// simple UUID checker
const isUuid = (s) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }
  if (!supabase) {
    return res.status(500).json({
      ok: false,
      message: 'Server misconfigured: missing Supabase credentials.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = (body.username || '').trim();
    const round_id = isUuid(body.round_id) ? body.round_id : null;
    const correct = Number.isFinite(body.correct_count) ? body.correct_count : 0;
    const time_ms = Number.isFinite(body.total_time_ms) ? body.total_time_ms : 0;

    if (!username) {
      return res.status(400).json({ ok: false, message: 'Missing username' });
    }

    // Call the secure RPC you just created
    const { data, error } = await supabase.rpc('save_quiz_result', {
      p_username: username,
      p_round_id: round_id,   // null is fine if you don’t have it
      p_correct: correct,
      p_time_ms: time_ms,
    });

    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'Failed to save quiz result',
        details: { code: error.code, message: error.message, hint: error.hint ?? null },
      });
    }

    return res.status(200).json({ ok: true, saved: data || null });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: 'Internal error',
      details: String(err && err.message ? err.message : err),
    });
  }
}
