// pages/api/saveResult.js
import { createClient } from '@supabase/supabase-js';

/** ---------- Supabase (server) ---------- */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

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
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = (body.username || '').trim();
    const round_id = body.round_id || '';
    const correct = Number.isFinite(body.correct) ? Math.trunc(body.correct) : 0;
    const time_ms = Number.isFinite(body.time_ms) ? Math.trunc(body.time_ms) : 0;

    if (!username || !round_id) {
      return res.status(400).json({ ok: false, message: 'Missing username or round_id.' });
    }

    // Idempotency: if a row already exists for this username+round with a nonzero time,
    // just return OK so the button never errors on re-click.
    const { data: existing, error: selErr } = await supabase
      .from('quiz_results')
      .select('id, correct, time_ms')
      .eq('username', username)
      .eq('round_id', round_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!selErr && existing && existing.length) {
      const row = existing[0];
      if (row?.time_ms && row.time_ms > 0) {
        return res.status(200).json({ ok: true, message: 'Already saved', id: row.id });
      }
    }

    // Save (or first-time confirm) via RPC
    const { data, error } = await supabase.rpc('save_quiz_result', {
      p_username: username,
      p_round_id: round_id,
      p_correct: correct,
      p_time_ms: time_ms,
    });

    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'Save failed',
        details: error.message,
        code: error.code || null,
      });
    }

    // RPC may return the inserted row id or void depending on version
    return res.status(200).json({
      ok: true,
      message: 'Saved',
      id: data?.id ?? data ?? null,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: 'Internal error',
      details: String(e?.message || e),
    });
  }
}
