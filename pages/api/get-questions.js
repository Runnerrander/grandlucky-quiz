// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

// --- Supabase client (works on Vercel + locally with envs) ---
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

// ---------- tiny local fallback (dev-only) ----------
const FALLBACK = {
  hu: [
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0 },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
    { id: 'f6',  text: 'Melyik kontinensen van Magyarország?', choices: ['Ázsia', 'Európa', 'Afrika'], correct_idx: 1 },
    { id: 'f7',  text: 'Melyik a Föld természetes kísérője?', choices: ['Mars', 'Hold', 'Vénusz'], correct_idx: 1 },
    { id: 'f8',  text: 'Melyik évszak követi a tavaszt?', choices: ['Ősz', 'Tél', 'Nyár'], correct_idx: 2 },
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

  // never cache — we want fresh rotation & new pool immediately
  res.setHeader('Cache-Control', 'no-store');

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const limitParam = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '6'), 10) || 6));
  const TARGET_N = limitParam;

  // Username / round
  let username = String(req.query.username || '').trim();
  let round_id = String(req.query.round_id || '').trim();
  if (!username && req.headers?.referer) {
    try {
      const u = new URL(req.headers.referer).searchParams.get('u');
      if (u) username = u.trim();
    } catch {}
  }
  if (!round_id && req.headers?.referer) {
    try {
      const r = new URL(req.headers.referer).searchParams.get('round_id');
      if (r) round_id = r.trim();
    } catch {}
  }

  // Build per-user seed
  const key = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(key);

  // Try Supabase first: select only columns that EXIST in your table
  // (id, prompt, choices, correct_idx, is_active, lang)
  let items = [];
  let meta = {
    order: null,
    db_pages: 0,
    pool_before_dedupe: 0,
    pool_unique: 0,
    env_url_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    env_key_present: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    fallback_reason: null,
  };

  try {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id,prompt,choices,correct_idx,is_active,lang') // ✅ only existing columns
      .ilike('lang', lang)            // case-insensitive language filter
      .eq('is_active', true)          // only active questions
      .limit(5000);                   // generous cap

    if (error) {
      meta.fallback_reason = `Supabase error: ${error.message}`;
    } else {
      const mapped = (data || [])
        .map(q => ({
          id: q.id,
          text: q.prompt || '',       // 👈 map prompt → text field used by the app
          choices: Array.isArray(q.choices) ? q.choices : [],
          correct_idx: typeof q.correct_idx === 'number' ? q.correct_idx : 0,
        }))
        .filter(q => q.text && q.choices.length >= 3);

      items = mapped;
    }
  } catch (e) {
    meta.fallback_reason = `Supabase client exception: ${e?.message || 'unknown'}`;
  }

  const haveDbPool = items.length > 0;

  // Choose pool
  const pool = haveDbPool ? items : (FALLBACK[lang] || FALLBACK.hu);

  meta.pool_before_dedupe = pool.length;
  meta.pool_unique = pool.length;

  // Deterministic sample
  const chosen = seededSample(pool, TARGET_N, seed);

  return res.status(200).json({
    questions: chosen,
    fallback: !haveDbPool,
    seed,
    key,
    size: chosen.length,
    meta,
  });
}
