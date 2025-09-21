// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

/* ------------------------- tiny utils (fallback only) ------------------------- */
function hashStringToInt(str) {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function normalizeTopic(q) {
  const raw = (q.topic || q.category || '').toString().toLowerCase().trim();
  if (raw) return raw;
  const t = (q.text || '').toLowerCase();
  if (/oscar|film|novel|composer|painter|museum/.test(t)) return 'culture';
  if (/nba|world cup|grand prix|f1|olympic|boxing|tennis/.test(t)) return 'sports';
  if (/capital|river|ocean|continent|city|country/.test(t)) return 'geography';
  if (/president|king|emperor|war|revolution|nobel/.test(t)) return 'history';
  if (/plus|minus|sum|how many|hány/.test(t)) return 'math';
  return 'general';
}

/* ------------------------- supabase client ------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ------------------------- handler ------------------------- */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 6));

  // username / round for seeding
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
  if (!username) username = 'anon';

  const version = 'v6.0-supabase-rpc-diverse-with-fallback';
  const seedKey = `${username}|${round_id || 'latest'}|${lang}|${version}`;
  const seed = hashStringToInt(seedKey);

  /* ---------- ensure we have a valid round_id (the SQL function expects it) ---------- */
  let resolvedRoundId = round_id || null;
  try {
    if (!resolvedRoundId) {
      const { data: rounds, error: rerr } = await supabase
        .from('trivia_rounds')
        .select('id')
        .eq('is_active', true)
        .order('start_at', { ascending: false, nullsFirst: false })
        .limit(1);
      if (rerr) throw rerr;
      resolvedRoundId = rounds?.[0]?.id || null;
    }
  } catch (e) {
    // we'll still try RPC with null (will likely return 0 rows), then fallback
  }

  /* ---------- 1) Try the DIVERSE RPC ---------- */
  let rpc_ok = false;
  let rpc_error = null;
  let questions = [];

  try {
    const { data, error } = await supabase.rpc('get_diverse_questions', {
      p_round_id: resolvedRoundId,
      p_username: username,
      p_lang: lang,
      p_n: limit,
    });

    if (error) throw error;

    if (Array.isArray(data) && data.length) {
      rpc_ok = true;
      questions = data.map((row) => {
        const choicesRaw = row.choices_json;
        const choices = Array.isArray(choicesRaw)
          ? choicesRaw
          : (choicesRaw && typeof choicesRaw === 'object' ? Object.values(choicesRaw) : []);
        return {
          id: row.qid,
          text: row.question,
          choices: choices.slice(0, 3),
          correct_idx: row.correct_index ?? 0,
        };
      });
    }
  } catch (e) {
    rpc_ok = false;
    rpc_error = String(e?.message || e) || 'RPC failed';
  }

  /* ---------- 2) Fallback: old tolerant fetch + seeded mix (keeps prior behavior) ---------- */
  if (!rpc_ok || questions.length === 0) {
    try {
      const { data, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .ilike('lang', lang)
        .eq('is_active', true)
        .limit(5000);

      if (error) throw error;

      const pool = (data || [])
        .map((q) => {
          const text = q.prompt || q.question || q.text || '';
          const choices = Array.isArray(q.choices)
            ? q.choices
            : (q.choices && typeof q.choices === 'object' ? Object.values(q.choices) : []);
          const correct_idx = Number.isInteger(q.correct_idx) ? q.correct_idx : 0;
          const topic = normalizeTopic({ ...q, text });
          return { id: String(q.id), text, choices, correct_idx, topic, lang: q.lang || lang };
        })
        .filter((q) => q.text && q.choices.length >= 3);

      // Seeded global order per user/round
      const scored = pool
        .map((q) => ({ ...q, __score: hashStringToInt(`${q.id}|${seedKey}`) }))
        .sort((a, b) => a.__score - b.__score);

      const topicsSet = new Set(scored.map((q) => normalizeTopic(q)));
      const topicsCount = topicsSet.size || 1;
      const softPerTopic = Math.max(1, Math.ceil(limit / topicsCount));

      const usedIds = new Set();
      const counts = Object.create(null);
      const chosen = [];
      let lastTopic = null;

      // Primary pass: cooldown between same topics + soft cap
      for (const q of scored) {
        if (chosen.length >= limit) break;
        if (usedIds.has(q.id)) continue;

        const t = normalizeTopic(q);
        if (topicsCount > 1 && lastTopic && t === lastTopic) continue;
        if ((counts[t] || 0) >= softPerTopic && topicsCount > 1) continue;

        chosen.push(q);
        usedIds.add(q.id);
        counts[t] = (counts[t] || 0) + 1;
        lastTopic = t;
      }

      // Fill pass
      if (chosen.length < limit) {
        for (const q of scored) {
          if (chosen.length >= limit) break;
          if (usedIds.has(q.id)) continue;
          const t = normalizeTopic(q);
          if (topicsCount > 1 && lastTopic && t === lastTopic) continue;
          chosen.push(q);
          usedIds.add(q.id);
          counts[t] = (counts[t] || 0) + 1;
          lastTopic = t;
        }
      }

      // Last resort
      if (chosen.length < limit) {
        for (const q of scored) {
          if (chosen.length >= limit) break;
          if (usedIds.has(q.id)) continue;
          const t = normalizeTopic(q);
          chosen.push(q);
          usedIds.add(q.id);
          counts[t] = (counts[t] || 0) + 1;
          lastTopic = t;
        }
      }

      questions = chosen.slice(0, limit).map((q) => ({
        id: q.id,
        text: q.text,
        choices: q.choices.slice(0, 3),
        correct_idx: q.correct_idx,
      }));
    } catch (e) {
      // If even fallback fails, return empty with error context
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        version,
        questions: [],
        size: 0,
        key: seedKey,
        seed,
        meta: {
          rpc_ok,
          rpc_error,
          fallback_error: String(e?.message || e) || 'fallback failed',
        },
      });
    }
  }

  // topic debug (non-breaking)
  const topic_counts = {};
  try {
    for (const q of questions) {
      const t = normalizeTopic(q);
      topic_counts[t] = (topic_counts[t] || 0) + 1;
    }
  } catch {}

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    version,
    questions,
    size: questions.length,
    key: seedKey,
    seed,
    meta: {
      rpc_ok,
      rpc_error,
      topic_counts,
    },
  });
}
