// pages/final.js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function Final() {
  const router = useRouter();
  const { username = "", ms = "", round_id = "", lang: rawLang } = router.query;

  // default HU, allow ?lang=en to switch
  const lang = rawLang === "en" ? "en" : "hu";

  const T = useMemo(() => {
    const HU = {
      title: "Kvíz sikeresen befejezve!",
      blurb:
        "Gratulálunk, teljesítetted a kvízt. Reméljük, találkozunk a döntőben!",
      labels: {
        username: "Felhasználónév:",
        correct: "Helyes válaszok:",
        elapsed: "Eltelt idő:",
      },
      save: "Eredmény mentése",
      print: "Eredmény nyomtatása",
      back: "Vissza a főoldalra",
      saved: "Eredmény mentve.",
      already: "Már mentve.",
      // no error copy shown anymore
      english: "English",
      hungarian: "Magyar",
    };

    const EN = {
      title: "Quiz completed successfully!",
      blurb:
        "Congrats, you’ve finished the quiz. We hope to see you in the finals!",
      labels: {
        username: "Username:",
        correct: "Correct answers:",
        elapsed: "Elapsed time:",
      },
      save: "Save result",
      print: "Print result",
      back: "Back to homepage",
      saved: "Result saved.",
      already: "Already saved.",
      english: "English",
      hungarian: "Hungarian",
    };

    return lang === "en" ? EN : HU;
  }, [lang]);

  const msNum = Number(ms) || 0;
  const correct = 5; // always 5 here

  // "idle" | "saving" | "saved" | "already"
  const [saveState, setSaveState] = useState("idle");

  // Display helper: format milliseconds as mm:ss (e.g., 1:07)
  const elapsedPretty = useMemo(() => {
    const total = Math.max(0, msNum);
    const m = Math.floor(total / 60000);
    const s = Math.floor((total % 60000) / 1000);
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [msNum]);

  // Auto-save to Supabase via POST -> /api/saveResult
  useEffect(() => {
    if (!username || !ms) return;
    let mounted = true;

    // Skip re-posting if we've already saved this exact result once
    const localKey = `saved|${round_id || "unknown"}|${username}|${msNum}`;
    if (typeof window !== "undefined" && localStorage.getItem(localKey) === "1") {
      setSaveState("already");
      return;
    }

    (async () => {
      try {
        setSaveState("saving");
        const body = {
          username,
          ms: msNum, // store raw milliseconds
          correct,
          round_id: typeof round_id === "string" ? round_id : "",
        };
        const res = await fetch("/api/saveResult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        // Treat any 2xx as success; interpret {already:true} if present
        const json = await res.json().catch(() => ({}));
        if (mounted) {
          if (res.ok && json && json.ok) {
            setSaveState(json.already ? "already" : "saved");
            try { localStorage.setItem(localKey, "1"); } catch {}
          } else if (res.ok) {
            // even if backend didn't return ok flag, don't alarm the user
            setSaveState("saved");
            try { localStorage.setItem(localKey, "1"); } catch {}
          } else {
            // hide error message entirely (no scary toast)
            setSaveState("idle");
          }
        }
      } catch {
        if (mounted) {
          // hide error message entirely (no scary toast)
          setSaveState("idle");
        }
      }
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, msNum, round_id]);

  const onSaveToDevice = () => {
    const lines = [
      `${T.labels.username} ${username}`,
      `${T.labels.correct} ${correct} / 5`,
      `${T.labels.elapsed} ${elapsedPretty} (${msNum.toLocaleString()} ms)`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `result-${username || "player"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  const onPrint = () => window.print();

  const toggleLang = () => {
    const next = lang === "hu" ? "en" : "hu";
    router.replace(
      { pathname: router.pathname, query: { ...router.query, lang: next } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <main className="page">
      <button className="lang" onClick={toggleLang}>
        {lang === "hu" ? T.english : T.hungarian}
      </button>

      <div className="center">
        <h1 className="title">{T.title}</h1>
        <p className="blurb">{T.blurb}</p>

        <div className="rows">
          <Row label={T.labels.username} value={username || "—"} />
          <Row label={T.labels.correct} value={`${correct} / 5`} />
          <Row
            label={T.labels.elapsed}
            value={
              <>
                <div className="time-main">{elapsedPretty}</div>
                <div className="time-sub">{msNum.toLocaleString()} ms</div>
              </>
            }
          />
          {/* No "Forduló" row */}
        </div>

        <div className="actions">
          <button className="btn primary" onClick={onSaveToDevice}>
            {T.save}
          </button>
          <button className="btn primary" onClick={onPrint}>
            {T.print}
          </button>
          <a className="btn outline" href="/">
            {T.back}
          </a>
        </div>

        {/* Success toasts only; no error toast */}
        {saveState === "saved" && <div className="toast">{T.saved}</div>}
        {saveState === "already" && <div className="toast">{T.already}</div>}
      </div>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          background: url("/bg-final.jpg") center/cover no-repeat fixed;
          color: #fff;
        }
        .lang {
          position: fixed;
          right: 16px;
          top: 16px;
          padding: 8px 14px;
          border-radius: 999px;
          border: none;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          cursor: pointer;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .center {
          max-width: 860px;
          margin: 0 auto;
          padding: 96px 16px 40px;
          text-align: left;
        }
        .title {
          font-size: 40px;
          line-height: 1.15;
          margin: 0 0 10px;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
        }
        .blurb {
          margin: 0 0 24px;
          font-size: 16px;
          opacity: 0.95;
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);
        }
        .rows {
          display: grid;
          gap: 10px;
          margin-bottom: 22px;
        }
        .row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: baseline;
          font-size: 16px;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.55);
        }
        .label { opacity: 0.9; }
        .value { font-weight: 700; }

        /* New: elapsed time styles */
        .time-main {
          font-weight: 800;
          font-size: 20px;
          line-height: 1.1;
        }
        .time-sub {
          margin-top: 2px;
          font-size: 13px;
          opacity: 0.9;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 10px;
        }
        .btn, .btn:link, .btn:visited { text-decoration: none; }
        .btn {
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          border: 0;
        }
        .btn.primary { background: linear-gradient(180deg, #ffb237, #f09a0b); color: #111; }
        .btn.outline { background: transparent; border: 2px solid #ffd07a; }
        .btn.outline, .btn.outline:link, .btn.outline:visited { color: #ffd07a; }

        .toast {
          margin-top: 14px;
          display: inline-block;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .center { padding-top: 72px; }
          .title { font-size: 28px; }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <style jsx>{`
        .row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: baseline;
        }
        .label { min-width: 140px; }
      `}</style>
    </div>
  );
}
<style jsx global>{`
  /* Mobile-only tweaks for the FINAL page */
  @media (max-width: 520px) {
    .final-page h1,
    h1 {
      font-size: clamp(1.4rem, 5.2vw + 0.6rem, 2rem);
      line-height: 1.2;
      margin-bottom: 12px;
    }

    .final-page,
    .results,
    .container,
    .content,
    body .__next > div {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .final-page button,
    button {
      width: 100%;
      display: block;
      margin: 10px 0 !important;
      padding: 12px 14px;
      font-size: 1rem;
      justify-content: center;
    }

    .final-page p,
    .final-page li,
    .final-page span {
      font-size: 0.98rem;
      line-height: 1.35;
    }

    .final-page .panel,
    .panel {
      background: rgba(0, 0, 0, 0.45);
      -webkit-backdrop-filter: blur(2px);
      backdrop-filter: blur(2px);
      border-radius: 14px;
      padding: 16px;
    }
  }
`}</style>
