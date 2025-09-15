// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---------- seeded helpers ----------
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
// Deterministic sample without replacement (partial Fisher–Yates)
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

// ---------- small local fallback so you can still play offline ----------
const FALLBACK = {
  hu: [
    { id: 'f1', text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'f2', text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'f3', text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
    { id: 'f4', text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0 },
    { id: 'f5', text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
    { id: 'f6', text: 'Ki volt az Egyesült Államok elnöke?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0 },
    { id: 'f7', text: 'Melyik a NBA-csapat?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1 },
    { id: 'f8', text: 'Melyik válogatott nyert FIFA-világbajnokságot?', choices: ['Hollandia', 'Brazília', 'Belgium'], correct_idx: 1 },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1 },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0 },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
  ],
};

// ---------- API ----------
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const lang = String(req.query.lang || 'hu').toLowerCase();

  // username / round_id (also try Referer ?u=…)
  let username = String(req.query.username || '');
  let round_id = String(req.query.round_id || '');
  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      const u = url.searchParams.get('u');
      if (u) username = u;
    } catch {}
  }

  // We keep 6 per play — do not change quiz structure
  const TARGET_N = 6;

  // Build per-user seed (bump the version tag to reshuffle after deploys)
  const version = 'v3.4-prompt-only-select';
  const key = `${username || 'anon'}|${round_id || 'local'}|${lang}|${version}`;
  const seed = hashStringToInt(key);

  let db_ok = false;
  let db_error = null;
  let items = [];

  try {
    // IMPORTANT: only select columns that actually exist in your table.
    // Your table has: id (uuid), prompt (text), choices (jsonb), correct_idx (int4),
    // is_active (bool), lang (text), category (text), difficulty (text), created_at.
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id,prompt,choices,correct_idx,is_active,lang,category,difficulty,created_at')
      .ilike('lang', lang)   // case-insensitive match for 'hu' / 'en'
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    // Normalise into our shape, and dedupe by prompt text
    const seen = new Set();
    items = (data || [])
      .map(q => {
        const text = (q?.prompt || '').trim();
        const choices = Array.isArray(q?.choices) ? q.choices : [];
        const correct_idx = typeof q?.correct_idx === 'number' ? q.correct_idx : 0;
        const topic = (q?.category || '').toString().trim().toLowerCase() || 'general';
        return { id: q.id, text, choices, correct_idx, topic };
      })
      .filter(q => q.text && q.choices.length >= 3 && !seen.has(q.text) && seen.add(q.text));

    db_ok = true;
  } catch (e) {
    db_ok = false;
    db_error = (e && e.message) || String(e);
  }

  // Decide pool: DB if available; otherwise fallback for the language
  const usedFallback = !(db_ok && items.length > 0);
  const pool = usedFallback ? (FALLBACK[lang] || FALLBACK.hu) : items;

  // Final deterministic pick (no replacement)
  const chosen = seededSample(pool, TARGET_N, seed);

  return res.status(200).json({
    version,
    questions: chosen,
    fallback: usedFallback,
    seed,
    key,
    size: chosen.length,
    meta: {
      db_ok,
      db_error,
      used_lang: lang,
      pool_size: pool.length,
      pool_unique: chosen.length,
    },
  });
}
