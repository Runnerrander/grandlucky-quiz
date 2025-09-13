// pages/trivia.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";

const LS_USERNAME = "gl_username";

// --- Utilities ------------------------------------------------------

// FNV-1a 32-bit
function fnv1a(str) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h >>> 0) * 0x01000193;
  }
  return h >>> 0;
}

// xorshift32 PRNG -> [0,1)
function makeRng(seed32) {
  let x = seed32 || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 0x7fffffff) / 0x7fffffff;
  };
}

// Fisher–Yates with custom RNG (in place)
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Page -----------------------------------------------------------

export default function TriviaPage() {
  const router = useRouter();

  const [lang, setLang] = useState("hu");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Full bank (raw) + filtered by lang
  const [bank, setBank] = useState([]);          // filtered current locale
  const [order, setOrder] = useState([]);        // array of indices into bank (shuffled, all unique)
  const [optMap, setOptMap] = useState({});      // q.id -> { options, answerIndex } shuffled per user

  // Quiz progress
  const [pos, setPos] = useState(0);             // 0..order.length-1
  const [choice, setChoice] = useState(null);    // selected option idx (after shuffle)
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  // Read username from URL or localStorage
  useEffect(() => {
    const fromUrl = typeof router.query.u === "string" ? router.query.u.trim() : "";
    if (fromUrl) {
      setUsername(fromUrl);
      return;
    }
    if (typeof window !== "undefined") {
      const lu = localStorage.getItem(LS_USERNAME) || "";
      setUsername(lu.trim());
    }
  }, [router.query.u]);

  // Load questions.json (fallback included)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        let data = [];
        try {
          const res = await fetch("/questions.json", { cache: "no-store" });
          if (res.ok) data = await res.json();
        } catch {
          // ignore fetch errors
        }

        if (!Array.isArray(data) || data.length === 0) {
          // Small fallback so the page still works
          data = [
            {
              id: "stub-hu-1",
              locale: "hu",
              text: "Melyik város az USA fővárosa?",
              options: ["New York", "Washington, D.C.", "Philadelphia", "Boston"],
              answerIndex: 1,
              difficulty: 1,
            },
            {
              id: "stub-hu-2",
              locale: "hu",
              text: "Hány másodperc van egy percben?",
              options: ["50", "55", "60", "65"],
              answerIndex: 2,
              difficulty: 1,
            },
            {
              id: "stub-hu-3",
              locale: "hu",
              text: "Melyik állam New York városának otthona?",
              options: ["New Jersey", "New York", "Connecticut", "Pennsylvania"],
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
              id: "stub-en-2",
              locale: "en",
              text: "How many seconds are in a minute?",
              options: ["50", "55", "60", "65"],
              answerIndex: 2,
              difficulty: 1,
            },
            {
              id: "stub-en-3",
              locale: "en",
              text: "Which state is home to New York City?",
              options: ["New Jersey", "New York", "Connecticut", "Pennsylvania"],
              answerIndex: 1,
              difficulty: 1,
            },
          ];
        }

        if (ignore) return;

        const filtered = data.filter((q) => (q?.locale || "hu") === lang);
        setBank(filtered.length ? filtered : data);
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load questions.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [lang]);

  // Build deterministic order (ALL questions, no repeats) and per-question option shuffles
  useEffect(() => {
    if (!username || bank.length === 0) return;

    const seed = fnv1a(username);
    const rng = makeRng(seed);

    // 1) Order of questions: shuffle all indices using seeded Fisher–Yates
    const idxs = Array.from({ length: bank.length }, (_, i) => i);
    shuffleInPlace(idxs, rng);

    // 2) Per-question option order: seeded by username + q.id
    const map = {};
    for (const i of idxs) {
      const q = bank[i];
      const optIdx = Array.from({ length: q.options.length }, (_, k) => k);
      const optRng = makeRng(fnv1a(`${username}|${q.id || i}`));
      shuffleInPlace(optIdx, optRng);
      const shuffledOptions = optIdx.map((k) => q.options[k]);
      const newAnswerIndex = optIdx.indexOf(q.answerIndex);
      map[q.id || String(i)] = { options: shuffledOptions, answerIndex: newAnswerIndex };
    }

    setOrder(idxs);
    setOptMap(map);
    setPos(0);
    setChoice(null);
    setCorrectCount(0);
    setStartedAt(Date.now());
  }, [username, bank]);

  // Current question (with shuffled options from optMap)
  const current = useMemo(() => {
    if (order.length === 0) return null;
    const idx = order[Math.max(0, Math.min(pos, order.length - 1))];
    const base = bank[idx];
    if (!base) return null;
    const keyed = optMap[base.id || String(idx)];
    if (!keyed) return base;
    return {
      ...base,
      options: keyed.options,
      answerIndex: keyed.answerIndex,
    };
  }, [order, pos, bank, optMap]);

  // Submit logic
  const onSubmit = useCallback(() => {
    if (!current || choice == null) return;
    const isCorrect = choice === (current.answerIndex ?? -1);

    if (isCorrect) {
      const next = correctCount + 1;
      setCorrectCount(next);
      if (next >= 5) {
        const elapsedMs = Date.now() - startedAt;
        const params = new URLSearchParams({
          u: username || "",
          ms: String(elapsedMs),
        });
        // Hand over to /final (already stores result in Supabase)
        router.push(`/final?${params.toString()}`);
        return;
      }
    }

    // Advance to next question (no wrap; but order contains ALL, so plenty)
    setPos((p) => Math.min(p + 1, order.length - 1));
    setChoice(null);
  }, [current, choice, correctCount, startedAt, username, order.length, router]);

  // --- Copy (HU/EN) -------------------------------------------------
  const C = useMemo(
    () =>
      ({
        hu: {
          title: "Kvíz",
          lead: "Válaszd ki a helyes választ! 5 helyes megoldás után továbblépünk.",
          yourUser: "Felhasználó:",
          submit: "Következő",
          loading: "Betöltés…",
          err: "Hiba történt a kérdések betöltése közben.",
          switch: "ANGOL",
        },
        en: {
          title: "Trivia",
          lead: "Pick the correct answer. After 5 correct answers you’ll advance.",
          yourUser: "User:",
          submit: "Next",
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

      {/* Top */}
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

      {/* Body */}
      <section className="wrap">
        <h1 className="title">{C.title}</h1>
        <p className="lead">{C.lead}</p>

        {loading ? (
          <div className="info">{C.loading}</div>
        ) : error ? (
          <div className="err">{C.err}</div>
        ) : !current ? (
          <div className="info">…</div>
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
              {current.options?.map((opt, i) => (
                <label
                  key={`opt-${i}`}
                  className={`opt ${choice === i ? "sel" : ""}`}
                >
                  <input
                    type="radio"
                    name="opt"
                    value={i}
                    checked={choice === i}
                    onChange={() => setChoice(i)}
                  />
                  <span className="txt">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bottom (sticky). On desktop it looks the same; MOBILE tweaks are in media query only */}
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
        .who strong { color: var(--fg); font-weight: 800; }
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
        .title { margin: 6px 0 4px; font-size: 28px; font-weight: 900; }
        .lead  { margin: 0 0 12px; color: var(--muted); font-weight: 600; }

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
        .qtext { font-size: 18px; font-weight: 800; margin-bottom: 12px; }
        .opts { display: grid; gap: 10px; }
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
          width: 18px; height: 18px;
          accent-color: var(--yellow);
          cursor: pointer;
        }
        .opt .txt { font-weight: 700; line-height: 1.25; }
        .opt.sel {
          border-color: var(--yellow-border);
          box-shadow: 0 0 0 1px var(--yellow-border) inset;
        }

        .bottom {
          position: sticky;
          bottom: 0;
          padding: 12px 18px;
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
        .btn[disabled] { opacity: 0.6; cursor: not-allowed; }

        /* -------- MOBILE-ONLY (desktop untouched) -------- */
        @media (max-width: 900px) {
          .title { font-size: 24px; }
          .qtext { font-size: 17px; }
          .opt .txt { font-size: 15px; }
          .wrap { padding-bottom: 90px; } /* breathing room above sticky footer */
          .bottom { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
          .lang {
            background: var(--yellow);
            color: #1a1a1a;
            border: 3px solid var(--yellow-border);
            box-shadow: 0 8px 16px rgba(0,0,0,0.12), inset 0 1.5px 0 rgba(255,255,255,0.65);
          }
        }
      `}</style>
    </main>
  );
}
