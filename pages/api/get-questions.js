// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---- tiny seeded helpers ----------------------------------------------------
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
function seededShuffle(arr, seedInt) {
  const rng = mulberry32(seedInt);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- safer fallback (multiple per topic so it can actually vary) ------------
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

  // math / general
  { id: 'f_math_1', text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math', lang: 'hu' },
  { id: 'f_math_2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, topic: 'math', lang: 'en' },
];

// Normalize topic from `topic` or `category` or last-resort guess
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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 6));

  // username / round_id for seeding
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

  const version = 'v5.4.hu-balanced+pad-rr';
  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}|${version}`;
  const seed = hashStringToInt(seedKey);

  // ---------- fetch from DB (tolerant) ----------
  let pool = [];
  let db_ok = false;
  let db_error = null;

  try {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .ilike('lang', lang)       // case-insensitive 'hu'/'en'
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    const mapped = (data || []).map(q => {
      const text = q.prompt || q.question || q.text || '';
      const choices = Array.isArray(q.choices) ? q.choices : [];
      const correct_idx = Number.isInteger(q.correct_idx) ? q.correct_idx : 0;
      const topic = normalizeTopic({ ...q, text });
      return { id: q.id, text, choices, correct_idx, topic, lang: q.lang || lang };
    }).filter(q => q.text && q.choices.length >= 3);

    pool = mapped;
    db_ok = true;
  } catch (e) {
    db_ok = false;
    db_error = String(e?.message || e) || 'db failed';
  }

  // If DB empty/failed, use language-filtered fallback
  const fbPoolLang = FALLBACK.filter(q => (q.lang || 'hu').toLowerCase() === lang);
  if (!pool.length) {
    pool = fbPoolLang.slice();
  }

  // ---------- topic-mix, then pad missing topics with fallback ----------
  // Bucket by topic from DB
  const byTopic = new Map();
  for (const q of pool) {
    const t = normalizeTopic(q);
    if (!byTopic.has(t)) byTopic.set(t, []);
    byTopic.get(t).push(q);
  }

  const targetDistinctTopics = 4; // ensure at least this many topics appear
  const topicPriority = ['geography', 'history', 'sports', 'culture', 'math', 'general'];

  // If we have too few distinct topics, add fallback topics that are missing
  if (byTopic.size < targetDistinctTopics) {
    const present = new Set(byTopic.keys());
    for (const tp of topicPriority) {
      if (present.size >= targetDistinctTopics) break;
      if (present.has(tp)) continue;
      const adds = fbPoolLang.filter(q => normalizeTopic(q) === tp);
      if (adds.length) {
        byTopic.set(tp, adds.slice());     // add a bucket purely from fallback
        for (const q of adds) pool.push(q); // also let fill-phase see them
        present.add(tp);
      }
    }
  }

  // Seeded shuffle each bucket and rotate starting cursor by a seed-based offset
  const cursors = {};
  for (const [t, arr] of byTopic) {
    const tSeed = hashStringToInt(`${seedKey}|bucket|${t}`);
    const shuffled = seededShuffle(arr, tSeed);
    byTopic.set(t, shuffled);
    const startOffset = Math.floor(mulberry32(tSeed)() * Math.max(1, shuffled.length));
    cursors[t] = startOffset; // start deeper in bucket so users differ more
  }

  // Seeded topic order
  const topics = seededShuffle(Array.from(byTopic.keys()), hashStringToInt(`${seedKey}|topics`));

  // round-robin with “no immediate repeat” guarantee
  const chosen = [];
  const usedIds = new Set();
  const perTopicUsed = {};
  let lastTopic = null;
  let stepsWithoutPick = 0;

  function takeFromTopic(topicName) {
    const bucket = byTopic.get(topicName) || [];
    if (!bucket.length) return null;

    let idx = cursors[topicName] ?? 0;
    for (let tries = 0; tries < bucket.length; tries++) {
      const q = bucket[idx % bucket.length];
      idx++;
      if (!usedIds.has(q.id)) {
        cursors[topicName] = idx;
        usedIds.add(q.id);
        perTopicUsed[topicName] = (perTopicUsed[topicName] || 0) + 1;
        return q;
      }
    }
    cursors[topicName] = idx;
    return null;
  }

  while (chosen.length < limit && stepsWithoutPick < limit * 10) {
    let madePick = false;

    for (let i = 0; i < topics.length && chosen.length < limit; i++) {
      const t = topics[(i + chosen.length) % topics.length];
      if (lastTopic && t === lastTopic && topics.length > 1) continue;

      const q = takeFromTopic(t);
      if (q) {
        chosen.push(q);
        lastTopic = t;
        madePick = true;
      }
    }

    if (!madePick) {
      stepsWithoutPick++;
      break;
    }
  }

  // fill phase: still avoid immediate topic repeats if possible
  if (chosen.length < limit) {
    const flat = seededShuffle(pool, hashStringToInt(`${seedKey}|fill`));
    for (const q of flat) {
      if (chosen.length >= limit) break;
      if (usedIds.has(q.id)) continue;
      const t = normalizeTopic(q);
      if (lastTopic && t === lastTopic && topics.length > 1) continue;
      chosen.push(q);
      usedIds.add(q.id);
      lastTopic = t;
      perTopicUsed[t] = (perTopicUsed[t] || 0) + 1;
    }
  }

  // final trim
  const out = chosen.slice(0, limit).map(q => ({
    id: q.id,
    text: q.text,
    choices: q.choices.slice(0, 3),
    correct_idx: q.correct_idx
  }));

  // quick per-topic counts for debug
  const topic_counts = {};
  for (const q of chosen.slice(0, limit)) {
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
      topics,
      topic_counts
    }
  });
}
