// pages/api/submit-quiz.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      username,
      round_id,
      correct_count,
      total_time_ms,
      total_questions,
      answers,
    } = req.body || {};

    if (!username || !round_id) {
      return res.status(400).json({ error: 'missing username or round_id' });
    }

    // Default total_questions so DB NOT NULL is always satisfied
    const tq =
      Number.isFinite(Number(total_questions)) && Number(total_questions) > 0
        ? Number(total_questions)
        : 5;

    const payload = {
      username,
      round_id,
      correct_count: Number(correct_count) || 0,
      total_time_ms: Number(total_time_ms) || 0,
      total_questions: tq,
      // let DB default handle this, but if provided use it
      answers: Array.isArray(answers) ? answers : undefined,
    };

    // Upsert to handle the unique (round_id, username) constraint gracefully
    const { data, error } = await supabase
      .from('trivia_submissions')
      .upsert(payload, { onConflict: 'round_id,username' })
      .select('id')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error('submit-quiz error:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
