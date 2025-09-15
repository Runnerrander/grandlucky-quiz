// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

/* ------------------------- seeded helpers ------------------------- */
function hashStringToInt(str) {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------- fallback bank ------------------------- */
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

  const version = 'v5.5.user-hash-mix-norepeat';
  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}|${version}`;
  const seed = hashStringToInt(seedKey);

  /* ---------- pull pool (tolerant mapping) ---------- */
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

    const mapped = (data || []).map((q) => {
      const text = q.prompt || q.question || q.text || '';
      const choices = Array.isArray(q.choices) ? q.choices : [];
      const correct_idx = Number.isInteger(q.correct_idx) ? q.correct_idx : 0;
      const topic = normalizeTopic({ ...q, text });
      return { id: String(q.id), text, choices, correct_idx, topic, lang: q.lang || lang };
    }).filter((q) => q.text && q.choices.length >= 3);

    pool = mapped;
    db_ok = true;
  } catch (e) {
    db_ok = false;
    db_error = String(e?.message || e) || 'db failed';
  }

  if (!pool.length) {
    pool = FALLBACK.filter((q) => (q.lang || 'hu').toLowerCase() === lang);
  }

  /* ---------- per-user global shuffle + topic balancing ---------- */
  // score each question by hashing (id + seedKey) to create a user-specific global order
  const scored = pool.map((q) => ({
    ...q,
    __score: hashStringToInt(`${q.id}|${seedKey}`)
  })).sort((a, b) => a.__score - b.__score);

  const topicsSet = new Set(scored.map((q) => normalizeTopic(q)));
  const topicsCount = topicsSet.size || 1;

  // soft cap per topic to encourage balance but still allow fill
  const softPerTopic = Math.max(1, Math.ceil(limit / topicsCount));

  const usedIds = new Set();
  const counts = Object.create(null);
  const chosen = [];

  // Do not allow immediate same-topic back-to-back (cooldown = 1)
  let lastTopic = null;

  // Primary pass: respect cooldown + soft per-topic cap
  for (const q of scored) {
    if (chosen.length >= limit) break;
    if (usedIds.has(q.id)) continue;

    const t = normalizeTopic(q);
    if (topicsCount > 1 && lastTopic && t === lastTopic) continue; // no immediate repeat
    if ((counts[t] || 0) >= softPerTopic && topicsCount > 1) continue;

    chosen.push(q);
    usedIds.add(q.id);
    counts[t] = (counts[t] || 0) + 1;
    lastTopic = t;
  }

  // Fill pass: relax per-topic cap, still try to avoid immediate repeats
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

  // Last-resort fill: take anything left (may allow repeat topic) to reach limit
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

  const out = chosen.slice(0, limit).map((q) => ({
    id: q.id,
    text: q.text,
    choices: q.choices.slice(0, 3),
    correct_idx: q.correct_idx
  }));

  // debug topic counts
  const topic_counts = {};
  for (const q of out) {
    const t = normalizeTopic(q);
    topic_counts[t] = (topic_counts[t] || 0) + 1;
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    version,
    questions: out,
    size: out.length,
    key: seedKey,
    seed,
    meta: {
      db_ok,
      db_error,
      pool_size: pool.length,
      used_lang: lang,
      topic_counts
    }
  });
}
