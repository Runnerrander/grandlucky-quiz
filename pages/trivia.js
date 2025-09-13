// pages/trivia.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";

/**
 * HOW TO ADD ~20,000 QUESTIONS
 * 1) Create /public/questions.json (UTF-8). Structure:
 * [
 *   {
 *     "id": "q-000001",
 *     "locale": "hu",                       // "hu" or "en"
 *     "text": "Melyik város a USA fővárosa?",
 *     "options": ["New York", "Washington, D.C.", "Philadelphia", "Boston"],
 *     "answerIndex": 1,                     // 0-based index in options
 *     "difficulty": 2                       // 1=easy 2=med 3=hard (optional)
 *   },
 *   {
 *     "id": "q-000002",
 *     "locale": "en",
 *     "text": "Which city is the capital of the USA?",
 *     "options": ["New York", "Washington, D.C.", "Philadelphia", "Boston"],
 *     "answerIndex": 1,
 *     "difficulty": 2
 *   }
 *   ...
 * ]
 * 2) Place the file at: /public/questions.json (root/public).
 * 3) This page will fetch it automatically and pick questions deterministically by username.
 */

// LocalStorage keys (kept consistent with earlier pages)
const LS_USERNAME = "gl_username";

// Simple FNV-1a 32-bit hash -> stable numeric seed from username
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h >>> 0) * 0x01000193;
  }
  return h >>> 0;
}

// Deterministic pseudo-RNG (xorshift32)
function makeRng(seed32) {
  let x = seed32 || 123456789;
  return function () {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    // Convert to [0,1)
    return ((x >>> 0) % 0x7fffffff) / 0x7fffffff;
  };
}

// Pick K unique indices using deterministic RNG (no repeats)
function pickUniqueIndices(total, k, rng) {
  const result = [];
  if (k >= total) {
    // Edge case: if fewer questions than needed, just take all in a shuffled order
    const arr = Array.from({ length: total }, (_, i) => i);
    // Fisher–Yates with our RNG
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const used = new Set();
  while (result.length < k) {
    const idx = Math.floor(rng() * total);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(idx);
    }
  }
  return result;
}

export default function TriviaPage() {
  const router = useRouter();
  const [lang, setLang] = useState("hu");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [bank, setBank] = useState([]); // filtered questions by locale
  const [qOrder, setQOrder] = useState([]); // array of indices into bank in deterministic order
  const [qPos, setQPos] = useState(0); // current position in qOrder
  const [choice, setChoice] = useState(null); // selected option index
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [error, setError] = useState("");

  // Read username from URL (?u=...) or localStorage
  useEffect(() => {
    const uParam = typeof router.query.u === "string" ? router.query.u : "";
    let u = (uParam || "").trim();
    if (!u && typeof window !== "undefined") {
      const lu = localStorage.getItem(LS_USERNAME);
      if (lu) u = lu;
    }
    setUsername(u);
  }, [router.query.u]);

  // Fetch question bank (once), then filter by lang
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Try real big bank
        let data = [];
        try {
          const res = await fetch("/questions.json", { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // ignore fetch error → will fall back
        }

        // Fallback set (very small) so page works even if /questions.json missing
        if (!Array.isArray(data) || data.length === 0) {
          data = [
            {
              id: "stub-hu-1",
              locale: "hu",
              text: "Melyik város a USA fővárosa?",
              options: ["New York", "Washington, D.C.", "Philadelphia", "Boston"],
              answerIndex: 1,
              difficulty: 1,
            },
            {
              id: "stub-en-1",
              locale: "en",
              text: "Which city is the capital of the USA?",
              options: ["New York", "Washington, D.C.", "Philadelphia", "Boston"],
              answerIndex: 1,
              difficulty: 1,
            },
            {
              id: "stub-hu-2",
              locale: "hu",
              text: "Hány napból áll egy hét?",
              options: ["5", "6", "7", "8"],
              answerIndex: 2,
              difficulty: 1,
            },
            {
              id: "stub-en-2",
              locale: "en",
              text: "How many days are in a week?",
              options: ["5", "6", "7", "8"],
              answerIndex: 2,
              difficulty: 1,
            },
          ];
        }

        // Filter by language currently selected
        const filtered = data.filter((q) => (q?.locale || "hu") === lang);
        if (abort) return;

        // If almost empty after filter, keep at least something
        const usable = filtered.length > 0 ? filtered : data;

        setBank(usable);
      } catch (e) {
        if (!abort) setError(e?.message || "Failed to load questions.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [lang]);

  // Build a deterministic order (based on username) once bank is ready
  useEffect(() => {
    if (!username || bank.length === 0) return;
    // We’ll pick a pool of 50 for the session (adjust as you like).
    // The quiz ends when the user hits 5 correct answers.
    const SELECTION_POOL = Math.min(50, bank.length);

    const seed = fnv1a(username);
    const rng = makeRng(seed);

    // Optionally bias slightly toward higher difficulties without going extreme:
    // Shuffle by a key that mixes RNG and (difficulty factor).
    const idxs = Array.from({ length: bank.length }, (_, i) => i);
    idxs.sort((a, b) => {
      const da = Math.max(1, bank[a]?.difficulty || 2);
      const db = Math.max(1, bank[b]?.difficulty || 2);
      // weight: small bias (0.15) toward higher difficulty
      const wa = rng() + 0.15 * (da - 2);
      const wb = rng() + 0.15 * (db - 2);
      return wb - wa;
    });

    // Then pick the first SELECTION_POOL unique
    const picked = idxs.slice(0, SELECTION_POOL);

    setQOrder(picked);
    setQPos(0);
    setChoice(null);
    setCorrectCount(0);
    setStartedAt(Date.now());
  }, [username, bank]);

  // Current question
  const current = useMemo(() => {
    if (qOrder.length === 0) return null;
    const idx = qOrder[Math.max(0, Math.min(qPos, qOrder.length - 1))];
    return bank[idx] || null;
  }, [qOrder, qPos, bank]);

  // Submit handler
  const onSubmit = useCallback(() => {
    if (current == null || choice == null) return;

    const isCorrect = choice === (current.answerIndex ?? -1);
    if (isCorrect) {
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);

      if (nextCorrect >= 5) {
        const elapsedMs = Date.now() - startedAt;
        const u = username || "";
        // Route to final page; final will store result (as already set up)
        const params = new URLSearchParams({
          u,
          ms: String(elapsedMs),
        });
        router.push(`/final?${params.toString()}`);
        return;
      }
    }

    // Move forward regardless of correct/incorrect (keeps pace fast)
    setQPos((p) => Math.min(p + 1, qOrder.length - 1));
    setChoice(null);
  }, [current, choice, correctCount, startedAt, username, qOrder.length, router]);

  // UI copy (HU/EN)
  const C = useMemo(
    () =>
      ({
        hu: {
          title: "Kvíz",
          lead: "Válaszd ki a helyes választ! 5 helyes megoldás után továbblépünk.",
          yourUser: "Felhasználó:",
          submit: "Következő",
          select: "Kérjük, jelölj meg egy választ!",
          loading: "Betöltés…",
          err: "Hiba történt a kérdések betöltése közben.",
          switch: "ANGOL",
        },
        en: {
          title: "Trivia",
          lead: "Pick the correct answer. After 5 correct answers you’ll advance.",
          yourUser: "User:",
          submit: "Next",
          select: "Please select an answer.",
          loading: "Loading…",
          err: "An error occurred while loading questions.",
          switch: "MAGYAR",
        },
      })[lang],
    [lang]
  );

  return (
    <main className="screen">
      <Head>
        <title>Trivia — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Top bar (username, language) */}
      <header className="top">
        <div className="who">
          <span>{C.yourUser}</span>
          <strong>{username || "—"}</strong>
        </div>
        <button
          className="lang"
          onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
          aria-label="language-toggle"
        >
          {C.switch}
        </button>
      </header>

      {/* Content area */}
      <section className="wrap">
        <h1 className="title">{C.title}</h1>
        <p className="lead">{C.lead}</p>

        {loading ? (
          <div className="info">{C.loading}</div>
        ) : error ? (
          <div className="err">{C.err}</div>
        ) : !current ? (
          <div className="info">...</div>
        ) : (
          <div className="card">
            <div className="qhead">
              <div className="count">
                <span>
                  {correctCount}/5 <small>✔</small>
                </span>
              </div>
              <div className="qid">
                <small>{current.id || "—"}</small>
              </div>
            </div>

            <div className="qtext">{current.text}</div>

            <div className="opts" role="radiogroup" aria-label="options">
              {current.options?.map((opt, i) => {
                const id = `opt-${i}`;
                return (
                  <label key={id} className={`opt ${choice === i ? "sel" : ""}`}>
                    <input
                      type="radio"
                      name="opt"
                      value={i}
                      checked={choice === i}
                      onChange={() => setChoice(i)}
                    />
                    <span className="txt">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Sticky bottom actions — MOBILE-ONLY visual changes */}
      <footer className="bottom">
        <button
          className="btn"
          disabled={choice == null || loading || !current}
          onClick={onSubmit}
        >
          {current ? C.submit : "…"}
        </button>
      </footer>

      <style jsx>{`
        :global(:root) {
          --bg: #0f0f0f;
          --card: #151515;
          --border: #262626;
          --fg: #f7f7f7;
          --muted: #bdbdbd;
          --yellow: #faaf3b;
          --yellow-border: #e49b28;
          --accent: #2a2a2a;
        }

        .screen {
          min-height: 100svh;
          background: var(--bg);
          color: var(--fg);
          font-family: "Montserrat", system-ui, sans-serif;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .top {
          position: sticky;
          top: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(15, 15, 15, 0.86);
          backdrop-filter: blur(4px);
          border-bottom: 1px solid var(--border);
          z-index: 5;
        }
        .who {
          display: flex;
          gap: 6px;
          align-items: baseline;
          color: var(--muted);
          font-weight: 600;
        }
        .who strong {
          color: var(--fg);
          font-weight: 800;
        }
        .lang {
          padding: 10px 16px;
          border-radius: 999px;
          background: #222;
          border: 1px solid #3a3a3a;
          color: #fff;
          font-weight: 900;
          cursor: pointer;
        }

        .wrap {
          padding: 18px;
          max-width: 940px;
          margin: 0 auto;
          width: 100%;
        }
        .title {
          margin: 6px 0 4px;
          font-size: 28px;
          font-weight: 900;
        }
        .lead {
          margin: 0 0 12px;
          color: var(--muted);
          font-weight: 600;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }
        .qhead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          color: var(--muted);
          font-weight: 700;
        }
        .qtext {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .opts {
          display: grid;
          gap: 10px;
        }
        .opt {
          display: flex;
          gap: 10px;
          align-items: center;
          background: #1a1a1a;
          border: 1px solid #2e2e2e;
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
        }
        .opt input {
          width: 18px;
          height: 18px;
          accent-color: var(--yellow);
          cursor: pointer;
        }
        .opt .txt {
          font-weight: 700;
          line-height: 1.25;
        }
        .opt.sel {
          border-color: var(--yellow-border);
          box-shadow: 0 0 0 1px var(--yellow-border) inset;
        }

        .bottom {
          position: sticky;
          bottom: 0;
          padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
          background: rgba(15, 15, 15, 0.86);
          backdrop-filter: blur(4px);
          border-top: 1px solid var(--border);
          z-index: 5;
        }
        .btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 18px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          color: #1a1a1a;
          background: var(--yellow);
          border: 3px solid var(--yellow-border);
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.28),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
          cursor: pointer;
        }
        .btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* -------- MOBILE-ONLY TWEAKS (desktop unchanged) -------- */
        @media (max-width: 900px) {
          .title {
            font-size: 24px;
          }
          .qtext {
            font-size: 17px;
          }
          .opt .txt {
            font-size: 15px;
          }
          .lang {
            background: var(--yellow);
            color: #1a1a1a;
            border: 3px solid var(--yellow-border);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12),
              inset 0 1.5px 0 rgba(255, 255, 255, 0.65);
          }
        }
      `}</style>
    </main>
  );
}
