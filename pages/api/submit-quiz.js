/* eslint-env node */
/* global fetch */

// pages/api/submit-quiz.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function persistResult({ username, round_id, correct, time_ms }) {
  // 1) Try the RPC (if it exists)
  let savedId = null;
  if (supabase) {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('save_quiz_result', {
      p_username: username,
      p_round_id: round_id || null,
      p_correct: typeof correct === 'number' ? correct : 0,
      p_time_ms: typeof time_ms === 'number' ? time_ms : 0,
    });

    if (!rpcErr && rpcData) {
      // rpc can return a table or a scalar; accept both shapes
      if (Array.isArray(rpcData) && rpcData.length && rpcData[0]?.id != null) {
        savedId = rpcData[0].id;
      } else if (typeof rpcData === 'number') {
        savedId = rpcData;
      }
    } else {
      // 2) Fallback: direct insert into quiz_results
      const { data: ins, error: insErr } = await supabase
        .from('quiz_results')
        .insert([{
          username,
          round_id: round_id || null,
          correct: typeof correct === 'number' ? correct : 0,
          time_ms: typeof time_ms === 'number' ? time_ms : 0,
        }])
        .select('id')
        .single();

      if (insErr) {
        return { ok: false, code: insErr.code || 'DB', message: insErr.message || 'Insert failed', hint: insErr.hint || null };
      }
      savedId = ins?.id ?? null;
    }
  }

  return { ok: true, id: savedId };
}

module.exports = async function handler(req, res) {
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
    const round_id = (body.round_id || '').trim() || null;
    const correct = Number.isFinite(body.correct_count) ? body.correct_count : Number(body.correct);
    const time_ms = Number.isFinite(body.total_time_ms) ? body.total_time_ms : Number(body.time_ms);

    if (!username) {
      return res.status(400).json({ ok: false, message: 'Missing username' });
    }
    if (!Number.isFinite(time_ms)) {
      return res.status(400).json({ ok: false, message: 'Missing time_ms' });
    }

    const result = await persistResult({ username, round_id, correct: correct || 0, time_ms });

    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        message: 'Failed to save quiz result',
        details: { code: result.code, message: result.message, hint: result.hint || null },
      });
    }

    return res.status(200).json({
      ok: true,
      saved: { id: result.id },
      username,
      round_id,
      correct: correct || 0,
      time_ms,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: 'Internal error',
      details: String(err && err.message ? err.message : err),
    });
  }
};

module.exports.default = module.exports;
