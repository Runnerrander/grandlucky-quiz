// pages/leaderboard.js
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function fmtTime(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return "—";
  const totalMs = Math.round(n);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(millis).padStart(3, "0");
  return `${mm}:${ss}.${mmm}`;
}

export default function LeaderboardPage() {
  const [lang, setLang] = useState("hu"); // HU default

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [payload, setPayload] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Where "Continue to Play" should go:
  // vivko.js supports deep-linking via ?slide=1
  const PLAY_HREF = "/vivko?slide=1";

  const copy = {
    hu: {
      headTitle: "Top 10 — Kvalifikációs ranglista — GrandLuckyTravel",
      titleScript: "Kvalifikáció",
      titleStrong: "Top 10 ranglista",
      intro:
        "A Top 10 lista a kvalifikáció végéig folyamatosan frissül. A leggyorsabb 10 hibátlan kitöltő jut be a 2. fordulóba (élő döntő).",
      note:
        "Megjegyzés: a lista a hibátlan (5/5) kitöltések ideje alapján rendezett. A sorrend változhat a határidőig.",
      outside:
        "A 11. hely jelenleg épp kívül van a Top 10-en — még bárki átveheti a helyet!",
      lastUpdated: "Utolsó frissítés:",
      rank: "Hely",
      user: "Felhasználónév",
      time: "Idő",
      perfect: "Hibátlan",
      empty:
        "Még nincs megjeleníthető eredmény. A lista hibátlan (5/5) kitöltésekből épül.",
      backHome: "VISSZA A KEZDŐLAPRA",
      continuePlay: "TOVÁBB A JÁTÉKHOZ",
      refresh: "Frissítés",
      refreshing: "Frissítés…",
    },
    en: {
      headTitle: "Top 10 — Qualification Leaderboard — GrandLuckyTravel",
      titleScript: "Qualification",
      titleStrong: "Top 10 leaderboard",
      intro:
        "The Top 10 updates continuously until the qualification deadline. The fastest 10 perfect submissions qualify for Round 2 (LIVE Final).",
      note:
        "Note: the list is ordered by perfect (5/5) completion time. The ranking can change until the deadline.",
      outside:
        "Rank #11 is currently just outside the Top 10 — anyone can still take a Top 10 spot!",
      lastUpdated: "Last updated:",
      rank: "Rank",
      user: "Username",
      time: "Time",
      perfect: "Perfect",
      empty:
        "No results to display yet. The list is built from perfect (5/5) submissions.",
      backHome: "BACK TO HOME",
      continuePlay: "CONTINUE TO PLAY",
      refresh: "Refresh",
      refreshing: "Refreshing…",
    },
  };

  const c = copy[lang];

  const top10 = useMemo(() => {
    const list = payload?.leaderboard || [];
    return list.slice(0, 10);
  }, [payload]);

  const outside = useMemo(() => {
    const list = payload?.leaderboard || [];
    return list.length >= 11 ? list[10] : null;
  }, [payload]);

  async function load() {
    try {
      setErr("");
      if (!payload) setLoading(true);

      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load leaderboard");
      }

      setPayload(data);
      setLastUpdated(new Date());
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const id = setInterval(() => {
      load();
    }, 90 * 1000); // 90 seconds

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRefreshing = loading && payload;

  return (
    <main className="wrap">
      <Head>
        <title>{c.headTitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* language chip */}
      <button
        className="lang"
        onClick={() => setLang((prev) => (prev === "hu" ? "en" : "hu"))}
      >
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      <section className="container">
        <h1 className="title">
          <span className="script">{c.titleScript}</span>
          <br />
          <span className="strong">{c.titleStrong}</span>
        </h1>

        <p className="intro">{c.intro}</p>

        <div className="topbar">
          <div className="updated">
            <span className="label">{c.lastUpdated}</span>{" "}
            <span className="value">
              {lastUpdated
                ? lastUpdated.toLocaleString(lang === "hu" ? "hu-HU" : "en-US")
                : "—"}
            </span>
          </div>

          <button className="btn small" onClick={load} disabled={isRefreshing}>
            {isRefreshing ? c.refreshing : c.refresh}
          </button>
        </div>

        {err ? (
          <div className="error">
            {lang === "hu"
              ? "Hiba történt a ranglista betöltése közben."
              : "There was an error loading the leaderboard."}
            <div className="errorSmall">{err}</div>
          </div>
        ) : null}

        {loading && !payload ? (
          <div className="loading">
            {lang === "hu" ? "Betöltés…" : "Loading…"}
          </div>
        ) : null}

        {!loading && (top10?.length || 0) === 0 ? (
          <div className="empty">{c.empty}</div>
        ) : null}

        {(top10?.length || 0) > 0 ? (
          <div className="table">
            <div className="thead">
              <div>{c.rank}</div>
              <div>{c.user}</div>
              <div>{c.time}</div>
              <div className="right">{c.perfect}</div>
            </div>

            {top10.map((row) => (
              <div className="trow" key={row.username}>
                <div className="cell rank">{row.rank}</div>
                <div className="cell user">{row.username}</div>
                <div className="cell time">{fmtTime(row.time_ms)}</div>
                <div className="cell right">
                  {row.correct}/{row.total}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {outside ? (
          <div className="outside">
            <div className="outsideTitle">{c.outside}</div>
            <div className="outsideRow">
              <span className="pill">#{outside.rank}</span>
              <span className="outsideUser">{outside.username}</span>
              <span className="outsideTime">{fmtTime(outside.time_ms)}</span>
              <span className="outsidePerfect">
                {outside.correct}/{outside.total}
              </span>
            </div>
          </div>
        ) : null}

        <p className="note">{c.note}</p>

        <div className="actions">
          <Link href="/" legacyBehavior>
            <a className="btn ghost">{c.backHome}</a>
          </Link>

          <Link href={PLAY_HREF} legacyBehavior>
            <a className="btn">{c.continuePlay}</a>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .wrap {
          min-height: 100dvh;
          background: #f6a83b;
          font-family: "Montserrat", system-ui, sans-serif;
          color: #222;
          position: relative;
          overflow-x: hidden;
        }

        .lang {
          position: fixed;
          top: clamp(14px, 2.2vw, 24px);
          right: clamp(14px, 2.2vw, 24px);
          z-index: 10;
          background: #ffdca7;
          border: 3px solid #e79a2f;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 900;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12),
            inset 0 2px 0 rgba(255, 255, 255, 0.4);
        }

        .container {
          width: min(720px, 92vw);
          margin: clamp(24px, 6vw, 80px) auto;
          background: #fffaf1;
          border-radius: 18px;
          padding: clamp(18px, 3vw, 28px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
          position: relative;
          z-index: 2;
        }

        .title {
          margin: 0 0 10px;
          line-height: 1.05;
        }

        .script {
          font: 700 clamp(34px, 3.6vw, 44px) "Caveat", cursive;
          color: #222;
          text-shadow: 0 2px 0 rgba(255, 255, 255, 0.4);
        }

        .strong {
          font-weight: 900;
          font-size: clamp(22px, 2.2vw, 28px);
        }

        .intro {
          margin: 10px 0 12px;
          font-size: clamp(15px, 1.6vw, 17px);
          color: rgba(0, 0, 0, 0.78);
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 8px 0 12px;
          flex-wrap: wrap;
        }

        .updated {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.72);
        }
        .updated .label {
          font-weight: 900;
        }

        .loading,
        .empty {
          margin: 12px 0 0;
          padding: 12px 14px;
          border-radius: 14px;
          background: #ffe9c4;
          border: 1px solid #f1c27a;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          font-weight: 800;
          color: rgba(0, 0, 0, 0.78);
        }

        .error {
          margin: 12px 0 0;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.18);
          font-weight: 900;
          color: #7a1f1f;
        }
        .errorSmall {
          margin-top: 6px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.72);
          font-size: 12px;
          word-break: break-word;
        }

        .table {
          margin: 10px 0 14px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #f1c27a;
          background: #fffdf6;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
        }

        .thead {
          display: grid;
          grid-template-columns: 64px 1fr 120px 84px;
          gap: 10px;
          padding: 10px 12px;
          background: #ffe9c4;
          border-bottom: 1px solid #f1c27a;
          font-weight: 900;
          font-size: 13px;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.76);
        }

        .trow {
          display: grid;
          grid-template-columns: 64px 1fr 120px 84px;
          gap: 10px;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          align-items: center;
        }
        .trow:last-child {
          border-bottom: none;
        }

        .cell {
          font-size: 15px;
        }
        .cell.rank {
          font-weight: 900;
        }
        .cell.user {
          font-weight: 900;
          letter-spacing: 0.2px;
        }
        .cell.time {
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }
        .right {
          text-align: right;
          font-variant-numeric: tabular-nums;
          font-weight: 800;
        }

        .outside {
          margin: 14px 0 10px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #ffe9c4;
          border: 1px solid #f1c27a;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }
        .outsideTitle {
          font-weight: 900;
          margin: 0 0 10px;
        }
        .outsideRow {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          font-weight: 900;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 6px 10px;
          border: 3px solid #e79a2f;
          background: #ffdca7;
          font-size: 12px;
          text-transform: uppercase;
        }
        .outsideUser {
          font-size: 16px;
        }
        .outsideTime,
        .outsidePerfect {
          font-variant-numeric: tabular-nums;
          font-size: 15px;
          font-weight: 800;
        }

        .note {
          margin: 10px 0 0;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.78);
          line-height: 1.5;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .btn {
          appearance: none;
          border: 3px solid #e79a2f;
          background: #ffdca7;
          color: #222;
          font-weight: 900;
          border-radius: 999px;
          padding: 12px 22px;
          text-transform: uppercase;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.16),
            inset 0 2px 0 rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: clamp(13px, 1.2vw, 14px);
          text-decoration: none;
        }

        .btn.small {
          padding: 10px 14px;
          font-size: 12px;
        }

        .btn.ghost {
          background: #fff;
          border-color: #e8e8e8;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 900px) {
          .container {
            width: calc(100vw - 28px);
            margin: 18px auto 24px;
          }
          .thead,
          .trow {
            grid-template-columns: 54px 1fr 98px 70px;
          }
          .actions .btn {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}