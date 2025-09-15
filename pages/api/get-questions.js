// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

/** ---------- Version tag to verify live code ---------- */
const VERSION = 'v3.2-topic-tolerant-unique-50';

/** ---------- Supabase client ---------- */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** ---------- RNG + sampling helpers (deterministic) ---------- */
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

/** ---------- Topic inference (DB topic column not required) ---------- */
function inferTopicFromText(txt) {
  const s = (txt || '').toLowerCase();
  if (/(president|elnök|washington|lincoln|jefferson|roosevelt|kennedy|nixon|reagan|obama|biden|trump)/i.test(s)) return 'history';
  if (/(capital|főváros|city|város|ország|river|folyó|mount|hegy|lake|tó|continent|kontinens|ocean|óceán|balaton|danube|duna)/i.test(s)) return 'geography';
  if (/(olympic|olimpia|olympics|tokyo|paris 2024|medal|aranyérem|silver|bronze)/i.test(s)) return 'sports';
  if (/(formula\s?1|f1|verstappen|hamilton|ferrari|red bull|mercedes|mclaren|hungaroring)/i.test(s)) return 'sports';
  if (/(boxing|ökölvívás|tyson|ali|mayweather|pacquiao|usyk|fury)/i.test(s)) return 'sports';
  if (/(music|zene|film|movie|mozi|oscar|grammy|artist|singer|director|composer)/i.test(s)) return 'culture';
  if (/(literature|irodalom|novel|regény|poet|költő|writer|író)/i.test(s)) return 'culture';
  if (/(math|matek|algebra|geometry|prím|prime|sum|összeg|percentage|százalék)/i.test(s)) return 'math';
  if (/(physics|chemistry|biology|fizika|kémia|biológia|atom|molecule|cell)/i.test(s)) return 'science';
  if (/(population|népesség|demography|demográfia|gdp|economy|gazdaság)/i.test(s)) return 'demography';
  return 'general';
}

/** ---------- Round-robin topic mix (deterministic) ---------- */
function stratifiedDeterministicPick(items, k, seedInt) {
  const rng = mulberry32(seedInt);
  const buckets = new Map();
  for (const q of items) {
    const topic = (q.topic || 'general').toString().toLowerCase().trim() || 'general';
    if (!buckets.has(topic)) buckets.set(topic, []);
    buckets.get(topic).push(q);
  }
  const topics = shuffleInPlace([...buckets.keys()], rng);
  for (const t of topics) shuffleInPlace(buckets.get(t), rng);

  const result = [];
  let changed = true;
  while (result.length < k && changed) {
    changed = false;
    for (const t of topics) {
      const b = buckets.get(t);
      if (b && b.length) {
        result.push(b.shift());
        changed = true;
        if (result.length >= k) break;
      }
    }
  }
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

/** ---------- Tiny local fallback (dev-only) ---------- */
const FALLBACK = {
  hu: [
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'history' },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math' },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1, topic: 'geography' },
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0, topic: 'geography' },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, topic: 'math' },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic: 'history' },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math' },
    { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1, topic: 'geography' },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0, topic: 'geography' },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, topic: 'math' },
  ],
};

/** ---------- Fetch all pages from Supabase (no `topic` column required) ---------- */
async function fetchAllActiveQuestions(lang) {
  const pageSize = 1000;
  // intentionally NOT requesting "topic" or "text" to avoid missing-column errors
  const cols = 'id,prompt,choices,correct_idx,lang,is_active';
  const rows = [];
  let from = 0;

  while (from < 12000) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('trivia_questions')
      .select(cols)
      .ilike('lang', lang)
      .order('id', { ascending: false })
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  // Accept truthy-ish is_active; allow null/undefined = active
  return rows.filter((q) => {
    const v = q.is_active;
    if (v === null || typeof v === 'undefined') return true;
    if (v === true) return true;
    if (v === 1) return true;
    if (typeof v === 'string' && v.toLowerCase() === 'true') return true;
    return false;
  });
}

/** ---------- Main handler ---------- */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // No cache anywhere
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const langRaw = String(req.query.lang || 'hu').toLowerCase();
  const lang = langRaw === 'en' ? 'en' : 'hu';

  // front-end passes limit=50 — we allow 1..50
  const limitParam = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '50'), 10) || 50));
  const TARGET_N = limitParam;

  // Username / round_id from query or Referer
  let username = String(req.query.username ?? req.query.u ?? '').trim();
  let round_id = String(req.query.round_id ?? '').trim();

  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      username = (url.searchParams.get('u') || url.searchParams.get('username') || '').trim();
    } catch {}
  }
  if (!round_id && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      round_id = (url.searchParams.get('round_id') || '').trim();
    } catch {}
  }

  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(seedKey);

  /** Load from DB */
  let items = [];
  let dbError = null;
  const envOk = Boolean(SUPABASE_URL && SUPABASE_KEY);

  try {
    const rows = await fetchAllActiveQuestions(lang);
    items = rows.map((q) => {
      // choices can be jsonb or a stringified JSON array
      let choices = Array.isArray(q.choices) ? q.choices : [];
      if (!choices.length && typeof q.choices === 'string') {
        try { choices = JSON.parse(q.choices); } catch { choices = []; }
      }
      const text = (q.prompt || '').trim(); // we selected prompt only
      return {
        id: q.id,
        text,
        choices,
        correct_idx: (Number.isInteger(q.correct_idx) && q.correct_idx >= 0) ? q.correct_idx : 0,
        topic: inferTopicFromText(text),
      };
    }).filter(validQuestion);
  } catch (e) {
    dbError = e?.message || String(e);
  }

  /** Fallback to small local pool if DB empty */
  const haveDbPool = items.length > 0;
  const pool = haveDbPool ? items : (FALLBACK[lang] || FALLBACK.hu);

  /** De-duplicate by normalized text */
  const seen = new Set();
  const unique = [];
  for (const q of pool) {
    const key = (q.text || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }

  /** Deterministic mixed-topic pick */
  const anyTopic = unique.some(q => q.topic && q.topic !== 'general');
  const chosen = anyTopic
    ? stratifiedDeterministicPick(unique, TARGET_N, seed)
    : seededSample(unique, TARGET_N, seed);

  return res.status(200).json({
    version: VERSION,
    questions: chosen,
    size: chosen.length,
    fallback: !haveDbPool,
    seed,
    key: seedKey,
    meta: {
      env_url: !!SUPABASE_URL,
      env_key: !!SUPABASE_KEY,
      env_ok: envOk,
      db_error: dbError || null,
      pool_unique: unique.length,
      topics: [...new Set(unique.map(q => q.topic))],
      used_lang: lang,
    },
  });
}

/** ---------- Validate a question ---------- */
function validQuestion(q) {
  return (
    q && q.text &&
    Array.isArray(q.choices) &&
    q.choices.length >= 3 &&
    Number.isInteger(q.correct_idx) &&
    q.correct_idx >= 0 &&
    q.correct_idx < q.choices.length
  );
}
