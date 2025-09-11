// pages/final.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

const BG = "/bg-final.jpg"; // lowercase file in /public

export default function Final() {
  const router = useRouter();
  const { username = "", ms = "", correct = "", round_id = "" } = router.query;

  const [lang, setLang] = useState("hu");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const t = useMemo(
    () =>
      ({
        hu: {
          switchLang: "English",
          title: "Kvíz sikeresen befejezve!",
          lead:
            "Gratulálunk, teljesítetted a kvízt. Reméljük, találkozunk a döntőben!",
          username: "Felhasználónév:",
          answers: "Helyes válaszok:",
          elapsed: "Eltelt idő:",
          save: "Eredmény mentése",
          print: "Eredmény nyomtatása",
          back: "Vissza a főoldalra",
          saved: "Eredmény elmentve.",
          saveFailed: "Mentés sikertelen. Kérlek próbáld újra. (DB)",
        },
        en: {
          switchLang: "Magyar",
          title: "Quiz completed successfully!",
          lead:
            "Congrats, you’ve finished the quiz. Hope to see you in the finals!",
          username: "Username:",
          answers: "Correct answers:",
          elapsed: "Elapsed time:",
          save: "Save result",
          print: "Print result",
          back: "Back to homepage",
          saved: "Result saved.",
          saveFailed: "Save failed. Please try again. (DB)",
        },
      } as const)[lang],
    [lang]
  );

  const displayMs = useMemo(() => {
    const n = Number(ms);
    return Number.isFinite(n) ? `${n} ms` : "—";
  }, [ms]);

  // --- Auto-save once when data is present & correct === 5 ---
  const onceRef = useRef(false);
  useEffect(() => {
    if (!router.isReady) return;
    if (onceRef.current) return;

    const c = Number(correct);
    const n = Number(ms);
    if (!username || !Number.isFinite(n) || c !== 5) return;

    onceRef.current = true;
    setSaving(true);
    setErr("");

    const payload = {
      username: String(username),
      ms: n, // API accepts ms; also send time_ms below
      time_ms: n,
      correct: 5,
      round_id: String(round_id || ""),
    };

    const doPost = async () => {
      try {
        const res = await fetch("/api/saveResult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) return true;

        // Fallback to GET for older API routes / deploys
        const qs = new URLSearchParams({
          username: payload.username,
          ms: String(payload.ms),
          correct: String(payload.correct),
          round_id: payload.round_id,
        });
        const res2 = await fetch(`/api/saveResult?${qs.toString()}`, {
          method: "GET",
        });
        return res2.ok;
      } catch {
        return false;
      }
    };

    doPost()
      .then((ok) => {
        if (ok) {
          setSaved(true);
        } else {
          setErr(t.saveFailed);
        }
      })
      .finally(() => setSaving(false));
  }, [router.isReady, username, ms, correct, round_id, t.saveFailed]);

  // Download result as a text file (for the user)
  const onSaveToFile = () => {
    const text = `GrandLucky — Quiz Result
Username: ${username || "-"}
Correct: ${correct || "-"} / 5
Elapsed: ${displayMs}
Round: ${round_id || "-"}
Saved at: ${new Date().toLocaleString()}
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grandlucky-result-${username || "user"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPrint = () => window.print();

  return (
    <main className="screen">
      <Head>
        <title>Final — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Language toggle */}
      <button className="lang" onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}>
        {t.switchLang}
      </button>

      {/* Content without plate/glass card */}
      <div className="wrap">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>

        <div className="rows">
          <Row label={t.username} value={username || "—"} />
          <Row label={t.answers} value={`${correct || 0} / 5`} />
          <Row label={t.elapsed} value={displayMs} />
          {/* Intentionally hidden: round row (requested) */}
        </div>

        <div className="buttons">
          <button className="btn" onClick={onSaveToFile}>{t.save}</button>
          <button className="btn ghost" onClick={onPrint}>{t.print}</button>
          <Link href="/" className="btn">{t.back}</Link>
        </div>

        {!saving && saved && <p className="ok">{t.saved}</p>}
        {!saved && err && <p className="error">{err}</p>}
      </div>

      <style jsx>{`
        :global(:root){
          --fg:#fff;
          --muted:rgba(255,255,255,.88);
          --yellow:#faaf3b;
          --yellow-border:#e49b28;
          --shadow:0 12px 28px rgba(0,0,0,.35);
        }
        .screen{
          min-height:100svh;
          color:var(--fg);
          font-family:Montserrat,system-ui,sans-serif;
          background:
            linear-gradient(120deg, rgba(0,0,0,.66), rgba(0,0,0,.25)),
            url(${JSON.stringify(BG)}) center/cover no-repeat fixed;
          padding:clamp(24px,6vw,46px);
        }
        .lang{
          position:fixed; top:16px; right:16px;
          padding:10px 18px; border-radius:999px; font-weight:900; border:0;
          background:#f6f6f6; color:#1a1a1a; box-shadow:var(--shadow); cursor:pointer;
        }
        .wrap{
          max-width: 820px;
          margin: clamp(60px,10vh,120px) auto;
          text-shadow: 0 1px 0 rgba(0,0,0,.45);
        }
        .title{ margin:0 0 8px; font-size: clamp(32px,5vw,52px); font-weight:900; }
        .lead{ margin:0 0 24px; font-size: clamp(18px,2.2vw,22px); color:var(--muted); }

        .rows{ display:grid; gap:10px; margin: 14px 0 20px; }
        .row{ display:flex; gap:10px; align-items:center; }
        .label{ opacity:.9; min-width: 180px; font-weight:700; }
        .value{
          background: rgba(0,0,0,.38);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 700;
        }

        .buttons{ display:flex; gap:12px; flex-wrap:wrap; margin-top:10px; }
        .btn{
          display:inline-flex; align-items:center; justify-content:center;
          padding:14px 20px; border-radius:999px; font-weight:900; text-transform:uppercase;
          color:#222; background:var(--yellow); border:3px solid var(--yellow-border);
          text-decoration:none; box-shadow:var(--shadow), inset 0 2px 0 rgba(255,255,255,.65);
          transition:transform .2s, box-shadow .2s; cursor:pointer;
        }
        .btn:hover{ transform:translateY(-2px); box-shadow:0 22px 36px rgba(0,0,0,.46), inset 0 2px 0 rgba(255,255,255,.7); }
        .btn.ghost{
          background:transparent; color:#fff; border-color:#fff;
        }

        .ok{
          margin-top:10px; display:inline-block;
          background:rgba(47,128,0,.85); padding:8px 12px; border-radius:8px;
        }
        .error{
          margin-top:10px; display:inline-block;
          background:#7a1f1f; color:#fff; padding:8px 12px; border-radius:8px;
        }

        @media (max-width: 640px){
          .label{ min-width: 140px; }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <style jsx>{``}</style>
    </div>
  );
}
