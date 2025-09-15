// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---------- deterministic helpers ----------
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
// sample k items without replacement using seeded partial Fisher–Yates
function seededSample(arr, k, seedInt) {
  const rng = mulberry32(seedInt);
  const idx = Array.from({ length: arr.length }, (_, i) => i);
  const take = Math.min(k, idx.length);
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(rng() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, take).map(i => arr[i]);
}

// ---------- tiny local fallback (dev-only) ----------
const FALLBACK = {
  hu: [
    { id: 'f1', text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'f2', text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'f3', text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
    { id: 'f4', text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0 },
    { id: 'f5', text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1 },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0 },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // never cache – we want fresh rotation per request
  res.setHeader('Cache-Control', 'no-store');

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const username = String(req.query.username || req.query.u || '').trim();
  const round_id = String(req.query.round_id || '').trim();
  const limit = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '6'), 10)));

  // stable per-user seed
  const key = `${username || 'anon'}|${round_id || 'R'}|${lang}`;
  const seed = hashStringToInt(key);

  let db_ok = false;
  let db_error = null;
  let items = [];

  try {
    // ✅ SIMPLE, BROAD QUERY — pull everything active for this language
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id, prompt, choices, correct_idx, is_active, lang')
      .eq('is_active', true)
      .ilike('lang', lang)
      .limit(5000);

    if (error) throw error;

    // map/validate
    items = (data || [])
      .map(q => ({
        id: q.id,
        text: q.prompt || '',
        choices: Array.isArray(q.choices) ? q.choices : [],
        correct_idx: typeof q.correct_idx === 'number' ? q.correct_idx : 0,
      }))
      .filter(q => q.text && q.choices.length >= 3);

    // de-dupe identical prompts to avoid repeats
    const seen = new Set();
    items = items.filter(q => {
      const k = q.text.trim().toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    db_ok = true;
  } catch (e) {
    db_error = e?.message || String(e);
  }

  const pool = db_ok && items.length > 0 ? items : (FALLBACK[lang] || FALLBACK.hu);
  const chosen = seededSample(pool, limit, seed);

  return res.status(200).json({
    version: 'v3.5-simple-pool',
    questions: chosen,
    fallback: !(db_ok && items.length > 0),
    seed,
    key,
    size: chosen.length,
    meta: {
      db_ok,
      db_error,
      pool_size: pool.length,
      used_lang: lang,
    },
  });
}
