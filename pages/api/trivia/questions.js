// pages/api/trivia/questions.js
import { createClient } from "@supabase/supabase-js";

/**
 * Always returns questions:
 * - Prefers DB (is_active=true; else all by lang)
 * - Exactly 3 choices per question (correct + 2 wrong)
 * - De-duplicates by prompt
 * - Seeded per (username|round|lang|salt) so different users — and tiebreak runs — get different sets
 * - If DB is too small/empty, augments with a built-in HU/EN fallback bank
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(URL, KEY);

// ---------- Seeded RNG ----------
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const makeRng = (seedStr) => mulberry32(xmur3(seedStr || "seed")());
const shuffleSeeded = (arr, rng) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sampleKSeeded = (arr, k, rng) => shuffleSeeded(arr, rng).slice(0, k);

// ---------- utils ----------
const toInt = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(+v)) {
    return parseInt(v, 10);
  }
  return null;
};
const toChoices = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [v];
    } catch {
      return [v];
    }
  }
  return [];
};
const normKey = (s) =>
  (typeof s === "string" ? s.trim().toLowerCase() : String(s));

// ---------- fallback bank (HU + EN) ----------
const FB_HU = [
  { p: "Mi Magyarország fővárosa?", c: "Budapest", w: ["Debrecen","Szeged","Pécs"] },
  { p: "Melyik a Naprendszer legnagyobb bolygója?", c: "Jupiter", w: ["Szaturnusz","Föld","Mars"] },
  { p: "Melyik óceán a legnagyobb?", c: "Csendes-óceán", w: ["Atlanti-óceán","Indiai-óceán","Jeges-tenger"] },
  { p: "Hány perc egy órában?", c: "60", w: ["30","45","90"] },
  { p: "Melyik állat emlős?", c: "Delfin", w: ["Cápa","Lazac","Kígyó"] },
  { p: "Melyik város híres az Eiffel-toronyról?", c: "Párizs", w: ["London","Róma","Berlin"] },
  { p: "Melyik gáz szükséges a légzéshez?", c: "Oxigén", w: ["Hidrogén","Szén-dioxid","Hélium"] },
  { p: "Melyik a leghosszabb folyó a világon?", c: "Nílus", w: ["Amazonas","Jangce","Duna"] },
  { p: "Melyik évszakban a leghosszabbak a nappalok?", c: "Nyár", w: ["Tél","Tavasz","Ősz"] },
  { p: "Melyik hangszernek van billentyűje?", c: "Zongora", w: ["Hegedű","Fuvola","Dob"] },
  { p: "Melyik kontinensen található Egyiptom?", c: "Afrika", w: ["Európa","Ázsia","Dél-Amerika"] },
  { p: "Melyik elem jele az Fe?", c: "Vas", w: ["Réz","Arany","Ezüst"] },
  { p: "Melyik sportban használnak ütőt és labdát?", c: "Tenisz", w: ["Judo","Úszás","Futás"] },
  { p: "Melyik városban található a Colosseum?", c: "Róma", w: ["Madrid","Athén","Bécs"] },
  { p: "Melyik bolygó a Naphoz legközelebb?", c: "Merkúr", w: ["Vénusz","Mars","Föld"] },
  { p: "Melyik növény fűszer?", c: "Bazsalikom", w: ["Nyírfa","Búza","Napraforgó"] },
  { p: "Melyik országhoz tartozik Tokió?", c: "Japán", w: ["Kína","Dél-Korea","Thaiföld"] },
  { p: "Melyik mértékegység a tömeghez tartozik?", c: "Kilogramm", w: ["Liter","Méternél","Newton"] },
  { p: "Melyik ital készül tealevelekből?", c: "Tea", w: ["Kávé","Kakaó","Limonádé"] },
  { p: "Melyik állat nem tud repülni?", c: "Pingvin", w: ["Sas","Veréb","Denévér"] },
];

const FB_EN = [
  { p: "What is the capital of Italy?", c: "Rome", w: ["Milan","Florence","Naples"] },
  { p: "Which ocean is the largest?", c: "Pacific Ocean", w: ["Atlantic Ocean","Indian Ocean","Arctic Ocean"] },
  { p: "Which planet is the largest?", c: "Jupiter", w: ["Saturn","Earth","Neptune"] },
  { p: "How many minutes are in an hour?", c: "60", w: ["30","45","90"] },
  { p: "Which animal is a mammal?", c: "Dolphin", w: ["Shark","Salmon","Eagle"] },
  { p: "Which city has the Eiffel Tower?", c: "Paris", w: ["London","Berlin","Madrid"] },
  { p: "What metal has the symbol Fe?", c: "Iron", w: ["Gold","Silver","Copper"] },
  { p: "Which river is the longest?", c: "Nile", w: ["Amazon","Yangtze","Mississippi"] },
  { p: "Which instrument has keys?", c: "Piano", w: ["Violin","Flute","Drum"] },
  { p: "Which language is right-to-left?", c: "Arabic", w: ["English","Spanish","French"] },
];

function fbItems(lang) {
  const src = lang === "en" ? FB_EN : FB_HU;
  return src.map((q, i) => ({
    id: `fb-${lang}-${i}`,
    lang,
    prompt: q.p,
    correctValue: q.c,
    wrongPool: q.w.slice(), // >= 2
  }));
}

// ---------- main ----------
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const lang = String(req.query.lang || "hu").slice(0, 8);
    const username = (req.query.username || req.query.u || "").toString().trim();
    const roundId = (req.query.round_id || "").toString().trim();
    const salt = (req.query.salt || "").toString().trim(); // <-- NEW: honor tiebreak salt
    const nRaw = parseInt(req.query.n ?? req.query.count ?? "6", 10);
    const n = Number.isFinite(nRaw) ? Math.min(Math.max(nRaw, 1), 200) : 6;

    // Make seeds include the salt so tiebreak runs get a different pool/order
    const baseRng = makeRng(`${roundId}|${lang}|pool-v6|${salt}`);
    const userRng = makeRng(`${username}|${roundId}|${lang}|user-v6|${salt}`);

    // 1) Fetch DB
    const selectCols =
      "id, lang, prompt, choices, correct_idx, correct_index, is_active";
    let { data: rows, error } = await supabase
      .from("trivia_questions")
      .select(selectCols)
      .eq("lang", lang)
      .eq("is_active", true);

    if (error) throw error;

    if (!rows || rows.length === 0) {
      const fb = await supabase
        .from("trivia_questions")
        .select(selectCols)
        .eq("lang", lang);
      if (fb.error) throw fb.error;
      rows = fb.data || [];
    }

    // 2) Normalize DB rows
    const items = [];
    for (const q of rows || []) {
      if (!q?.prompt) continue;
      const rawChoices = toChoices(q.choices);
      const cleaned = rawChoices
        .map((c) => (typeof c === "string" ? c.trim() : ""))
        .filter((c) => c.length > 0);
      if (cleaned.length < 3) continue;

      // unique by VALUE
      const uniq = [];
      const seen = new Set();
      for (const c of cleaned) {
        const k = normKey(c);
        if (!seen.has(k)) {
          seen.add(k);
          uniq.push(c);
        }
      }
      if (uniq.length < 3) continue;

      const rawIdx =
        toInt(q.correct_idx) ?? toInt(q.correct_index) ?? null;
      if (rawIdx === null) continue;

      const zb = rawIdx === 0 ? 0 : rawIdx - 1; // accept 0- or 1-based
      if (zb < 0 || zb >= uniq.length) continue;

      const correctValue = uniq[zb];
      const wrongPool = uniq.filter((v) => normKey(v) !== normKey(correctValue));
      if (wrongPool.length < 2) continue;

      items.push({
        id: q.id,
        lang: q.lang,
        prompt: q.prompt,
        correctValue,
        wrongPool,
      });
    }

    // 3) Add fallback if pool too small
    let combined = items.slice();
    if (combined.length < Math.max(n * 2, 8)) {
      combined = combined.concat(fbItems(lang));
    }

    if (!combined.length) {
      // FINAL safeguard: never 404 — return some fallback
      combined = fbItems(lang);
    }

    // 4) De-dup by prompt
    const seenPrompt = new Set();
    const uniqueByPrompt = [];
    for (const it of combined) {
      const k = normKey(it.prompt);
      if (!seenPrompt.has(k)) {
        seenPrompt.add(k);
        uniqueByPrompt.push(it);
      }
    }

    // 5) Stable pool order + per-user subset, then build 3 choices
    const orderedPool = shuffleSeeded(uniqueByPrompt, baseRng);
    const nEff = Math.min(n, orderedPool.length);
    const picked = sampleKSeeded(orderedPool, nEff, userRng);

    const questions = picked.map((it) => {
      const wrongs = sampleKSeeded(it.wrongPool, 2, userRng);
      const opts = shuffleSeeded([it.correctValue, ...wrongs], userRng);
      const correct_idx = opts.findIndex(
        (v) => normKey(v) === normKey(it.correctValue)
      );
      return {
        id: it.id,
        lang: it.lang,
        prompt: it.prompt,
        choices: opts,
        correct_idx,
      };
    });

    return res.status(200).json({ questions });
  } catch (e) {
    console.error("[questions API] Error:", e);
    // Still return fallback HU if all else fails to avoid blocking the quiz
    const fallback = fbItems("hu").slice(0, 6).map((it) => {
      const opts = shuffleSeeded([it.correctValue, ...it.wrongPool.slice(0, 2)], makeRng("hard-fallback"));
      const correct_idx = opts.findIndex((v) => normKey(v) === normKey(it.correctValue));
      return { id: it.id, lang: "hu", prompt: it.prompt, choices: opts, correct_idx };
    });
    return res.status(200).json({ questions: fallback });
  }
}
