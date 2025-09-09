// pages/api/dbpeek.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

export default async function handler(req, res) {
  const rounds = await supabase
    .from('trivia_rounds')
    .select('id, name, is_active, deadline_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const subs = await supabase
    .from('trivia_submissions')
    .select('round_id, username, correct_count, total_time_ms, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(5);

  res.status(200).json({
    env_url: url,
    rounds: rounds.data,
    rounds_error: rounds.error,
    subs: subs.data,
    subs_error: subs.error,
  });
}
