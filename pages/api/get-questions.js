// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

// Use service role if available (server-side only), else anon for local/dev
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

// ---------- tiny local fallback (so the endpoint still works if DB fails) ----------
const FALLBACK = {
  hu: [
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0 },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
    { id: 'f7',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0 },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
    { id: 'e6', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1 },
    { id: 'e7', text: 'Which ocean borders California?', choices: ['Indian', 'Pacific', 'Atlantic'], correct_idx: 1 },
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Never cache – always hit fresh
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const lang = String(req.query.lang || 'hu').toLowerCase() === 'en' ? 'en' : 'hu';

  // Username/round_id from query or Referer
  let username = String(req.query.username || req.query.u || '');
  let round_id = String(req.query.round_id || '');
  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      const u = url.searchParams.get('u') || url.searchParams.get('username');
      if (u) username = u;
    } catch {}
  }

  // Serve 6 so a player can miss one and still reach 5 correct
  const TARGET_N = 6;

  let items = [];
  let dbError = null;

  try {
    // IMPORTANT: only select columns that actually exist in your table.
    // Your table has `prompt` (text), maybe `text` (text), `choices` (jsonb), `correct_idx` (int4), `is_active` (bool), `lang` (text).
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id, prompt, text, choices, correct_idx, is_active, lang')
      .ilike('lang', lang)        // case-insensitive match for 'hu' / 'en'
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    items = (data || [])
      .map(q => ({
        id: q.id,
        text: (q.prompt || q.text || '').trim(),
        choices: Array.isArray(q.choices) ? q.choices : [],
        correct_idx: typeof q.correct_idx === 'number' ? q.correct_idx : 0,
      }))
      .filter(q =>
        q.text &&
        q.choices &&
        q.choices.length >= 3 &&
        q.correct_idx >= 0 &&
        q.correct_idx < q.choices.length
      );
  } catch (e) {
    dbError = e?.message || String(e);
    // Log on server for debugging (won't expose secrets to client)
    console.error('[get-questions] Supabase error:', dbError);
  }

  const pool = items.length > 0 ? items : (FALLBACK[lang] || FALLBACK.hu);

  // Per-user deterministic seed: username | round_id | lang
  const key = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(key);

  // Deterministic sample without replacement
  const chosen = seededSample(pool, TARGET_N, seed);

  // Response
  return res.status(200).json({
    questions: chosen,
    fallback: items.length === 0,
    seed,
    key,
    size: chosen.length,
    meta: {
      env_url_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      env_key_present: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      fallback_reason: items.length === 0
        ? (dbError ? `Supabase error: ${dbError}` : 'no active questions found for this language')
        : null,
    },
  });
}
