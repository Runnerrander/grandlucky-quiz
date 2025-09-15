// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---------- tiny helpers ----------
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
    a = (a + 0x6d2b79f5) | 0;
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
function pickTopicMix(items, k, seedInt) {
  // Normalize topic
  const norm = items.map(q => ({
    ...q,
    topic: (q.topic || q.category || 'general').toString().toLowerCase()
  }));
  // Shuffle deterministically
  const shuffled = seededShuffle(norm, seedInt);

  // Bucket by topic
  const buckets = new Map();
  for (const q of shuffled) {
    const key = q.topic;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(q);
  }
  // Round-robin draw: max 2 per topic until we hit k, then fill remainder
  const order = Array.from(buckets.keys());
  const chosen = [];
  let round = 0;
  while (chosen.length < k && round < 2) { // up to 2 per topic on the first two passes
    for (const key of order) {
      const list = buckets.get(key);
      if (list && list.length) {
        chosen.push(list.shift());
        if (chosen.length >= k) break;
      }
    }
    round++;
  }
  // If still short, fill from any remaining
  if (chosen.length < k) {
    for (const key of order) {
      const list = buckets.get(key);
      while (list && list.length && chosen.length < k) {
        chosen.push(list.shift());
      }
      if (chosen.length >= k) break;
    }
  }
  // Ensure unique IDs
  const seen = new Set();
  return chosen.filter(q => (seen.has(q.id) ? false : seen.add(q.id)));
}

// ---------- fallback (bigger than before so it's less repetitive) ----------
const FALLBACK = {
  hu: [
    { id: 'f1',  text: 'Melyik város az USA fővárosa?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic:'geography' },
    { id: 'f2',  text: 'Hány napból áll egy hét?', choices: ['5', '7', '10'], correct_idx: 1, topic:'math' },
    { id: 'f3',  text: 'Melyik ország fővárosa Budapest?', choices: ['Románia', 'Magyarország', 'Szlovákia'], correct_idx: 1, topic:'geography' },
    { id: 'f4',  text: 'Melyik a legnagyobb óceán?', choices: ['Csendes-óceán', 'Atlanti-óceán', 'Indiai-óceán'], correct_idx: 0, topic:'geography' },
    { id: 'f5',  text: 'Mennyi 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, topic:'math' },
    { id: 'f6',  text: 'Ki volt az Egyesült Államok elnöke?', choices: ['George W. Bush', 'Henry Ford', 'Oprah Winfrey'], correct_idx: 0, topic:'history' },
    { id: 'f7',  text: 'Melyik a NBA-csapat?', choices: ['Borussia Dortmund', 'Dallas Mavericks', 'AC Milan'], correct_idx: 1, topic:'sports' },
    { id: 'f8',  text: 'Melyik válogatott nyert FIFA-világbajnokságot?', choices: ['Hollandia', 'Brazília', 'Belgium'], correct_idx: 1, topic:'sports' },
  ],
  en: [
    { id: 'e1', text: 'What is the capital of the USA?', choices: ['Washington, D.C.', 'New York', 'Los Angeles'], correct_idx: 0, topic:'geography' },
    { id: 'e2', text: 'How many days are in a week?', choices: ['5', '7', '10'], correct_idx: 1, topic:'math' },
    { id: 'e3', text: 'Which country has Budapest as its capital?', choices: ['Romania', 'Hungary', 'Slovakia'], correct_idx: 1, topic:'geography' },
    { id: 'e4', text: 'Which is the largest ocean?', choices: ['Pacific', 'Atlantic', 'Indian'], correct_idx: 0, topic:'geography' },
    { id: 'e5', text: 'What is 2 + 2?', choices: ['3', '4', '5'], correct_idx: 1, topic:'math' },
    { id: 'e6', text: 'Who was a U.S. President?', choices: ['Oprah Winfrey', 'George W. Bush', 'Henry Ford'], correct_idx: 1, topic:'history' },
    { id: 'e7', text: 'Which is an NBA team?', choices: ['AC Milan', 'Dallas Mavericks', 'Borussia Dortmund'], correct_idx: 1, topic:'sports' },
    { id: 'e8', text: 'Which national team has won the FIFA World Cup?', choices: ['Belgium', 'Brazil', 'Netherlands'], correct_idx: 1, topic:'sports' },
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Never cache so changes show immediately
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const lang = String(req.query.lang || 'hu').toLowerCase();
  const limitParam = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 6));
  const username = String(req.query.username || '');
  const round_id = String(req.query.round_id || '');
  const key = `${username || 'anon'}|${round_id || 'local'}|${lang}|v1`;
  const seed = hashStringToInt(key);

  let items = [];
  let dbError = null;

  try {
    // IMPORTANT: only select columns that exist in your table
    // (we do NOT ask for 'question' or 'topic' to avoid "column does not exist")
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('id, prompt, text, choices, correct_idx, is_active, lang, category')
      .ilike('lang', lang)
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    items = (data || [])
      .map(q => ({
        id: q.id,
        text: q.prompt || q.text || '',                 // tolerate either column
        choices: Array.isArray(q.choices) ? q.choices : [],
        correct_idx: typeof q.correct_idx === 'number' ? q.correct_idx : 0,
        topic: (q.category || 'general')
      }))
      .filter(q => q.text && q.choices.length >= 3);
  } catch (e) {
    dbError = (e && e.message) || String(e);
  }

  const usedPool = items.length > 0 ? items : (FALLBACK[lang] || FALLBACK.hu);
  const fallback = items.length === 0;

  // Deterministic topic-mix, unique IDs
  const chosen = pickTopicMix(usedPool, limitParam, seed);

  return res.status(200).json({
    version: 'v3.3-topic-mix-unique',
    questions: chosen,
    fallback,
    seed,
    key,
    size: chosen.length,
    meta: {
      pool_unique: usedPool.length,
      topics: Array.from(new Set(usedPool.map(q => (q.topic || 'general')))),
      used_lang: lang,
      env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      env_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      db_error: dbError || null
    }
  });
}
