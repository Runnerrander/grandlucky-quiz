// pages/trivia.js
import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';

/** Helpers */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
function normalizeQuestion(q) {
  // Normalize shape coming from your API(s)
  // expect: { id?, text, choices[3], correct_idx }
  return {
    id: q.id ?? null,
    text: String(q.text || '').trim(),
    choices: Array.isArray(q.choices) ? q.choices.slice(0, 3) : [],
    correct_idx:
      typeof q.correct_idx === 'number' ? q.correct_idx : Number(q.correct_idx ?? -1),
  };
}
function uniqueByPrompt(list) {
  // Deduplicate by the prompt text only (so templates with different options don't repeat)
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const q = normalizeQuestion(raw);
    const key = q.text.toLowerCase();
    if (!key || seen.has(key)) continue;
    // Guard: only keep valid 3-choice questions with a valid answer index
    if (!Array.isArray(q.choices) || q.choices.length < 3) continue;
    if (q.correct_idx < 0 || q.correct_idx > 2) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

export default function TriviaPage() {
  const router = useRouter();

  // UI state
  const [lang, setLang] = useState('hu');               // default HU
  const [username, setUsername] = useState('');
  const [round, setRound] = useState(null);             // { id }
  const [status, setStatus] = useState('loading');      // loading | no-round | blocked | ready | playing
  const [notice, setNotice] = useState('');

  // game state
  const [pool, setPool] = useState([]);                 // unique, normalized questions
  const [deck, setDeck] = useState([]);                 // shuffled indices into pool
  const [di, setDi] = useState(0);                      // pointer into deck
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);

  const startTimeRef = useRef(null);

  const t = useMemo(() => {
    const hu = {
      title: 'GrandLucky Kvíz',
      start: 'Kvíz indítása',
      played_block: 'Már játszottál ebben a fordulóban ezzel a felhasználónévvel.',
      need_success: 'Hiányzik a felhasználónév. Kérjük, térj vissza a Siker oldalra.',
      no_round: 'Jelenleg nincs aktív forduló.',
      your_user: 'Felhasználóneved',
      correct: 'Helyes!',
      wrong: 'Nem egészen, próbáld újra.',
      next: 'Következő kérdés',
      tie_rule:
        'Döntetlen szabály: Ha azonos befejezési idő szerepel, a korábbi beérkezés élvez elsőbbséget; azonos idő esetén felajánljuk, hogy +5 mp kerül a befejezési idődhöz vagy azonnal új kvízt kezdhetsz, újabb díj nélkül.',
      no_q: 'Nincsenek elérhető kérdések ehhez a nyelvhez/fordulóhoz.',
      retry: 'Újra',
      loading: 'Betöltés…',
      out_of_unique: 'Elfogytak az egyedi kérdések. Kérjük, indítsd újra a kvízt.',
    };
    const en = {
      title: 'GrandLucky Trivia',
      start: 'Start Quiz',
      played_block: 'You’ve already played this round with this username.',
      need_success: 'Username missing. Please go back to the Success page.',
      no_round: 'There is no active round right now.',
      your_user: 'Your Username',
      correct: 'Correct!',
      wrong: 'Not quite, try again.',
      next: 'Next question',
      tie_rule:
        'Tie rule: If an identical finish time exists, the earlier submission wins; if exact tie, we offer +5 seconds to your time OR an immediate retake at no additional payment.',
      no_q: 'No questions are available for this language/round.',
      retry: 'Retry',
      loading: 'Loading…',
      out_of_unique: 'We ran out of unique questions. Please restart the quiz.',
    };
    return lang === 'hu' ? hu : en;
  }, [lang]);

  // Boot once the router is ready
  useEffect(() => {
    if (!router.isReady) return;

    const q = router.query;

    // Language
    const qLang = String(q.lang || '').toLowerCase();
    if (qLang === 'en' || qLang === 'hu') setLang(qLang);

    // Username
    const qUser = typeof q.u === 'string' ? q.u.trim() : '';
    const stored = typeof window !== 'undefined' ? localStorage.getItem('gl_username') : '';
    const useUser = qUser || stored || '';
    if (qUser) {
      try { localStorage.setItem('gl_username', qUser); } catch {}
    }
    setUsername(useUser);

    // Round — prefer explicit round_id param, else ask the server
    const roundIdFromQuery = typeof q.round_id === 'string' ? q.round_id : '';

    const boot = async () => {
      try {
        if (roundIdFromQuery) {
          setRound({ id: roundIdFromQuery });
          // Check if already played (if we have a username)
          if (useUser) {
            try {
              const qs = new URLSearchParams({ username: useUser, round_id: roundIdFromQuery });
              const sResp = await fetch(`/api/submission-status?${qs}`);
              if (sResp.ok) {
                const s = await sResp.json();
                if (s?.hasPlayed) { setStatus('blocked'); return; }
              }
            } catch {}
          }
          setStatus('ready');
          return;
        }

        // fallback: fetch active round from server (cache-busted + no-store)
        const url = `/api/active-round?lang=${encodeURIComponent(lang)}&ts=${Date.now()}`;
        const resp = await fetch(url, { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
        if (!resp.ok) throw new Error('active-round missing');
        const data = await resp.json();

        // Accept multiple shapes from the API
        const activeRoundId =
          (data && (data.round_id || data.roundId || data.id || data?.round?.id)) || null;

        if (!activeRoundId) {
          setStatus('no-round');
          setRound(null);
          return;
        }

        setRound({ id: activeRoundId });

        if (useUser) {
          try {
            const qs = new URLSearchParams({ username: useUser, round_id: activeRoundId });
            const sResp = await fetch(`/api/submission-status?${qs}`);
            if (sResp.ok) {
              const s = await sResp.json();
              if (s?.hasPlayed) { setStatus('blocked'); return; }
            }
          } catch {}
        }

        setStatus('ready');
      } catch {
        setStatus('no-round');
        setRound(null);
      }
    };

    // If no username, still let them see the page (with note)
    if (!useUser) {
      if (roundIdFromQuery) {
        setRound({ id: roundIdFromQuery });
        setStatus('ready');
      } else {
        boot();
      }
    } else {
      boot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]); // eslint-disable-line

  // On HU↔EN toggle, clear any loaded questions and return to "ready".
  // Also reflect the choice in the URL (?lang=...) without a full reload.
  useEffect(() => {
    if (!router.isReady) return;
    const nextQuery = { ...router.query, lang };
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    if (status === 'playing' || status === 'ready') {
      setPool([]);
      setDeck([]);
      setDi(0);
      setCorrectCount(0);
      setFeedback(null);
      setLocked(false);
      if (round) setStatus('ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]); // eslint-disable-line

  // Fetch & build a unique deck
  const fetchUniqueDeck = async (minNeeded = 5) => {
    // First try get-questions with limit=24 (bigger pool)
    const qs = new URLSearchParams({
      lang,
      limit: '24',
      username,
      round_id: round?.id || '',
      ts: String(Date.now()), // cache-bust
    });
    let collected = [];
    try {
      const r = await fetch(`/api/get-questions?${qs}`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        collected = Array.isArray(j?.questions) ? j.questions : [];
      }
    } catch {}

    // Deduplicate by prompt text (stop capital/emperor repeats)
    let uniq = uniqueByPrompt(collected);

    // If we still have too few unique, try a second pull with larger limit (best-effort)
    if (uniq.length < minNeeded) {
      try {
        const qs2 = new URLSearchParams({
          lang,
          limit: '50',
          username,
          round_id: round?.id || '',
          ts: String(Date.now() + 1),
        });
        const r2 = await fetch(`/api/get-questions?${qs2}`, { cache: 'no-store' });
        if (r2.ok) {
          const j2 = await r2.json();
          const more = uniqueByPrompt(j2?.questions || []);
          // merge: prefer first-seen prompt text
          const seen = new Set(uniq.map((q) => q.text.toLowerCase()));
          for (const q of more) {
            const key = q.text.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              uniq.push(q);
            }
          }
        }
      } catch {}
    }

    if (uniq.length < minNeeded) {
      return { ok: false, reason: 'too_few', items: uniq };
    }

    // Build a randomized deck of indices
    const idx = Array.from({ length: uniq.length }, (_, i) => i);
    shuffle(idx);

    setPool(uniq);
    setDeck(idx);
    setDi(0);
    return { ok: true, count: uniq.length };
  };

  // Start quiz: build unique, shuffled deck; no repeats until exhausted.
  const startQuiz = async () => {
    if (!round) return;
    setNotice('');
    setStatus('loading');

    const built = await fetchUniqueDeck(5);
    if (!built.ok) {
      setStatus('ready');
      setNotice(t.out_of_unique);
      return;
    }

    // Start timer when user starts
    startTimeRef.current = Date.now();

    setCorrectCount(0);
    setFeedback(null);
    setLocked(false);
    setStatus('playing');
  };

  // Current question from deck
  const curr = (() => {
    if (!deck.length) return null;
    const idx = deck[Math.max(0, Math.min(di, deck.length - 1))];
    return pool[idx] || null;
  })();

  // One attempt per question, then advance. End at 5 correct.
  const choose = async (idxChoice) => {
    if (!curr || locked) return;
    setLocked(true);

    const isCorrect = idxChoice === curr.correct_idx;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;

    setFeedback({ ok: isCorrect });

    setTimeout(async () => {
      setFeedback(null);

      if (nextCorrect >= 5) {
        setCorrectCount(nextCorrect);
        return finishQuiz(nextCorrect);
      }

      setCorrectCount(nextCorrect);

      // Advance in the deck; if deck exhausted, try refilling once
      if (di + 1 < deck.length) {
        setDi(di + 1);
        setLocked(false);
      } else {
        // Try to fetch a fresh unique deck and continue
        const built = await fetchUniqueDeck(5);
        if (built.ok) {
          setLocked(false);
        } else {
          // Out of unique questions — stop cleanly
          setStatus('ready');
          setNotice(t.out_of_unique);
          setLocked(false);
        }
      }
    }, 350);
  };

  const finishQuiz = async (cc) => {
    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    try {
      await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          round_id: round?.id,
          answers: [],               // not used server-side
          correct_count: cc,
          total_time_ms: elapsed,
        }),
      }).then((r) => r.json()).catch(() => ({}));
    } catch {}

    Router.push(
      `/final?cc=${encodeURIComponent(cc)}&ms=${encodeURIComponent(elapsed)}&round_id=${encodeURIComponent(
        round?.id || ''
      )}&username=${encodeURIComponent(username)}&lang=${encodeURIComponent(lang)}`
    );
  };

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Global reset to stop mobile right-shift/overflow */}
      <style jsx global>{`
        html {
          box-sizing: border-box;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        *, *::before, *::after { box-sizing: inherit; }
        body { margin: 0; overflow-x: hidden; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#111', color: '#fff' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>GrandLucky</div>
          <div>
            <button
              onClick={() => setLang((l) => (l === 'hu' ? 'en' : 'hu'))}
              style={{ background: '#faaf3b', color: '#111', border: 'none', borderRadius: 999, padding: '6px 12px', fontWeight: 700 }}
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 820, width: '100%', margin: '0 auto', padding: '24px' }}>
          {/* Missing username note */}
          {!username && (
            <div style={{ background: '#222', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              {t.need_success}{' '}
              <Link href="/success" style={{ color: '#faaf3b', textDecoration: 'underline' }}>
                Success
              </Link>
            </div>
          )}

          {/* Username display */}
          {username && (
            <div style={{ marginTop: 8, marginBottom: 12, opacity: 0.9, textAlign: 'right' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{t.your_user}</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={username}
              >
                {username}
              </div>
            </div>
          )}

          {/* Notice */}
          {notice && (
            <div style={{ background: '#332', border: '1px solid #553', padding: 12, borderRadius: 10, marginBottom: 12 }}>
              {notice}{' '}
              <button
                onClick={() => { setNotice(''); }}
                style={{ marginLeft: 8, background: 'transparent', border: '1px solid #775', color: '#fff', borderRadius: 8, padding: '2px 8px' }}
              >
                {t.retry}
              </button>
            </div>
          )}

          {/* States */}
          {status === 'loading' && (
            <div style={{ background: '#222', padding: 16, borderRadius: 12 }}>{t.loading}</div>
          )}

          {status === 'no-round' && (
            <div style={{ background: '#222', padding: 16, borderRadius: 12 }}>{t.no_round}</div>
          )}

          {status === 'blocked' && (
            <div style={{ background: '#222', padding: 16, borderRadius: 12, lineHeight: 1.5 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>{t.played_block}</div>
              <div style={{ marginTop: 18, fontSize: 18, color: '#fff', lineHeight: 1.6 }}>{t.tie_rule}</div>
              <div style={{ marginTop: 12 }}>
                <Link href="/" style={{ color: '#faaf3b', textDecoration: 'underline' }}>
                  Home
                </Link>
              </div>
            </div>
          )}

          {status === 'ready' && username && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={startQuiz}
                style={{
                  background: '#000',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {t.start}
              </button>
              <div style={{ marginTop: 24, fontSize: 18, color: '#fff', lineHeight: 1.6, textAlign: 'center' }}>{t.tie_rule}</div>
            </div>
          )}

          {status === 'playing' && deck.length > 0 && curr && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 6 }}>{correctCount}/5</div>
              <div style={{ background: '#222', padding: 20, borderRadius: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, lineHeight: 1.35 }}>{curr.text}</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {curr.choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      disabled={locked}
                      style={{
                        textAlign: 'left',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: 12,
                        padding: '12px 14px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.6 : 1,
                        width: '100%',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {feedback && (
                  <div style={{ marginTop: 12, fontWeight: 700, color: feedback.ok ? '#7fff7f' : '#ff7f7f' }}>
                    {feedback.ok ? t.correct : t.wrong}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />
      </div>
    </>
  );
}
