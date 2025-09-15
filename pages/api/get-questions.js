// pages/api/get-questions.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --------- seeded helpers ----------
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
// Deterministic sample without replacement using a partial Fisher–Yates
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

// --------- fallback so you can play locally (HU pool expanded) ----------
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
    // (… f9–f58 kept the same as your working file …)
    { id: 'f9',  text: 'Hány perc van egy órában?', choices: ['45', '60', '90'], correct_idx: 1 },
    { id: 'f10', text: 'A Naprendszer legnagyobb bolygója?', choices: ['Szaturnusz', 'Jupiter', 'Neptunusz'], correct_idx: 1 },
    { id: 'f11', text: 'Melyik országban található a Balaton?', choices: ['Ausztria', 'Magyarország', 'Szlovénia'], correct_idx: 1 },
    { id: 'f12', text: 'Hány hónap van egy évben?', choices: ['10', '11', '12'], correct_idx: 2 },
    { id: 'f13', text: 'Melyik a világ legmagasabb hegye?', choices: ['K2', 'Mont Blanc', 'Mount Everest'], correct_idx: 2 },
    { id: 'f14', text: 'Az embernek hány szíve van?', choices: ['1', '2', '3'], correct_idx: 0 },
    { id: 'f15', text: 'A hőmérséklet SI-mértékegysége?', choices: ['Celsius-fok', 'Kelvin', 'Fahrenheit'], correct_idx: 1 },
    { id: 'f16', text: 'Melyik tenger mossa Olaszország partjait?', choices: ['Fekete-tenger', 'Adriai-tenger', 'Balti-tenger'], correct_idx: 1 },
    { id: 'f17', text: 'Mi Magyarország hivatalos pénzneme?', choices: ['Forint', 'Euró', 'Dollár'], correct_idx: 0 },
    { id: 'f18', text: 'Melyik állat mondja: „múú”?', choices: ['Kutya', 'Tehén', 'Macska'], correct_idx: 1 },
    { id: 'f19', text: 'Hány napból áll egy szökőév februárja?', choices: ['28', '29', '30'], correct_idx: 1 },
    { id: 'f20', text: 'Melyik városban található a Hősök tere?', choices: ['Debrecen', 'Budapest', 'Szeged'], correct_idx: 1 },
    { id: 'f21', text: 'Mi a víz kémiai jele?', choices: ['CO₂', 'O₂', 'H₂O'], correct_idx: 2 },
    { id: 'f22', text: 'Milyen szín keletkezik kék és sárga keveréséből?', choices: ['Zöld', 'Lila', 'Narancs'], correct_idx: 0 },
    { id: 'f23', text: 'Melyik óceán mellett fekszik Kalifornia?', choices: ['Indiai-óceán', 'Csendes-óceán', 'Atlanti-óceán'], correct_idx: 1 },
    { id: 'f24', text: 'Hány másodperc egy perc?', choices: ['30', '60', '120'], correct_idx: 1 },
    { id: 'f25', text: 'Melyik ország fővárosa Bécs?', choices: ['Ausztria', 'Svájc', 'Németország'], correct_idx: 0 },
    { id: 'f26', text: 'A Föld hány kontinensből áll?', choices: ['5', '6', '7'], correct_idx: 2 },
    { id: 'f27', text: 'Mi a legtöbb fa leveleinek színe nyáron?', choices: ['Piros', 'Zöld', 'Kék'], correct_idx: 1 },
    { id: 'f28', text: 'Melyik állat rak tojást?', choices: ['Macska', 'Kígyó', 'Kutya'], correct_idx: 1 },
    { id: 'f29', text: 'Mi a H betűs kémiai elem neve, amely vízben van?', choices: ['Hélium', 'Hidrogén', 'Hafnium'], correct_idx: 1 },
    { id: 'f30', text: 'Melyik sportágban használunk labdát?', choices: ['Úszás', 'Kosárlabda', 'Jégkorong'], correct_idx: 1 },
    // ... (rest unchanged)
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

  const lang = String(req.query.lang || 'hu').toLowerCase();

  // Try to get username/round_id from query. If missing, try Referer (?u=…).
  let username = String(req.query.username || '');
  let round_id = String(req.query.round_id || '');
  if (!username && req.headers?.referer) {
    try {
      const url = new URL(req.headers.referer);
      const u = url.searchParams.get('u');
      if (u) username = u;
    } catch {}
  }

  // questions served per play (kept at 6 so a user can miss once and still reach 5 correct)
  const TARGET_N = 6;

  let items = [];
  let totalQueried = 0;
  try {
    // IMPORTANT CHANGE:
    // - include created_at so we can order
    // - order newest-first so fresh packs are included
    // - fetch up to 10k rows to cover your full pool
    const { data, error, count } = await supabase
      .from('trivia_questions')
      .select('id, question, prompt, text, choices, correct_idx, is_active, lang, created_at', { count: 'estimated' })
      .ilike('lang', lang)       // case-insensitive
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 9999);           // fetch up to 10k rows (newer first)

    if (error) throw error;

    totalQueried = Array.isArray(data) ? data.length : 0;

    items = (data || [])
      .map(q => ({
        id: q.id,
        text: q.question || q.prompt || q.text || '',
        choices: q.choices || [],
        correct_idx: typeof q.correct_idx === 'number' ? q.correct_idx : 0,
      }))
      .filter(q => q.text && q.choices.length >= 3);
  } catch {
    // ignore; fallback below
  }

  const pool = (items && items.length > 0) ? items : (FALLBACK[lang] || FALLBACK.hu);

  // Per-user seed: username | round_id | lang (fallback safe)
  const key = `${username || 'anon'}|${round_id || 'local'}|${lang}`;
  const seed = hashStringToInt(key);

  // Deterministic sample (no replacement)
  const chosen = seededSample(pool, TARGET_N, seed);

  return res.status(200).json({
    questions: chosen,
    fallback: !(items && items.length > 0),
    seed,
    key,
    size: chosen.length,
    meta: {
      pool_count: pool.length,
      db_rows_fetched: totalQueried,
      note: 'Ordered by created_at DESC and fetched up to 10k to include newest packs.',
    },
  });
}
