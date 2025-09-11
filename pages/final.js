// pages/final.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

// Use the image in /public. Note the %20 for the space in the filename.
const BG = "/BG-sikeres%20reg.png";

export default function FinalPage() {
  const router = useRouter();

  // ---- read query safely (supports hard refresh) ----
  const getQ = (key) => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get(key);
      if (p != null) return p;
    }
    const v = router?.query?.[key];
    return typeof v === "string" ? v : "";
  };

  // raw query params
  const username = getQ("username") || "";
  const msStr = getQ("ms") || "";
  const correctStr = getQ("c") || getQ("correct") || "";
  const round_id = getQ("round_id") || "";

  // normalized numeric values
  const time_ms = useMemo(() => {
    const n = parseInt(msStr, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [msStr]);

  const correct = useMemo(() => {
    const n = parseInt(correctStr, 10);
    return Number.isFinite(n) ? n : 0;
  }, [correctStr]);

  // ---- auto-save state ----
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  // Use a small key to avoid re-saving on refresh (same URL)
  const guardKey = useMemo(() => {
    if (!username || !time_ms || correct < 5) return "";
    return `gl_result_saved_${username}_${time_ms}_${correct}_${round_id || "none"}`;
  }, [username, time_ms, correct, round_id]);

  useEffect(() => {
    // only autosave for valid finished runs
    if (!username || !time_ms || correct < 5) return;
    // already saved for this exact result?
    if (guardKey && typeof window !== "undefined" && localStorage.getItem(guardKey)) {
      setSaveState("saved");
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setSaveState("saving");
        setSaveError("");

        const res = await fetch("/api/saveResult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            ms: time_ms,
            correct,
            round_id: round_id || undefined,
          }),
        });

        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error("Bad JSON from API");
        }

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || `HTTP ${res.status}`);
        }

        if (!cancelled) {
          setSaveState("saved");
          if (guardKey && typeof window !== "undefined") {
            localStorage.setItem(guardKey, "1");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setSaveState("error");
          setSaveError(e?.message || "Save failed");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [username, time_ms, correct, round_id, guardKey]);

  // ---- download & print for the user ----
  const handleDownload = () => {
    const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
    const text =
      `GrandLucky Travel — Trivia Result\n\n` +
      `Username: ${username}\n` +
      `Correct: ${correct} / 5\n` +
      `Time: ${time_ms} ms\n` +
      (round_id ? `Round: ${round_id}\n` : ``) +
      `Saved at: ${ts}\n`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grandlucky-result-${username || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const ts = new Date().toLocaleString();
    w.document.write(`<!doctype html>
<html>
<head><meta charset="utf-8"><title>Trivia Result</title>
<style>body{font-family:Arial,Helvetica,sans-serif;padding:24px} .card{max-width:560px;margin:0 auto;border:1px solid #ddd;border-radius:10px;padding:20px}</style>
</head>
<body>
  <div class="card">
    <h2>GrandLucky Travel — Trivia Result</h2>
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>Correct:</strong> ${correct} / 5</p>
    <p><strong>Time:</strong> ${time_ms} ms</p>
    ${round_id ? `<p><strong>Round:</strong> ${round_id}</p>` : ``}
    <hr>
    <p>Printed: ${ts}</p>
  </div>
  <script>window.print();</script>
</body>
</html>`);
    w.document.close();
  };

  // ---- UI copy (HU only for this step) ----
  const t = {
    title: "Kvíz sikeresen befejezve!",
    lead: "Gratulálunk, teljesítetted a kvízt.",
    username: "Felhasználónév:",
    correct: "Helyes válaszok:",
    time: "Eltelt idő:",
    saveBtn: "Eredmény mentése",
    printBtn: "Eredmény nyomtatása",
    backBtn: "Vissza a főoldalra",
    saving: "Eredmény mentése…",
    saved: "Eredmény mentve.",
    errorPrefix: "Mentés sikertelen",
  };

  // ---- styles (with background image restored) ----
  const page = {
    minHeight: "100vh",
    // background image + a subtle dark overlay for readability
    background: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('${BG}') center/cover no-repeat`,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
  };
  const card = {
    width: "100%",
    maxWidth: 740,
    background: "#151515",
    borderRadius: 12,
    border: "1px solid #222",
    boxShadow: "0 12px 30px rgba(0,0,0,.45)",
    padding: 24,
  };
  const h1 = { textAlign: "center", margin: "0 0 6px", fontSize: 32, fontWeight: 800 };
  const sub = { textAlign: "center", color: "#bbb", marginBottom: 18 };
  const grid = { display: "grid", gap: 10, marginTop: 10 };
  const row = {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: 12,
    alignItems: "center",
  };
  const chip = {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "10px 12px",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  };
  const btnBar = { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 16 };
  const btn = (primary = false) => ({
    background: primary ? "#f4aa2a" : "transparent",
    color: primary ? "#1a1a1a" : "#ddd",
    border: primary ? "1px solid #f4aa2a" : "1px solid #666",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  });
  const note = {
    textAlign: "center",
    marginTop: 12,
    color: saveState === "error" ? "#ffd2d2" : "#bbb",
    background: saveState === "error" ? "#7a1f1f" : "transparent",
    borderRadius: 8,
    padding: saveState === "error" ? "8px 10px" : 0,
  };

  return (
    <main style={page}>
      <div style={card}>
        <h1 style={h1}>{t.title}</h1>
        <div style={sub}>{t.lead}</div>

        <div style={grid}>
          <div style={row}>
            <div>{t.username}</div>
            <div style={chip}>{username || "—"}</div>
          </div>

          <div style={row}>
            <div>{t.correct}</div>
            <div style={chip}>
              {Number.isFinite(correct) ? `${correct} / 5` : "—"}
            </div>
          </div>

          <div style={row}>
            <div>{t.time}</div>
            <div style={chip}>
              {Number.isFinite(time_ms) ? `${time_ms} ms` : "—"}
            </div>
          </div>

          {/* Round row intentionally hidden from UI. Kept in file/print only. */}
        </div>

        <div style={btnBar}>
          <button style={btn(true)} onClick={handleDownload}>{t.saveBtn}</button>
          <button style={btn(true)} onClick={handlePrint}>{t.printBtn}</button>
          <button style={btn(false)} onClick={() => router.push("/")}>{t.backBtn}</button>
        </div>

        <div style={note}>
          {saveState === "saving" && t.saving}
          {saveState === "saved" && t.saved}
          {saveState === "error" && `${t.errorPrefix}. Kérlek próbáld újra. (${saveError})`}
        </div>
      </div>
    </main>
  );
}
