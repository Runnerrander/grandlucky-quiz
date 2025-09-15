// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

// ----- Robust env detection (works with common Vercel setups) -----
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
// Deterministic sample without replacement
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

// ---------- small local fallback ----------
const FALLBACK = {
  hu: [
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1 },
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0 },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0 },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1 },
    { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1 },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0 },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1 },
  ],
};

// --------- paged fetch helpers (newest-first; fallback to id) ----------
async function fetchPaged(lang, orderField) {
  const PAGE = 1000;
  const MAX = 10;
  let page = 0;
  let rows = [];
  let pages = 0;

  while (page < MAX) {
    const from = page * PAGE;
    const to = from + PAGE - 1;

    const selectCols = ['id','question','prompt','text','choices','correct_idx','is_active','lang'];
    if (orderField === 'created_at') selectCols.push('created_at');

    const q = supabase
      .from('trivia_questions')
      .select(selectCols.join(','))               // include created_at when present
      .ilike('lang', lang);                       // case-insensitive match

    // Be tolerant to CSV-imported values: true | 'true' | 1
    // Supabase JS supports .in on booleans/ints/strings.
    q.in('is_active', [true, 'true', 'TRUE', 1]);

    q.order(orderField, { ascending: false }).range(from, to);

    const { data, error } = await q;
    if (error) throw error;

    const chunk = Array.isArray(data) ? data : [];
    rows = rows.concat(chunk);
    pages += 1;
    if (chunk.length < PAGE) break;
    page += 1;
  }

  return { rows, pages, pageSize: 1000 };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Strong no-cache so Vercel/browser/CDN won’t reuse old JSON
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const lang = String(req.query.lang || 'hu').toLowerCase();

  // Accept username via ?username= OR ?u=
  let username = String(req.query.username || req.query.u || '').trim();
  let round_id = String(req.query.round_id || '').trim();

  // If still no username, try Referer ?u=
  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      const u = url.searchParams.get('u');
      if (u) username = u.trim();
    } catch {}
  }

  const TARGET_N = 6;

  let fetched = [];
  const meta = {
    order: null,
    db_pages: 0,
    pool_before_dedupe: 0,
    pool_unique: 0,
    env_url_present: Boolean(SUPABASE_URL),
    env_key_present: Boolean(SUPABASE_KEY),
    fallback_reason: '',
  };

  try {
    // Try newest-first via created_at; if missing, fall back to id
    try {
      const r = await fetchPaged(lang, 'created_at');
      fetched = r.rows;
      meta.order = 'created_at DESC';
      meta.db_pages = r.pages;
    } catch (e1) {
      const r2 = await fetchPaged(lang, 'id');
      fetched = r2.rows;
      meta.order = 'id DESC';
      meta.db_pages = r2.pages;
      meta.fallback_reason = 'created_at missing or not selectable; used id';
    }
  } catch (e) {
    meta.fallback_reason = `Supabase error: ${e?.message || 'unknown'}`;
    // fall through to local fallback
  }

  // Normalize & filter
  let items = (fetched || []).map(q => {
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
  }).filter(q => q.text && q.choices.length >= 3);

  meta.pool_before_dedupe = items.length;

  // De-duplicate by normalized text (handles accidental double-imports)
  const seen = new Set();
  const unique = [];
  for (const q of items) {
    const key = q.text.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }
  meta.pool_unique = unique.length;

  const pool = unique.length > 0 ? unique : (FALLBACK[lang] || FALLBACK.hu);

  // Seed = username | round_id | lang
  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(seedKey);

  const chosen = seededSample(pool, TARGET_N, seed);

  return res.status(200).json({
    questions: chosen,
    fallback: unique.length === 0,
    seed,
    key: seedKey,
    size: chosen.length,
    meta,
  });
}
