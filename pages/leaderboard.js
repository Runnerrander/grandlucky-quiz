// pages/leaderboard.js
import React from "react";

/** Format milliseconds as mm:ss.SSS. Returns "—" if invalid. */
function formatMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return "—";
  const totalSeconds = Math.floor(n / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = n % 1000;
  const pad2 = (x) => String(x).padStart(2, "0");
  const pad3 = (x) => String(x).padStart(3, "0");
  return `${pad2(minutes)}:${pad2(seconds)}.${pad3(millis)}`;
}

export default function LeaderboardPage({ data }) {
  // Robust guards
  const round = data?.round ?? null;
  const closed = Boolean(data?.closed);
  const items = Array.isArray(data?.leaderboard) ? data.leaderboard : [];

  const roundName = round?.name || "(Round)";
  const lang = (round?.lang || "hu").toLowerCase();

  // Basic HU/EN text (keeps your HU defaults)
  const t = {
    title: "GrandLucky — Eredménylista",
    roundLabel: "Forduló",
    noRowsYet: "Még nincs megjeleníthető eredmény.",
    showAfterClose: "Az eredménylista a forduló lezárása után jelenik meg.",
    thRank: "#",
    thUser: lang === "hu" ? "Felhasználónév" : "Username",
    thTime: lang === "hu" ? "Idő" : "Time",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#f0f0f0" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1rem" }}>
        <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>{t.title}</h1>
        <div style={{ opacity: 0.9, marginBottom: 24 }}>
          <strong>{t.roundLabel}:</strong> {roundName}
        </div>

        {!round ? (
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: 8,
              padding: "12px 16px",
              display: "inline-block",
            }}
          >
            {t.noRowsYet}
          </div>
        ) : !closed ? (
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: 8,
              padding: "12px 16px",
              display: "inline-block",
            }}
          >
            {t.showAfterClose}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: 8,
              padding: "12px 16px",
              display: "inline-block",
            }}
          >
            {t.noRowsYet}
          </div>
        ) : (
          <div
            style={{
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #262626",
              background: "#111",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#161616" }}>
                <tr>
                  <th style={thStyle}>{t.thRank}</th>
                  <th style={thStyle}>{t.thUser}</th>
                  <th style={thStyle}>{t.thTime}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr key={`${row.username}-${i}`} style={{ borderTop: "1px solid #1f1f1f" }}>
                    <td style={tdStyle}>{row.rank ?? i + 1}</td>
                    <td style={tdStyle}>{row.username || "—"}</td>
                    <td style={tdStyle}>{formatMs(row.time_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px 14px",
  fontWeight: 600,
  fontSize: 14,
  color: "#e7e7e7",
  borderBottom: "1px solid #232323",
};

const tdStyle = {
  padding: "10px 14px",
  fontSize: 14,
  color: "#e2e2e2",
};

/**
 * Server-side data fetch
 * - Uses NEXT_PUBLIC_BASE_URL when available
 * - Falls back to the request's host/proto in dev
 */
export async function getServerSideProps({ query, req }) {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

    const url = `${base}/api/leaderboard?round_id=${encodeURIComponent(query.round_id || "")}`;

    const r = await fetch(url);
    // If API ever returns HTML (e.g., error page), avoid JSON parse crash
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Bad response from API", raw: text };
    }

    return { props: { data } };
  } catch (err) {
    return { props: { data: { error: String(err) } } };
  }
}
