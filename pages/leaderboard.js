// pages/leaderboard.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function LeaderboardPage() {
  const router = useRouter();

  const [lang, setLang] = useState("hu");
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = {
    hu: {
      titleTop: "Kvalifikáció",
      title: "Top 10 ranglista",
      desc:
        "A Top 10 lista a kvalifikáció végéig folyamatosan frissül. A leggyorsabb 10 hibátlan kitöltő jut be a 2. fordulóba (élő döntő).",
      updated: "Utolsó frissítés:",
      refresh: "FRISSÍTÉS",
      note: "Megjegyzés: a lista hibátlan (5/5) kitöltésekből épül.",
      noResults:
        "Még nincs megjeleníthető eredmény. A lista hibátlan (5/5) kitöltésekből épül.",
      errorTitle: "Hiba történt a ranglista betöltése közben.",
      backHome: "VISSZA A KEZDŐLAPRA",
      goGame: "TOVÁBB A JÁTÉKHOZ",
      langBtn: "ANGOL",
    },
    en: {
      titleTop: "Qualification",
      title: "Top 10 leaderboard",
      desc:
        "The Top 10 list updates continuously until the qualification ends. The fastest 10 perfect (5/5) players advance to Round 2 (live final).",
      updated: "Last update:",
      refresh: "REFRESH",
      note: "Note: this list includes only perfect (5/5) runs.",
      noResults:
        "No results to show yet. This list includes only perfect (5/5) runs.",
      errorTitle: "An error occurred while loading the leaderboard.",
      backHome: "BACK TO HOME",
      goGame: "CONTINUE TO GAME",
      langBtn: "MAGYAR",
    },
  };

  const copy = t[lang];

  async function loadLeaderboard() {
    try {
      setLoading(true);
      setError("");

      // cache-bust so it always shows latest
      const res = await fetch(`/api/leaderboard?t=${Date.now()}`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const raw = await res.text();
        throw new Error(`Unexpected response (not JSON): ${raw.slice(0, 120)}`);
      }

      const json = await res.json();

      if (!json?.ok) {
        throw new Error(json?.message || "Failed to load leaderboard");
      }

      setData(Array.isArray(json.leaderboard) ? json.leaderboard : []);
      setLastUpdated(new Date().toLocaleString());
    } catch (e) {
      setError(String(e?.message || e));
      setData([]);
      setLastUpdated("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Top 10 — Leaderboard</title>
      </Head>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#f3a63a",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "60px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "hu" ? "en" : "hu")}
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            padding: "10px 16px",
            borderRadius: 999,
            border: "2px solid #111",
            background: "#f7e7c7",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {copy.langBtn}
        </button>

        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 760,
            background: "#f7f0e6",
            borderRadius: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            padding: "34px 36px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{copy.titleTop}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{copy.title}</div>
          </div>

          <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5, maxWidth: 620 }}>
            {copy.desc}
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {copy.updated}{" "}
              <span style={{ fontWeight: 900 }}>
                {lastUpdated || (loading ? "..." : "-")}
              </span>
            </div>

            <button
              onClick={loadLeaderboard}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "2px solid #111",
                background: "#f7d28b",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {copy.refresh}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #ffb3b3",
                background: "#ffe3e3",
                color: "#7a0b0b",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              {copy.errorTitle}
              <div style={{ marginTop: 6, fontWeight: 700, fontSize: 12 }}>
                {error}
              </div>
            </div>
          )}

          {!error && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#f6e4c2",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              {copy.note}
            </div>
          )}

          {/* List */}
          <div style={{ marginTop: 18 }}>
            {loading && (
              <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.8 }}>
                Loading...
              </div>
            )}

            {!loading && !error && data.length === 0 && (
              <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.85 }}>
                {copy.noResults}
              </div>
            )}

            {!loading && !error && data.length > 0 && (
              <div style={{ marginTop: 6 }}>
                {data.map((row) => (
                  <div
                    key={`${row.rank}-${row.username}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #ddd",
                      fontWeight: 900,
                    }}
                  >
                    <span>#{row.rank}</span>
                    <span>{row.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div
            style={{
              marginTop: 22,
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                border: "2px solid #c8c8c8",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                minWidth: 210,
              }}
            >
              {copy.backHome}
            </button>

            <button
              onClick={() => router.push("/trivia")}
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                border: "2px solid #111",
                background: "#f7d28b",
                fontWeight: 900,
                cursor: "pointer",
                minWidth: 240,
              }}
            >
              {copy.goGame}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}