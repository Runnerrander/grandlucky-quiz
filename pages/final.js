// pages/final.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FinalPage() {
  const router = useRouter();

  const [lang, setLang] = useState('hu'); // default Hungarian
  const [username, setUsername] = useState('');
  const [roundId, setRoundId] = useState('');
  const [cc, setCc] = useState(0);
  const [ms, setMs] = useState(0);

  // server save status (DB only)
  const [dbState, setDbState] = useState('idle'); // idle | saving | saved | error
  // local file save toast
  const [fileToast, setFileToast] = useState('');

  const t = useMemo(() => {
    const hu = {
      title: 'GrandLucky — Eredmény',
      header1: 'Kvíz sikeresen befejezve!',
      header2: 'Gratulálunk, teljesítetted a kvízt.',
      header3: 'Reméljük, találkozunk a döntőben!',
      your_user: 'Felhasználónév',
      correct: 'Helyes válaszok',
      elapsed: 'Eltelt idő',
      save: 'Eredmény mentése',
      printing: 'Eredmény nyomtatása',
      back: 'Vissza a főoldalra',
      saved_ok: 'Elmentve!',
      saved_fail_prefix: 'Mentés sikertelen. Kérlek próbáld újra. ',
      eng: 'English',
      hun: 'Hungarian'
    };
    const en = {
      title: 'GrandLucky — Result',
      header1: 'Quiz completed!',
      header2: 'Congrats, you finished the quiz.',
      header3: 'See you in the finals!',
      your_user: 'Username',
      correct: 'Correct answers',
      elapsed: 'Elapsed time',
      save: 'Save result',
      printing: 'Print result',
      back: 'Back to home',
      saved_ok: 'Saved!',
      saved_fail_prefix: 'Save failed. Please try again. ',
      eng: 'English',
      hun: 'Magyar'
    };
    return lang === 'hu' ? hu : en;
  }, [lang]);

  useEffect(() => {
    if (!router.isReady) return;

    const q = router.query;

    const qLang = String(q.lang || '').toLowerCase();
    if (qLang === 'en' || qLang === 'hu') setLang(qLang);

    const uFromQuery = typeof q.username === 'string' ? q.username : '';
    const uLocal = typeof window !== 'undefined' ? localStorage.getItem('gl_username') : '';
    const useUser = uFromQuery || uLocal || '';
    setUsername(useUser);

    setRoundId(typeof q.round_id === 'string' ? q.round_id : '');
    setCc(Number(q.cc || 0));
    setMs(Number(q.ms || 0));
  }, [router.isReady, router.query]);

  // One-time DB save on load (does NOT re-fire when pressing Save button)
  useEffect(() => {
    if (!router.isReady) return;
    if (!username || !roundId) return;
    if (!Number.isFinite(cc) || !Number.isFinite(ms)) return;

    let cancelled = false;

    const submit = async () => {
      try {
        setDbState('saving');
        const payload = {
          username,
          round_id: roundId,
          correct_count: cc,
          total_time_ms: ms,
          total_questions: 5, // important for NOT NULL constraint
        };
        const r = await fetch('/api/submit-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error('submit-quiz returned ' + r.status);
        if (!cancelled) setDbState('saved');
      } catch (e) {
        if (!cancelled) setDbState('error');
      }
    };

    submit();
    return () => { cancelled = true; };
  }, [router.isReady, username, roundId, cc, ms]);

  // Formatters
  const formatMs = (value) => {
    const v = Math.max(0, Number(value || 0));
    const s = (v / 1000).toFixed(3);
    return `${s} (${v} ms)`;
  };

  // ===== Save button — browser download (no OS Save dialog) =====
  const handleSaveToFile = () => {
    try {
      const pwd = (typeof window !== 'undefined' && localStorage.getItem('gl_password')) || '';
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const lines = [
        'GrandLucky credentials',
        '',
        `Username: ${username || ''}`,
        `Password: ${pwd || ''}`,
        `Saved at: ${stamp}`,
        '',
        `Round: ${roundId || ''}`,
        `Correct: ${cc}/5`,
        `Time: ${formatMs(ms)}`,
        '',
      ].join('\n');

      const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GrandLucky_${username || 'user'}_${(roundId || '').slice(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      // green toast
      setFileToast(t.saved_ok);
      setTimeout(() => setFileToast(''), 3000);
    } catch (err) {
      alert(t.saved_fail_prefix + (err?.message || ''));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/BG-sikeres%20reg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
            zIndex: 0,
          }}
        />

        {/* Language toggle */}
        <button
          onClick={() => setLang((l) => (l === 'hu' ? 'en' : 'hu'))}
          style={{
            position: 'absolute',
            right: 14,
            top: 14,
            zIndex: 2,
            background: '#faaf3b',
            color: '#111',
            border: 'none',
            borderRadius: 999,
            padding: '6px 12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {lang === 'hu' ? 'English' : 'Magyar'}
        </button>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 880,
            margin: '0 auto',
            padding: '64px 20px 40px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 6, letterSpacing: 0.3 }}>
            {t.header1}
          </h1>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{t.header2}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 26 }}>{t.header3}</div>

          {/* Details block — BIGGER TEXT */}
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              padding: '18px 22px',
              lineHeight: 1.7,
              fontSize: 18, // <— bumped up
              marginBottom: 22,
              textAlign: 'left',
            }}
          >
            <div style={{ opacity: 0.95 }}>
              <strong style={{ fontWeight: 800 }}>{t.your_user}:</strong>{' '}
              <span style={{ fontWeight: 800 }}>{username}</span>
            </div>
            <div style={{ opacity: 0.95 }}>
              <strong style={{ fontWeight: 800 }}>{t.correct}:</strong>{' '}
              <span style={{ fontWeight: 800 }}>{cc} / 5</span>
            </div>
            <div style={{ opacity: 0.95 }}>
              <strong style={{ fontWeight: 800 }}>{t.elapsed}:</strong>{' '}
              <span style={{ fontWeight: 800 }}>{formatMs(ms)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <button
              type="button"
              onClick={handleSaveToFile}
              style={{
                background: '#111',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 12,
                padding: '12px 18px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {t.save}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#111',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 12,
                padding: '12px 18px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {t.printing}
            </button>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                background: '#111',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 12,
                padding: '12px 18px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              {t.back}
            </Link>
          </div>

          {/* File toast */}
          {fileToast && (
            <div
              style={{
                marginTop: 10,
                background: 'rgba(16,120,16,0.85)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 14px',
                borderRadius: 10,
                width: 'fit-content',
                fontWeight: 700,
                marginInline: 'auto',
              }}
            >
              {fileToast}
            </div>
          )}

          {/* DB status (optional, subtle) */}
          {dbState === 'error' && (
            <div
              style={{
                marginTop: 10,
                background: 'rgba(120,16,16,0.85)',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '10px 12px',
                borderRadius: 10,
                width: 'fit-content',
                fontSize: 13,
                marginInline: 'auto',
              }}
            >
              {t.saved_fail_prefix} (DB)
            </div>
          )}
        </div>
      </div>
    </>
  );
}
