// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---------- tiny utils ----------
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
function normText(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}
function inferTopic(rec) {
  // Prefer explicit category from DB; fall back to a simple keyword pass
  const raw = (rec.category || rec.topic || '').toString().toLowerCase().trim();
  if (raw) return raw;

  const txt = normText(rec.text);
  if (/olimp/i.test(txt) || /olymp/i.test(txt)) return 'sports';
  if (/grand\s+slam|tennis|formula\s*1|f1|nba|fifa|soccer|football|boxing|muhammad|ali/i.test(txt)) return 'sports';
  if (/country|capital|város|ország|főváros|continent|óceán|tenger|river|folyó|lake|tó/i.test(txt)) return 'geography';
  if (/oscar|film|movie|director|zeneszerző|composer|nobel|laureate|író|writer|rendező|actor|actress/i.test(txt)) return 'culture';
  if (/year|president|elnök|császár|király|king|emperor|háború|war|revolution|forradalom/i.test(txt)) return 'history';
  return 'general';
}

const TARGET_N = 6;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const username = String(req.query.username || '').trim();
  const round_id = String(req.query.round_id || '').trim();
  const poolLimit = Math.max(6, Math.min(1000, parseInt(String(req.query.limit || '50'), 10) || 50));
  const salt = String(process.env.GL_Q_SALT || 'v1');

  const seedKey = `${username || 'anon'}|${round_id || 'local'}|${lang}|${salt}`;
  const seed = hashStringToInt(seedKey);

  let dbError = null;
  let rows = [];

  try {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id, question, prompt, text, choices, correct_idx, is_active, lang, category')
      .ilike('lang', lang)
      .eq('is_active', true)
      .limit(2000);

    if (error) throw error;
    rows = Array.isArray(data) ? data : [];
  } catch (e) {
    dbError = String(e?.message || e) || 'db';
  }

  // Map to unified shape
  let mapped = (rows || [])
    .map(q => ({
      id: q.id,
      text: q.question || q.prompt || q.text || '',
      choices: Array.isArray(q.choices) ? q.choices : [],
      correct_idx: Number.isFinite(q.correct_idx) ? q.correct_idx : 0,
      category: q.category || '',
    }))
    .filter(q => q.text && q.choices.length >= 3);

  // Fallback minimal pool if DB not available
  const FALLBACK = {
    hu: [
      { id: 'f1', text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, category: 'geography' },
      { id: 'f2', text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, category: 'math' },
      { id: 'f3', text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1, category: 'geography' },
      { id: 'f4', text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0, category: 'geography' },
      { id: 'f5', text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, category: 'math' },
      { id: 'f6', text: 'Ki volt az Egyesült Államok elnöke?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, category: 'history' },
      { id: 'f7', text: 'Melyik a NBA-csapat?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, category: 'sports' },
    ],
    en: [
      { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, category: 'geography' },
      { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, category: 'math' },
      { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1, category: 'geography' },
      { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0, category: 'geography' },
      { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, category: 'math' },
      { id: 'e6', text: 'Who was a US President?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, category: 'history' },
      { id: 'e7', text: 'Which is an NBA team?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, category: 'sports' },
    ],
  };

  const usedFallback = !(mapped && mapped.length > 0);
  if (usedFallback) {
    mapped = FALLBACK[lang] || FALLBACK.hu;
  }

  // Deduplicate by normalized text
  const seen = new Set();
  const unique = [];
  for (const q of mapped) {
    const key = normText(q.text);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }

  // Seeded pre-shuffle and clamp the pool size
  const poolShuffled = seededShuffle(unique, seed);
  const pool = poolShuffled.slice(0, Math.min(poolLimit, poolShuffled.length));

  // Bucket by topic
  const buckets = new Map();
  for (const q of pool) {
    const topic = inferTopic(q);
    if (!buckets.has(topic)) buckets.set(topic, []);
    buckets.get(topic).push(q);
  }
  // Shuffle inside each topic with a topic-specific seed
  for (const [topic, arr] of buckets) {
    const tSeed = seed ^ hashStringToInt(topic);
    buckets.set(topic, seededShuffle(arr, tSeed));
  }

  // Round-robin across topics for balance
  const topics = Array.from(buckets.keys());
  const topicOrder = seededShuffle(topics, seed ^ 0x9e3779b9);
  const chosen = [];
  const topicIdx = new Array(topicOrder.length).fill(0);

  while (chosen.length < TARGET_N && topicOrder.length > 0) {
    let madeProgress = false;
    for (let i = 0; i < topicOrder.length && chosen.length < TARGET_N; i++) {
      const t = topicOrder[i];
      const idx = topicIdx[i];
      const arr = buckets.get(t) || [];
      if (idx < arr.length) {
        const q = arr[idx];
        // ensure no duplicate text sneaks in
        if (!chosen.some(c => normText(c.text) === normText(q.text))) {
          chosen.push(q);
        }
        topicIdx[i] = idx + 1;
        madeProgress = true;
      }
    }
    if (!madeProgress) break; // no more to pull
  }

  // If still short, top up from the remaining pool (already shuffled)
  if (chosen.length < TARGET_N) {
    for (const q of pool) {
      if (chosen.length >= TARGET_N) break;
      if (!chosen.some(c => normText(c.text) === normText(q.text))) {
        chosen.push(q);
      }
    }
  }

  // Final safety clamp
  const final = chosen.slice(0, TARGET_N).map(q => ({
    id: q.id,
    text: q.text,
    choices: q.choices.slice(0, 3),
    correct_idx: q.correct_idx,
  }));

  // Meta to help you confirm uniqueness quickly in the browser
  const meta = {
    version: 'v3.2-topic-tolerant-unique-50',
    key: seedKey,
    seed,
    pool_unique: unique.length,
    topics: topicOrder,
    used_lang: lang,
    env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    env_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    db_error: dbError,
  };

  return res.status(200).json({
    questions: final,
    fallback: usedFallback,
    meta,
  });
}
