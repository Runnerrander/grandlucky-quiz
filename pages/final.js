// pages/final.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

export default function Final() {
  const router = useRouter();
  const { username = "", ms = "", correct = "", round_id = "", lang } = router.query;

  // language
  const [curLang, setCurLang] = useState(
    (typeof lang === "string" && (lang === "en" || lang === "hu")) ? lang : "hu"
  );

  // i18n text (JS-only, no TS syntax)
  const T = useMemo(() => {
    const dict = {
      hu: {
        title: "Kvíz sikeresen befejezve!",
        blurb1: "Gratulálunk, teljesítetted a kvízt.",
        blurb2: "Reméljük, találkozunk a döntőben!",
        username: "Felhasználónév:",
        answers: "Helyes válaszok:",
        time: "Eltelt idő:",
        save: "Eredmény mentése",
        print: "Eredmény nyomtatása",
        back: "Vissza a főoldalra",
        saved: "Eredmény mentve.",
        saveFailed: "Mentés sikertelen. Kérlek próbáld újra. (DB)",
        en: "English",
        hu: "Magyar",
        msSuffix: " ms",
      },
      en: {
        title: "Quiz successfully completed!",
        blurb1: "Congrats, you finished the quiz.",
        blurb2: "We hope to see you in the finals!",
        username: "Username:",
        answers: "Correct answers:",
        time: "Elapsed time:",
        save: "Save result",
        print: "Print result",
        back: "Back to home",
        saved: "Result saved.",
        saveFailed: "Save failed. Please try again. (DB)",
        en: "English",
        hu: "Hungarian",
        msSuffix: " ms",
      },
    };
    return dict[curLang];
  }, [curLang]);

  // parsed values
  const correctNum = useMemo(() => Number(correct) || 0, [correct]);
  const msNum = useMemo(() => Number(ms) || 0, [ms]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [savedOnce, setSavedOnce] = useState(false);

  // keep URL in sync when toggling language (shallow replace)
  useEffect(() => {
    if (!router.isReady) return;
    const params = new URLSearchParams({ ...router.query, lang: curLang });
    router.replace(`/final?${params.toString()}`, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curLang, router.isReady]);

  // autosave once if perfect score (5/5)
  useEffect(() => {
    if (!router.isReady) return;
    if (savedOnce) return;
    if (correctNum === 5 && username) {
      (async () => {
        const ok = await saveResult();
        if (ok) setSavedOnce(true);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, correctNum, username]);

  async function saveResult() {
    try {
      setSaving(true);
      setToast("");
      const res = await fetch("/api/saveResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          ms: msNum,
          correct: correctNum,
          round_id: round_id || "final-round",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setToast(T.saveFailed);
        return false;
      }
      setToast(T.saved);
      return true;
    } catch (e) {
      setToast(T.saveFailed);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function onPrint() {
    window.print();
  }

  return (
    <div className="page">
      {/* language toggle */}
      <div className="lang-switch">
        <button
          className={`pill ${curLang === "hu" ? "active" : ""}`}
          onClick={() => setCurLang("hu")}
        >
          HU
        </button>
        <button
          className={`pill ${curLang === "en" ? "active" : ""}`}
          onClick={() => setCurLang("en")}
        >
          EN
        </button>
      </div>

      {/* content without dark plate */}
      <main className="content">
        <h1 className="title">{T.title}</h1>
        <p className="sub">{T.blurb1}<br />{T.blurb2}</p>

        <div className="rows">
          <Row label={T.username} value={String(username)} />
          <Row label={T.answers} value={`${correctNum} / 5`} />
          <Row label={T.time} value={`${msNum}${T.msSuffix}`} />
          {/* Round/Forduló intentionally hidden */}
        </div>

        <div className="btns">
          <button className="btn btn-primary" onClick={saveResult} disabled={saving}>
            {T.save}
          </button>
          <button className="btn btn-primary" onClick={onPrint}>
            {T.print}
          </button>
          <a className="btn btn-secondary" href="/">
            {T.back}
          </a>
        </div>

        {toast ? <div className="toast">{toast}</div> : null}
      </main>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          background: url("/bg-final.jpg") center/cover no-repeat fixed;
        }
        .lang-switch {
          position: fixed;
          top: 18px;
          right: 18px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .pill {
          border: none;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.85);
          color: #111;
          font-weight: 600;
          cursor: pointer;
        }
        .pill.active {
          background: #111;
          color: #fff;
        }
        .content {
          max-width: 820px;
          margin: 0 auto;
          padding: 120px 24px 64px;
          color: #fff;
          text-shadow: 0 2px 10px rgba(0,0,0,0.7);
        }
        .title {
          font-size: 40px;
          line-height: 1.1;
          margin: 0 0 8px 0;
          font-weight: 800;
        }
        .sub {
          margin: 0 0 24px 0;
          font-size: 16px;
          opacity: 0.95;
        }
        .rows {
          display: grid;
          gap: 10px;
          margin: 18px 0 26px 0;
        }
        .row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 12px;
          align-items: center;
          font-size: 16px;
        }
        .label {
          opacity: 0.9;
        }
        .value {
          font-weight: 700;
        }
        .btns {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .btn {
          appearance: none;
          border: none;
          border-radius: 10px;
          padding: 12px 16px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
        }
        .btn-primary {
          background: #f6a623; /* warm amber */
          color: #111;
        }
        .btn-primary:hover {
          background: #e49711;
        }
        .btn-secondary {
          background: rgba(255,255,255,0.9);
          color: #111;
        }
        .btn-secondary:hover {
          background: #fff;
        }
        .toast {
          margin-top: 16px;
          display: inline-block;
          background: rgba(0,0,0,0.6);
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .title { font-size: 30px; }
          .row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <style jsx>{`
        .row {
          display: contents;
        }
        .label {
          grid-column: 1 / 2;
        }
        .value {
          grid-column: 2 / 3;
        }
        @media (max-width: 600px) {
          .label, .value { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
}
