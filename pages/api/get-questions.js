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
// Deterministic sample without replacement using partial Fisher–Yates
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

// ---------- fallback so you can play locally ----------
const FALLBACK = {
  hu: [
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0 },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
    // … (keeping the rest of your local fallback intact)
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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Strong no-cache (avoid Vercel/browser caching)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const lang = String(req.query.lang || 'hu').toLowerCase();

  // Username / round detection (with Referer ?u= fallback)
  let username = String(req.query.username || '');
  let round_id = String(req.query.round_id || '');
  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      const u = url.searchParams.get('u');
      if (u) username = u;
    } catch {}
  }

  // Serve 6 per play (no structure change)
  const TARGET_N = 6;

  // --------- Paged fetch to include the FULL pool (newest first) ----------
  const PAGE_SIZE = 1000;        // Supabase PostgREST practical max per page
  const MAX_PAGES = 10;          // up to 10k rows
  let page = 0;
  let fetched = [];
  let dbFetches = 0;

  try {
    while (page < MAX_PAGES) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('trivia_questions')
        .select('id, question, prompt, text, choices, correct_idx, is_active, lang, created_at')
        .ilike('lang', lang)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      dbFetches += 1;
      if (error) throw error;

      const chunk = Array.isArray(data) ? data : [];
      fetched = fetched.concat(chunk);

      if (chunk.length < PAGE_SIZE) break; // last page
      page += 1;
    }
  } catch {
    // swallow; we'll use fallback if needed
  }

  // Map + normalize
  let items = (fetched || [])
    .map(q => {
      // choices may be jsonb (array) or text (stringified JSON)
      let choices = q.choices;
      if (typeof choices === 'string') {
        try { choices = JSON.parse(choices); } catch { choices = []; }
      }
      if (!Array.isArray(choices)) choices = [];
      return {
        id: q.id,
        text: q.question || q.prompt || q.text || '',
        choices,
        correct_idx: (typeof q.correct_idx === 'number') ? q.correct_idx : 0,
      };
    })
    .filter(q => q.text && q.choices.length >= 3);

  // De-duplicate by normalized question text to avoid repeats from imports
  const seen = new Set();
  const unique = [];
  for (const q of items) {
    const key = q.text.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }

  const pool = unique.length > 0 ? unique : (FALLBACK[lang] || FALLBACK.hu);

  // Seed = username | round_id | lang
  const key = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(key);

  // Deterministic sample (no replacement)
  const chosen = seededSample(pool, TARGET_N, seed);

  return res.status(200).json({
    questions: chosen,
    fallback: unique.length === 0,
    seed,
    key,
    size: chosen.length,
    meta: {
      pool_unique: unique.length,
      db_pages: dbFetches,
      page_size: PAGE_SIZE,
      note: 'Newest-first, paginated (up to 10k), de-duplicated by question text, cache disabled.',
    },
  });
}
