// pages/api/leaderboard.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Server-side client (service role preferred so RLS never blocks this route)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  const { round_id, debug } = req.query;
  const dbg = {};

  // 1) Try to fetch the requested round by ID — with NO extra filters.
  let round = null;
  if (round_id) {
    const { data, error } = await supabase
      .from('trivia_rounds')
      .select(
        'id,name,status,is_active,start_at,deadline_at,created_at,lang,category'
      )
      .eq('id', round_id)
      .maybeSingle();

    if (error) dbg.roundById = { error: error.message, targetId: round_id };
    else if (!data) dbg.roundById = { error: 'not found', targetId: round_id };
    else round = data;
  }

  // 2) If not found by ID, fall back to the most recently closed round.
  if (!round) {
    const { data, error } = await supabase
      .from('trivia_rounds')
      .select(
        'id,name,status,is_active,start_at,deadline_at,created_at,lang,category'
      )
      .eq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) dbg.latestClosed = { error: error.message };
    else if (data) dbg.latestClosed = { id: data.id };
    round = data ?? null;
  }

  // 3) If still nothing, return empty payload (frontend shows “after closing” msg).
  if (!round) {
    return res
      .status(200)
      .json({ round: null, closed: false, leaderboard: [], total: 0, debug: debug ? dbg : undefined });
  }

  const isClosed = round.status === 'closed';
  if (!isClosed) {
    // Round exists but isn’t closed yet -> no leaderboard
    return res
      .status(200)
      .json({ round, closed: false, leaderboard: [], total: 0, debug: debug ? dbg : undefined });
  }

  // 4) Pull submissions for this round
  const { data: subs, error: subsErr } = await supabase
    .from('trivia_submissions')
    .select('username, correct_count, total_questions, total_time_ms, submitted_at')
    .eq('round_id', round.id)
    .order('correct_count', { ascending: false })
    .order('total_time_ms', { ascending: true })
    .order('submitted_at', { ascending: true });

  if (subsErr) {
    dbg.submissions = { error: subsErr.message };
    return res
      .status(200)
      .json({ round, closed: true, leaderboard: [], total: 0, debug: debug ? dbg : undefined });
  }

  // 5) Build leaderboard
  const leaderboard = (subs || []).map((s, i) => ({
    rank: i + 1,
    username: s.username,
    correct: s.correct_count,
    total: s.total_questions,
    time_ms: s.total_time_ms,
    submitted_at: s.submitted_at,
  }));

  return res
    .status(200)
    .json({ round, closed: true, leaderboard, total: leaderboard.length, debug: debug ? dbg : undefined });
}
