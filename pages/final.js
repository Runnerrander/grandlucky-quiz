// pages/final.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export default function FinalPage() {
  const router = useRouter();
  const sentRef = useRef(false);

  // Read values from the URL (your final page already has these)
  const q = router.query;
  const username = (q.username || "").toString();
  const ms = Number(q.ms ?? 0);                 // elapsed time in ms
  const correct = Number(q.correct ?? q.cc ?? 0); // 5 when the quiz is complete
  const roundId = (q.round_id || "default-round").toString();

  // --- Auto-save to Supabase once on mount -----------------------------------
  useEffect(() => {
    if (!router.isReady) return;
    if (sentRef.current) return;
    if (!username || !ms || !correct) return; // nothing useful to save

    sentRef.current = true;

    const url = `/api/saveResult?username=${encodeURIComponent(
      username
    )}&ms=${ms}&correct=${correct}&round_id=${encodeURIComponent(roundId)}`;

    fetch(url, { method: "GET", cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j?.ok) console.warn("saveResult not ok:", j);
      })
      .catch((err) => console.warn("saveResult failed:", err));
  }, [router.isReady, username, ms, correct, roundId]);

  // --- User actions -----------------------------------------------------------
  const handleSaveToDevice = () => {
    const text = [
      "GrandLuckyTravel — Eredmény",
      "",
      `Felhasználónév: ${username}`,
      `Helyes válaszok: ${correct} / 5`,
      `Eltelt idő: ${ms} ms`,
      `Forduló: ${roundId}`,
      `Mentve: ${new Date().toLocaleString()}`,
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grandlucky-result-${username || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/");
  };

  // --- Simple styles (dark centered card) ------------------------------------
  const page = {
    minHeight: "100vh",
    background: "#0e0e0e",
    color: "#fff",
    padding: "40px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const card = {
    width: "100%",
    maxWidth: 720,
    background: "#151515",
    borderRadius: 14,
    border: "1px solid #252525",
    boxShadow: "0 14px 36px rgba(0,0,0,.45)",
    padding: "28px 24px",
    textAlign: "center",
  };
  const title = { margin: 0, fontSize: 34, fontWeight: 900 };
  const box = {
    marginTop: 18,
    background: "#1e1e1e",
    border: "1px solid #2d2d2d",
    borderRadius: 10,
    padding: "16px 18px",
    textAlign: "left",
  };
  const row = {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: 10,
    alignItems: "center",
    marginTop: 8,
  };
  const label = { color: "#cfcfcf" };
  const chip = {
    display: "inline-block",
    background: "#262626",
    border: "1px solid #3a3a3a",
    borderRadius: 8,
    padding: "8px 12px",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };
  const btns = {
    marginTop: 22,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  };
  const btn = {
    background: "#f4aa2a",
    border: "1px solid #f4aa2a",
    color: "#1a1a1a",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  };
  const btnGhost = {
    background: "transparent",
    border: "1px solid #666",
    color: "#ddd",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <>
      <Head>
        <title>GrandLucky — Eredmény</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={page}>
        <div style={card}>
          <h1 style={title}>Kvíz sikeresen befejezve!</h1>
          <p style={{ marginTop: 6, color: "#c9c9c9" }}>
            Gratulálunk, teljesítetted a kvízt.
          </p>

          <div style={box}>
            <div style={row}>
              <div style={label}>Felhasználónév:</div>
              <div style={chip}>{username || "—"}</div>
            </div>
            <div style={row}>
              <div style={label}>Helyes válaszok:</div>
              <div style={chip}>
                {Number.isFinite(correct) ? `${correct} / 5` : "—"}
              </div>
            </div>
            <div style={row}>
              <div style={label}>Eltelt idő:</div>
              <div style={chip}>
                {Number.isFinite(ms) ? `${ms} ms` : "—"}
              </div>
            </div>
            <div style={row}>
              <div style={label}>Forduló:</div>
              <div style={chip}>{roundId || "—"}</div>
            </div>
          </div>

          <div style={btns}>
            <button onClick={handleSaveToDevice} style={btn}>
              Eredmény mentése
            </button>
            <button onClick={handlePrint} style={btn}>
              Eredmény nyomtatása
            </button>
            <button onClick={handleBack} style={btnGhost}>
              Vissza a főoldalra
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
