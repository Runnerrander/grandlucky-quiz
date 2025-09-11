// pages/final.js
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";

export default function FinalPage() {
  const router = useRouter();
  const sentRef = useRef(false);

  // --- read query ------------------------------------------------------------
  const q = router.query || {};
  const username = (q.username || "").toString();
  const ms = Number(q.ms || 0);
  const correct = Number(q.c || q.cc || q.correct || 5); // default 5
  const round_id = (q.round_id || "").toString();

  // --- i18n ------------------------------------------------------------------
  const [lang, setLang] = useState("hu");
  useEffect(() => {
    const fromUrl = (q.lang || "").toString().toLowerCase();
    if (fromUrl === "en" || fromUrl === "hu") setLang(fromUrl);
  }, [q.lang]);

  const t = useMemo(
    () =>
      ({
        hu: {
          title: "Kvíz sikeresen befejezve!",
          subtitle: "Gratulálunk, teljesítetted a kvízt. Reméljük, találkozunk a döntőben!",
          username: "Felhasználónév:",
          correct: "Helyes válaszok:",
          elapsed: "Eltelt idő:",
          // round is intentionally hidden now
          elapsed_unit: "ms",
          saveBtn: "Eredmény mentése",
          printBtn: "Eredmény nyomtatása",
          backBtn: "Vissza a főoldalra",
          saving: "Eredmény mentése…",
          saved: "Eredmény mentve.",
          saveFail: "Mentés sikertelen. Kérlek próbáld újra. (DB)",
          toggle: "English",
        },
        en: {
          title: "Quiz completed successfully!",
          subtitle: "Congrats — you finished the quiz. We hope to see you in the finals!",
          username: "Username:",
          correct: "Correct answers:",
          elapsed: "Elapsed time:",
          elapsed_unit: "ms",
          saveBtn: "Save result",
          printBtn: "Print result",
          backBtn: "Back to homepage",
          saving: "Saving your result…",
          saved: "Result saved.",
          saveFail: "Save failed. Please try again. (DB)",
          toggle: "Magyar",
        },
      }[lang]),
    [lang]
  );

  // --- auto-save to Supabase on load ----------------------------------------
  const [saveState, setSaveState] = useState("idle"); // idle | saving | ok | err

  useEffect(() => {
    if (!router.isReady) return;
    if (sentRef.current) return;

    // must have username + ms + >=5 correct to save
    if (!username || !Number.isFinite(ms) || ms <= 0 || correct < 5) return;

    sentRef.current = true;
    (async () => {
      try {
        setSaveState("saving");
        const res = await fetch("/api/saveResult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            time_ms: Math.round(ms),
            correct: Number.isFinite(correct) ? correct : 5,
            round_id: round_id || "unknown",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok !== true) throw new Error(data?.error || "not ok");
        setSaveState("ok");
      } catch {
        setSaveState("err");
        sentRef.current = false; // allow retry if user reloads
      }
    })();
  }, [router.isReady, username, ms, correct, round_id]);

  // --- helpers: download & print --------------------------------------------
  const handleDownload = () => {
    try {
      const text =
        `GrandLucky Travel — Quiz Result\n\n` +
        `Username: ${username}\n` +
        `Correct: ${correct} / 5\n` +
        `Time: ${ms} ms\n` +
        (round_id ? `Round: ${round_id}\n` : "") +
        `Saved at: ${new Date().toLocaleString()}\n`;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grandlucky-result-${username || "user"}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  // --- UI --------------------------------------------------------------------
  return (
    <main style={styles.screen}>
      <Head>
        <title>Final — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* language toggle */}
      <button
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
        style={styles.lang}
        aria-label="language-toggle"
      >
        {t.toggle}
      </button>

      <div style={styles.wrap}>
        <div style={styles.card}>
          <h1 style={styles.h1}>{t.title}</h1>
          <p style={styles.lead}>{t.subtitle}</p>

          <Row label={t.username} value={username || "—"} />
          <Row label={t.correct} value={`${correct} / 5`} />
          <Row label={t.elapsed} value={`${ms} ${t.elapsed_unit}`} />
          {/* Round row intentionally hidden */}

          {/* auto-save state */}
          {saveState === "saving" && (
            <div style={styles.info}>{t.saving}</div>
          )}
          {saveState === "ok" && (
            <div style={styles.ok}>{t.saved}</div>
          )}
          {saveState === "err" && (
            <div style={styles.err}>{t.saveFail}</div>
          )}

          <div style={styles.btns}>
            <button onClick={handleDownload} style={styles.btnPrimary}>
              {t.saveBtn}
            </button>
            <button onClick={handlePrint} style={styles.btnGhost}>
              {t.printBtn}
            </button>
            <button onClick={() => router.push("/")} style={styles.btnGhost}>
              {t.backBtn}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    padding: "48px 16px",
  },
  lang: {
    position: "fixed",
    top: 16,
    right: 16,
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #444",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
  },
  wrap: {
    maxWidth: 940,
    margin: "0 auto",
  },
  card: {
    margin: "0 auto",
    maxWidth: 720,
    background: "#151515",
    border: "1px solid #222",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  h1: { margin: "0 0 10px", fontSize: 32, fontWeight: 800, textAlign: "center" },
  lead: { margin: "0 0 20px", color: "#bbb", textAlign: "center" },
  row: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #222",
  },
  label: { color: "#aaa" },
  value: {
    background: "#1e1e1e",
    border: "1px solid #2b2b2b",
    borderRadius: 8,
    padding: "10px 12px",
    fontWeight: 700,
  },
  btns: {
    marginTop: 18,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    background: "#f4aa2a",
    border: "1px solid #f4aa2a",
    color: "#000",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  btnGhost: {
    background: "transparent",
    border: "1px solid #666",
    color: "#ddd",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  info: {
    marginTop: 12,
    textAlign: "center",
    background: "#2a2a2a",
    border: "1px solid #444",
    color: "#ddd",
    padding: "8px 10px",
    borderRadius: 8,
  },
  ok: {
    marginTop: 12,
    textAlign: "center",
    background: "#1e3a1e",
    border: "1px solid #355a35",
    color: "#c7f5c7",
    padding: "8px 10px",
    borderRadius: 8,
  },
  err: {
    marginTop: 12,
    textAlign: "center",
    background: "#3a0e0e",
    border: "1px solid #6b1a1a",
    color: "#ffd2d2",
    padding: "8px 10px",
    borderRadius: 8,
  },
};
