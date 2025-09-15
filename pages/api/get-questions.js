// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

// --- Supabase client (no session persistence) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

// ---------- deterministic RNG helpers ----------
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
// Fisher–Yates with seeded RNG
function seededShuffle(arr, seedInt) {
  const a = arr.slice();
  const r = mulberry32(seedInt);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function seededSample(arr, k, seedInt) {
  if (k >= arr.length) return seededShuffle(arr, seedInt);
  const sh = seededShuffle(arr, seedInt);
  return sh.slice(0, k);
}

// ---------- small local fallback pool (multi-topic) ----------
const FALLBACK = {
  hu: [
    { id: 'f_math_1',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math' },
    { id: 'f_hist_1',  text: 'Ki volt az Egyesült Államok elnöke?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, topic: 'history' },
    { id: 'f_geo_1',   text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'geography' },
    { id: 'f_geo_2',   text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0, topic: 'geography' },
    { id: 'f_sport_1', text: 'Melyik a NBA-csapat?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, topic: 'sports' },
    { id: 'f_cult_1',  text: 'Ki nyert Oscar-díjat a legjobb rendező kategóriában?', choices: ['Ang Lee', 'Kobe Bryant', 'Novak Djokovic'], correct_idx: 0, topic: 'culture' },
  ],
  en: [
    { id: 'e_math_1',  text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math' },
    { id: 'e_hist_1',  text: 'Who was a President of the USA?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, topic: 'history' },
    { id: 'e_geo_1',   text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'geography' },
    { id: 'e_geo_2',   text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0, topic: 'geography' },
    { id: 'e_sport_1', text: 'Which is an NBA team?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, topic: 'sports' },
    { id: 'e_cult_1',  text: 'Who won the Academy Award for Best Director?', choices: ['Ang Lee', 'Kobe Bryant', 'Novak Djokovic'], correct_idx: 0, topic: 'culture' },
  ],
};

// ---------- sampler with light topic-mix (tolerant) ----------
function pickWithTopicMix(pool, takeN, seedInt) {
  // De-dupe by normalized prompt to avoid near-identical repeats
  const seen = new Set();
  const cleaned = [];
  for (const q of pool) {
    const key = (q.text || '').trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    if (!Array.isArray(q.choices) || q.choices.length < 3) continue;
    cleaned.push(q);
    seen.add(key);
  }
  if (cleaned.length === 0) return [];

  // Build topic buckets (fallback to 'general')
  const buckets = new Map();
  for (const q of cleaned) {
    const t = (q.topic || q.category || 'general').toString().toLowerCase();
    if (!buckets.has(t)) buckets.set(t, []);
    buckets.get(t).push(q);
  }

  const rng = mulberry32(seedInt);
  const topics = Array.from(buckets.keys());
  // Shuffle topics deterministically
  const topicOrder = seededShuffle(topics, seedInt);

  const chosen = [];
  // Try to pull at most 1 from the first few topics to ensure variety (up to 4)
  for (const t of topicOrder.slice(0, 4)) {
    const bucket = buckets.get(t) || [];
    if (bucket.length === 0) continue;
    const pick = bucket[Math.floor(rng() * bucket.length)];
    chosen.push(pick);
  }

  // Fill the rest from the whole pool (deterministic order)
  const remaining = takeN - chosen.length;
  if (remaining > 0) {
    const poolShuffled = seededShuffle(cleaned, seedInt ^ 0x9E3779B1);
    // filter out already taken by id
    const takenIds = new Set(chosen.map(q => q.id));
    for (const q of poolShuffled) {
      if (takenIds.has(q.id)) continue;
      chosen.push(q);
      if (chosen.length >= takeN) break;
    }
  }

  return chosen.slice(0, takeN);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Always disable caching for this endpoint
  res.setHeader('Cache-Control', 'no-store');

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const limitParam = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 6));
  const TAKE_N = limitParam >= 6 ? 6 : limitParam; // we serve 6 (game uses 5 to win)

  // username / round_id for deterministic but user-unique sets
  const username = String(req.query.username || req.query.u || '').trim() || 'anon';
  const round_id = String(req.query.round_id || 'local').trim();

  const seedKey = `${username}|${round_id}|${lang}|v4`;
  const seed = hashStringToInt(seedKey);

  // ---- try database first ----
  let pool = [];
  let db_ok = false;
  let db_error = null;

  try {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id, prompt, text, choices, correct_idx, is_active, lang, topic, category')
      .ilike('lang', lang)           // case-insensitive language
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    db_ok = true;

    pool = (data || [])
      .map(q => ({
        id: q.id,
        text: q.prompt || q.text || '',
        choices: q.choices || [],
        correct_idx: typeof q.correct_idx === 'number' ? q.correct_idx : 0,
        topic: q.topic || q.category || 'general',
      }))
      .filter(q => q.text && Array.isArray(q.choices) && q.choices.length >= 3);
  } catch (e) {
    db_ok = false;
    db_error = e?.message || String(e);
  }

  // Fallback if DB empty/broken
  if (!db_ok || pool.length === 0) {
    pool = (FALLBACK[lang] || FALLBACK.hu).slice();
  }

  // Final deterministic pick with light topic mix
  const chosen = pickWithTopicMix(pool, TAKE_N, seed);

  return res.status(200).json({
    version: 'v4.0-topic-mix-deterministic',
    questions: chosen,
    size: chosen.length,
    key: seedKey,
    seed,
    meta: {
      db_ok,
      db_error: db_error || null,
      pool_size: pool.length,
      used_lang: lang,
    },
  });
}
