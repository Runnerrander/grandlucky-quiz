// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

// --- Supabase client (server-side) ---
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
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

// ------- NEW: deterministic stratified pick by topic (round-robin across topics) -------
function stratifiedDeterministicPick(items, k, seedInt) {
  const rng = mulberry32(seedInt);

  // Group by normalized topic
  const buckets = new Map();
  for (const q of items) {
    const raw = (q.topic || '').trim();
    const topic = raw ? raw.toLowerCase() : 'general';
    if (!buckets.has(topic)) buckets.set(topic, []);
    buckets.get(topic).push(q);
  }

  // Shuffle topics and each bucket deterministically
  const topics = shuffleInPlace([...buckets.keys()], rng);
  for (const t of topics) shuffleInPlace(buckets.get(t), rng);

  // Round-robin draw 1-by-1 from each topic until we reach k
  const result = [];
  let changed = true;
  while (result.length < k && changed) {
    changed = false;
    for (const t of topics) {
      const b = buckets.get(t);
      if (b && b.length > 0) {
        result.push(b.shift());
        changed = true;
        if (result.length >= k) break;
      }
    }
  }

  // If some buckets emptied early and we still need more, fill from remaining
  if (result.length < k) {
    const rest = [];
    for (const t of topics) {
      const b = buckets.get(t);
      if (b && b.length) rest.push(...b);
    }
    shuffleInPlace(rest, rng);
    for (const q of rest) {
      if (result.length >= k) break;
      result.push(q);
    }
  }

  return result.slice(0, k);
}

// ---------- tiny local fallback (dev-only) ----------
const FALLBACK = {
  hu: [
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'history' },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math' },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1, topic: 'geography' },
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0, topic: 'geography' },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, topic: 'math' },
    { id: 'f6',  text: 'Melyik kontinensen van Magyarország?', choices: ['Ázsia', 'Európa', 'Afrika'], correct_idx: 1, topic: 'geography' },
    { id: 'f7',  text: 'Melyik a Föld természetes kísérője?', choices: ['Mars', 'Hold', 'Vénusz'], correct_idx: 1, topic: 'science' },
    { id: 'f8',  text: 'Melyik évszak követi a tavaszt?', choices: ['Ősz', 'Tél', 'Nyár'], correct_idx: 2, topic: 'general' },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'history' },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math' },
    { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1, topic: 'geography' },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0, topic: 'geography' },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, topic: 'math' },
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // never cache — we want fresh pool immediately
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const limitParam = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '6'), 10) || 6));
  const TARGET_N = limitParam;

  // Username / round
  let username = String(req.query.username || req.query.u || '').trim();
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
  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(seedKey);

  // Try Supabase: first attempt with `topic`, then fallback without if column missing
  let items = [];
  let meta = {
    used_columns: 'id,prompt,choices,correct_idx,is_active,lang,topic?',
    pool_before_dedupe: 0,
    pool_unique: 0,
    topics_found: [],
    fallback_reason: null,
  };

  async function fetchWith(selectCols) {
    // tolerate is_active imported as bool/string/int
    const q = supabase
      .from('trivia_questions')
      .select(selectCols)
      .ilike('lang', lang)
      .in('is_active', [true, 'true', 'TRUE', 1])
      .limit(5000);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  try {
    // try including topic
    let data = await fetchWith('id,prompt,choices,correct_idx,is_active,lang,topic');
    items = data.map(q => ({
      id: q.id,
      text: (q.prompt || '').trim(),
      choices: Array.isArray(q.choices)
        ? q.choices
        : (typeof q.choices === 'string'
            ? (safeJSON(q.choices) || [])
            : []),
      correct_idx: (typeof q.correct_idx === 'number' && q.correct_idx >= 0) ? q.correct_idx : 0,
      topic: q.topic || 'general',
    })).filter(validQuestion);
    meta.used_columns = 'id,prompt,choices,correct_idx,is_active,lang,topic';
  } catch (e1) {
    try {
      // fallback without topic column
      let data = await fetchWith('id,prompt,choices,correct_idx,is_active,lang');
      items = data.map(q => ({
        id: q.id,
        text: (q.prompt || '').trim(),
        choices: Array.isArray(q.choices)
          ? q.choices
          : (typeof q.choices === 'string'
              ? (safeJSON(q.choices) || [])
              : []),
        correct_idx: (typeof q.correct_idx === 'number' && q.correct_idx >= 0) ? q.correct_idx : 0,
        topic: 'general',
      })).filter(validQuestion);
      meta.used_columns = 'id,prompt,choices,correct_idx,is_active,lang';
      meta.fallback_reason = 'topic column not present; all treated as "general"';
    } catch (e2) {
      meta.fallback_reason = `Supabase error: ${e2?.message || 'unknown'}`;
    }
  }

  // De-duplicate by normalized text (handles accidental double-imports)
  meta.pool_before_dedupe = items.length;
  const seen = new Set();
  const unique = [];
  for (const q of items) {
    const key = q.text.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }
  items = unique;
  meta.pool_unique = items.length;
  meta.topics_found = [...new Set(items.map(q => (q.topic || 'general').toString().toLowerCase()))];

  const haveDbPool = items.length > 0;
  const pool = haveDbPool ? items : (FALLBACK[lang] || FALLBACK.hu);

  // ----- PICK: prefer stratified by topic; if no topics, normal seeded sample -----
  let chosen;
  const anyTopic = haveDbPool && items.some(q => q.topic && q.topic !== 'general');
  if (anyTopic) {
    chosen = stratifiedDeterministicPick(pool, TARGET_N, seed);
  } else {
    chosen = seededSample(pool, TARGET_N, seed);
  }

  return res.status(200).json({
    questions: chosen,
    fallback: !haveDbPool,
    seed,
    key: seedKey,
    size: chosen.length,
    meta,
  });
}

// -------- helpers --------
function safeJSON(s) {
  try { return JSON.parse(s); } catch { return null; }
}
function validQuestion(q) {
  return (
    q.text &&
    Array.isArray(q.choices) &&
    q.choices.length >= 3 &&
    q.correct_idx >= 0 &&
    q.correct_idx < q.choices.length
  );
}
