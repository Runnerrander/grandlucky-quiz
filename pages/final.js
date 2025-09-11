// pages/final.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

const BG_FINAL = "/bg-final.jpg"; // <-- lowercase public image

export default function Final() {
  const router = useRouter();
  const { ms, username, round_id } = router.query;

  const [lang, setLang] = useState("hu");
  const [savedOk, setSavedOk] = useState(null); // null | true | false
  const savedOnce = useRef(false); // ensure we save only once

  const t = useMemo(
    () =>
      ({
        hu: {
          title: "Kvíz sikeresen befejezve!",
          congrats: "Gratulálunk, teljesítetted a kvízt.",
          meet: "Reméljük, találkozunk a döntőben!",
          user: "Felhasználónév",
          correct: "Helyes válaszok",
          elapsed: "Eltelt idő",
          round: "Forduló", // we’ll hide visually as requested
          save: "Eredmény mentése",
          print: "Eredmény nyomtatása",
          back: "Vissza a főoldalra",
          saveFail: "Mentés sikertelen. Kérlek próbáld újra. (DB)",
          saved: "Eredmény elmentve.",
          toggle: "English",
        },
        en: {
          title: "Quiz completed successfully!",
          congrats: "Congratulations, you’ve finished the quiz.",
          meet: "Hope to see you in the finals!",
          user: "Username",
          correct: "Correct answers",
          elapsed: "Elapsed time",
          round: "Round", // hidden visually
          save: "Save result",
          print: "Print result",
          back: "Back to homepage",
          saveFail: "Save failed. Please try again. (DB)",
          saved: "Result saved.",
          toggle: "Magyar",
        },
      }[lang]),
    [lang]
  );

  // Auto-save the result exactly once when all params are present
  useEffect(() => {
    if (savedOnce.current) return;
    if (!ms || !username) return; // need these at minimum

    savedOnce.current = true;
    (async () => {
      try {
        const url = `/api/saveResult?username=${encodeURIComponent(
          String(username)
        )}&ms=${encodeURIComponent(String(ms))}${
          round_id ? `&round_id=${encodeURIComponent(String(round_id))}` : ""
        }`;
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error("not ok");
        const data = await res.json();
        if (!data?.ok) throw new Error("bad payload");
        setSavedOk(true);
      } catch {
        setSavedOk(false);
      }
    })();
  }, [ms, username, round_id]);

  // Save printable txt
  const onSave = () => {
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    const text = `GrandLucky Travel — Quiz Result
Username: ${username || "-"}
Correct: 5
Time (ms): ${ms || "-"}
Round: ${round_id || "-"}
Saved at: ${ts}
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grandlucky-result-${username || "user"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print simple page
  const onPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html>
<html><head>
<meta charset="utf-8"><title>Quiz Result</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;padding:24px}
  .card{max-width:520px;margin:0 auto;border:1px solid #ddd;border-radius:10px;padding:22px}
  h1{margin:0 0 10px;font-size:22px}
  p{margin:6px 0;font-size:16px}
  hr{margin:14px 0}
</style>
</head><body>
<div class="card">
  <h1>GrandLucky Travel — Quiz Result</h1>
  <p><strong>${t.user}:</strong> ${username || "-"}</p>
  <p><strong>${t.correct}:</strong> 5 / 5</p>
  <p><strong>${t.elapsed}:</strong> ${ms || "-"} ms</p>
</div>
<script>window.print()</script>
</body></html>`);
    w.document.close();
  };

  return (
    <main className="screen">
      <Head>
        <title>Final — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {t.toggle}
      </button>

      <div className="card">
        <h1>{t.title}</h1>
        <p className="sub">{t.congrats}</p>
        <p className="sub">{t.meet}</p>

        <div className="row">
          <span className="label">{t.user}:</span>
          <span className="val">{username || "-"}</span>
        </div>
        <div className="row">
          <span className="label">{t.correct}:</span>
          <span className="val">5 / 5</span>
        </div>
        <div className="row">
          <span className="label">{t.elapsed}:</span>
          <span className="val">{ms || "-"} ms</span>
        </div>
        {/* Hidden ‘Round’ row as requested */}
        <div className="row hide-round">
          <span className="label">{t.round}:</span>
          <span className="val">{round_id || "-"}</span>
        </div>

        <div className="buttons">
          <button className="btn" onClick={onSave}>
            {t.save}
          </button>
          <button className="btn" onClick={onPrint}>
            {t.print}
          </button>
          <Link className="btn" href="/">
            {t.back}
          </Link>
        </div>

        {savedOk === false && <div className="warn">{t.saveFail}</div>}
        {savedOk === true && <div className="ok">{t.saved}</div>}
      </div>

      <style jsx>{`
        :global(:root) {
          --fg: #fff;
          --muted: rgba(255, 255, 255, 0.86);
          --yellow: #faaf3b;
          --yellow-border: #e49b28;
          --chip: #f6f6f6;
          --chip-text: #1e1e1e;
          --shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
        }
        .screen {
          min-height: 100svh;
          color: var(--fg);
          font-family: Montserrat, system-ui, sans-serif;
          background: #0f0f0f url(${JSON.stringify(BG_FINAL)}) center/cover
            no-repeat fixed;
          display: grid;
          place-items: center;
          padding: 24px;
        }
        .lang {
          position: fixed;
          top: 16px;
          right: 16px;
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 900;
          border: 0;
          background: var(--chip);
          color: var(--chip-text);
          box-shadow: var(--shadow);
          cursor: pointer;
          z-index: 2;
        }
        .card {
          width: 100%;
          max-width: 780px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 26px;
          box-shadow: var(--shadow);
        }
        h1 {
          margin: 0 0 8px;
          font-size: clamp(26px, 5vw, 38px);
          font-weight: 900;
        }
        .sub {
          margin: 0;
          color: var(--muted);
        }
        .row {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          align-items: center;
        }
        .row .label {
          opacity: 0.88;
          font-weight: 700;
        }
        .row .val {
          text-align: right;
          font-weight: 800;
        }
        .hide-round {
          display: none; /* hide the 'Round' row */
        }
        .buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          color: #222;
          background: var(--yellow);
          border: 3px solid var(--yellow-border);
          text-decoration: none;
          box-shadow: var(--shadow), inset 0 2px 0 rgba(255, 255, 255, 0.65);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(0, 0, 0, 0.46),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }
        .warn {
          margin-top: 14px;
          background: #7a1f1f;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          display: inline-block;
        }
        .ok {
          margin-top: 14px;
          background: #1f7a3a;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          display: inline-block;
        }
      `}</style>
    </main>
  );
}
