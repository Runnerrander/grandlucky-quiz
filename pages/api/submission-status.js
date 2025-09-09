// pages/api/submission-status.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { username, round_id } = req.query;
  if (!username || !round_id) return res.status(400).json({ error: 'Missing username or round_id' });

  const { data, error } = await supabase
    .from('trivia_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('username', username)
    .eq('round_id', round_id);

  if (error) return res.status(500).json({ error: error.message });

  const hasPlayed = (data ?? []).length > 0; // head:true returns [] but count is tracked; safe fallback
  return res.status(200).json({ hasPlayed });
}
