// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

/* ------------------------- seeded helpers (kept for fallback) ------------------------- */
function hashStringToInt(str) {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ------------------------- fallback bank (unchanged) ------------------------- */
const FALLBACK = [
  // history
  { id: 'f_hist_1', text: 'Ki volt az Egyesült Államok elnöke?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, topic: 'history', lang: 'hu' },
  { id: 'f_hist_2', text: 'Who was a U.S. President?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, topic: 'history', lang: 'en' },
  { id: 'f_hist_3', text: 'Ki volt római császár?', choices: ['Xenophon', 'Carus', 'Plutarch'], correct_idx: 1, topic: 'history', lang: 'hu' },
  // geography
  { id: 'f_geo_1', text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'geography', lang: 'hu' },
  { id: 'f_geo_2', text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0, topic: 'geography', lang: 'hu' },
  { id: 'f_geo_3', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0, topic: 'geography', lang: 'en' },
  // sports
  { id: 'f_sport_1', text: 'Melyik a NBA-csapat?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, topic: 'sports', lang: 'hu' },
  { id: 'f_sport_2', text: 'Which is an NBA team?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, topic: 'sports', lang: 'en' },
  // culture
  { id: 'f_cult_1', text: 'Ki nyert Oscar-díjat a legjobb rendező kategóriában?', choices: ['Ang Lee', 'Kobe Bryant', 'Novak Djokovic'], correct_idx: 0, topic: 'culture', lang: 'hu' },
  { id: 'f_cult_2', text: 'Who won the Academy Award for Best Director?', choices: ['Ang Lee', 'Kobe Bryant', 'Novak Djokovic'], correct_idx: 0, topic: 'culture', lang: 'en' },
  // math
  { id: 'f_math_1', text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math', lang: 'hu' },
  { id: 'f_math_2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math', lang: 'en' },
];

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
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/* ------------------------- handler ------------------------- */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const lang = String(req.query.lang || 'hu').toLowerCase();
  // keep supporting both ?limit and ?n
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit ?? req.query.n, 10) || 6));

  // username / round for RPC and fallback seeding
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

  const version = 'v6.rpc-diverse-norepeat';
  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}|${version}`;
  const seed = hashStringToInt(seedKey);

  let rpc_used = false;
  let rpc_error = null;

  try {
    // If we have both username and round_id, prefer the RPC
    if (username && round_id) {
      const { data, error } = await supabase.rpc('get_diverse_questions', {
        p_round_id: round_id,
        p_username: username,
        p_lang: lang,
        p_n: limit,
      });

      if (error) throw error;

      if (Array.isArray(data) && data.length) {
        rpc_used = true;

        const out = data.slice(0, limit).map((q) => {
          // RPC returns { id, question, choices(jsonb), correct_idx, category }
          const choices =
            Array.isArray(q.choices) ? q.choices :
            typeof q.choices === 'string' ? safeJsonParse(q.choices, []) : [];
          return {
            id: String(q.id),
            text: String(q.question ?? ''),   // map to "text" for frontend
            choices: choices.slice(0, 3),
            correct_idx: Number.isInteger(q.correct_idx) ? q.correct_idx : 0,
          };
        });

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
          version,
          questions: out,
          size: out.length,
          key: seedKey,
          seed,
          meta: {
            rpc_used,
            rpc_error,
            pool_size: data.length,
            used_lang: lang,
          },
        });
      }
    }
  } catch (e) {
    rpc_error = String(e?.message || e);
  }

  // ---------- Fallback path (your original logic) ----------
  let pool = [];
  let db_ok = false;
  let db_error = null;

  try {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .ilike('lang', lang)
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    const mapped = (data || [])
      .map((q) => {
        const text = q.prompt || q.question || q.text || '';
        const choices = Array.isArray(q.choices) ? q.choices : [];
        const correct_idx = Number.isInteger(q.correct_idx) ? q.correct_idx : 0;
        const topic = normalizeTopic({ ...q, text });
        return { id: String(q.id), text, choices, correct_idx, topic, lang: q.lang || lang };
      })
      .filter((q) => q.text && q.choices.length >= 3);

    pool = mapped;
    db_ok = true;
  } catch (e) {
    db_ok = false;
    db_error = String(e?.message || e) || 'db failed';
  }

  if (!pool.length) {
    pool = FALLBACK.filter((q) => (q.lang || 'hu').toLowerCase() === lang);
  }

  // per-user global shuffle + soft topic balancing (same as your original)
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

  if (chosen.length < limit) {
    for (const q of scored) {
      if (chosen.length >= limit) break;
      if (usedIds.has(q.id)) continue;
      chosen.push(q);
      usedIds.add(q.id);
    }
  }

  const out = chosen.slice(0, limit).map((q) => ({
    id: q.id,
    text: q.text,
    choices: q.choices.slice(0, 3),
    correct_idx: q.correct_idx,
  }));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    version,
    questions: out,
    size: out.length,
    key: seedKey,
    seed,
    meta: {
      rpc_used,
      rpc_error,
      db_ok,
      db_error,
      pool_size: pool.length,
      used_lang: lang,
    },
  });
}

/* ------------------------- util ------------------------- */
function safeJsonParse(s, defVal) {
  try {
    return JSON.parse(s);
  } catch {
    return defVal;
  }
}
