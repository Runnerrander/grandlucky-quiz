// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/**
 * DATA (verified from your completion export)
 * -------------------------------------------
 * Only "username" and "time" are displayed. Group is derived (Top 6 / Backup).
 */

// Top 6 — fastest correct submissions
const TOP6 = [
  { username: "GL-UJQA", time: "00:05.362" },
  { username: "GL-FB5U", time: "00:05.756" },
  { username: "GL-V5UM", time: "00:07.198" },
  { username: "GL-JUNA", time: "00:08.391" },
  { username: "GL-WO9I", time: "00:10.639" },
  { username: "GL-QX3V", time: "00:12.101" },
];

// Next 20 — backups, next fastest after Top 6
const NEXT20 = [
  { username: "GL-OVEN", time: "00:22.459" },
  { username: "GL-JCWO", time: "00:22.597" },
  { username: "GL-NCAD", time: "00:25.069" },
  { username: "GL-6X2U", time: "00:26.767" },
  { username: "GL-ANN7", time: "00:26.788" },
  { username: "GL-IFNC", time: "00:28.143" },
  { username: "GL-YGY9", time: "00:28.252" },
  { username: "GL-PSKY", time: "00:29.851" },
  { username: "GL-KKHC", time: "00:30.735" },
  { username: "GL-JJRR", time: "00:32.996" },
  { username: "GL-Y7QF", time: "00:34.591" },
  { username: "GL-T1TU", time: "00:35.231" },
  { username: "GL-OTRG", time: "00:35.952" },
  { username: "GL-6L9E", time: "00:36.177" },
  { username: "GL-ONCU", time: "00:37.114" },
  { username: "GL-HUVF", time: "00:38.977" },
  { username: "GL-GAZT", time: "00:39.230" },
  { username: "GL-Q6QJ", time: "00:39.619" },
  { username: "GL-PWIQ", time: "00:40.077" },
  { username: "GL-CQTA", time: "00:42.039" },
];

/**
 * Helpers
 */
const normalize = (s) =>
  (s || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/–|—/g, "-");

const LISTS = [TOP6, NEXT20];

const groupOf = (username) => {
  const u = normalize(username);
  if (TOP6.find((r) => normalize(r.username) === u)) return "top6";
  if (NEXT20.find((r) => normalize(r.username) === u)) return "backup";
  return null;
};

const searchUser = (needle) => {
  const q = normalize(needle);
  if (!q) return [];
  const hay = LISTS.flat();
  return hay
    .filter((r) => normalize(r.username) === q)
    .map((r) => ({ ...r, group: groupOf(r.username) }));
};

/**
 * i18n copy
 */
const COPY = {
  en: {
    pageTitle: "GrandLucky Travel — Results",
    title: "The Vivko contest Round 1 has ended.",
    subtitle: "New contest coming soon.",
    banner:
      "The Vivko contest Round 1 has ended. A new contest is coming soon.",
    questions: "Questions? Email us at",
    searchLabel: "Find your result",
    searchPlaceholder: "Type username (e.g., GL-XX)",
    noMatch: "No matches.",
    top6: "Contestants for 2nd round (Top 6)",
    next20: "Back up contestants for 2nd round (Next 20)",
    username: "Username",
    quizTime: "Quiz Time",
    group: "Group",
    groupTop6: "Top 6",
    groupBackup: "Backup",
  },
  hu: {
    pageTitle: "GrandLucky Travel — Eredmények",
    title: "A Vivkó nyereményjáték 1. fordulója lezárult.",
    subtitle: "Hamarosan új játék indul.",
    banner:
      "A Vivkó nyereményjáték első fordulója lezárult. Hamarosan új játék indul.",
    questions: "Kérdés esetén írj nekünk:",
    searchLabel: "Keresd meg az eredményed",
    searchPlaceholder: "Írd be a felhasználónevet (pl. GL-XX)",
    noMatch: "Nincs találat.",
    top6: "2. forduló versenyzői (Top 6)",
    next20: "Tartalék versenyzők (Következő 20)",
    username: "Felhasználónév",
    quizTime: "Kvízidő",
    group: "Csoport",
    groupTop6: "Top 6",
    groupBackup: "Tartalék",
  },
};

export default function ResultsPage() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");

  const t = COPY[lang];

  const results = useMemo(() => searchUser(query), [query]);

  const labelForGroup = (g) =>
    g === "top6" ? t.groupTop6 : g === "backup" ? t.groupBackup : "";

  return (
    <>
      <Head>
        <title>{t.pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="page">
        <header className="hero">
          <h1 className="title">{t.title}</h1>
          <p className="sub">{t.subtitle}</p>

          <div className="lang">
            <button
              aria-pressed={lang === "hu"}
              className={lang === "hu" ? "on" : ""}
              onClick={() => setLang("hu")}
            >
              HU
            </button>
            <button
              aria-pressed={lang === "en"}
              className={lang === "en" ? "on" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </header>

        <section className="banner">
          <span>{t.banner} </span>
          <span>
            {t.questions}{" "}
            <a href="mailto:support@grandluckytravel.com">
              support@grandluckytravel.com
            </a>
          </span>
        </section>

        {/* Search */}
        <section className="card">
          <div className="card-head">
            <h2>{t.searchLabel}</h2>
            <input
              type="text"
              inputMode="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
          </div>

          <div className="table">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>

            <div className="tbody">
              {results.length === 0 ? (
                <div className="row empty">{t.noMatch}</div>
              ) : (
                results.map((r) => (
                  <div className="row" key={`find-${r.username}`}>
                    <div className="cell user">{r.username}</div>
                    <div className="cell time right">{r.time}</div>
                    <div className="cell right">{labelForGroup(r.group)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Top 6 */}
        <section className="card">
          <h3 className="list-title">{t.top6}</h3>

          <div className="table tableList">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>
            <div className="tbody">
              {TOP6.map((r) => (
                <div className="row" key={`t6-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell right">{t.groupTop6}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next 20 */}
        <section className="card">
          <h3 className="list-title">{t.next20}</h3>

          <div className="table tableList">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>
            <div className="tbody">
              {NEXT20.map((r) => (
                <div className="row" key={`n20-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell right">{t.groupBackup}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        :root {
          --brand: #f4a546;
          --brand-ink: #6b4a12;
          --ink: #1d1d1f;
          --muted: #6b7280;
          --card: #fffaf2;
          --row-sep: #f0d2a3;
          --head: #f8e8cd;
        }

        * {
          box-sizing: border-box;
        }

        body,
        html,
        .page {
          margin: 0;
          padding: 0;
          background: var(--brand);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji",
            "Segoe UI Emoji";
        }

        .page {
          padding: 24px 16px 56px;
        }

        .hero {
          text-align: center;
        }

        .title {
          margin: 0 0 6px;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 800;
          color: #111827;
        }
        .sub {
          margin: 0 0 12px;
          font-size: 16px;
          color: #2d2d2d;
          font-weight: 600;
        }

        .lang {
          display: inline-flex;
          gap: 6px;
          background: #f7e0b6;
          border-radius: 999px;
          padding: 4px;
        }
        .lang button {
          border: 0;
          border-radius: 999px;
          padding: 6px 12px;
          background: transparent;
          font-weight: 700;
          cursor: pointer;
          color: #584015;
        }
        .lang button.on {
          background: #fff;
          color: #111;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08) inset;
        }

        .banner {
          max-width: 980px;
          margin: 16px auto 18px;
          background: #fff7ea;
          border-radius: 10px;
          padding: 14px 16px;
          border: 1px solid #f2d4a6;
          color: #3b2d17;
          font-size: 14px;
        }
        .banner a {
          color: #2a2a2a;
          font-weight: 700;
          text-decoration: underline;
        }

        .card {
          max-width: 980px;
          margin: 14px auto;
          background: #fffdf8;
          border-radius: 12px;
          border: 1px solid var(--row-sep);
          overflow: hidden;
          box-shadow: 0 2px 0 rgba(0, 0, 0, 0.03);
        }

        .card-head {
          padding: 14px 16px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid var(--row-sep);
        }
        .card-head h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }
        .card-head input {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e3c690;
          padding: 8px 10px;
          outline: none;
          font-size: 14px;
          background: #fff;
        }
        .card-head input::placeholder {
          color: #9a7a41;
        }

        .list-title {
          margin: 14px 16px 8px;
          font-size: 16px;
          font-weight: 800;
        }

        .table {
          display: grid;
          grid-auto-rows: minmax(44px, auto);
        }
        .thead {
          position: sticky;
          top: 0;
          display: grid;
          grid-template-columns: 1fr 160px 120px;
          background: var(--head);
          border-bottom: 1px solid var(--row-sep);
          z-index: 2;
        }
        .tbody {
          display: grid;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 160px 120px;
          background: #fff;
          border-bottom: 1px solid var(--row-sep);
        }
        .row:last-child {
          border-bottom: 0;
        }
        .cell {
          padding: 12px 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 15px;
        }
        .cell.head {
          font-weight: 800;
          font-size: 14px;
          color: #3e2d05;
        }
        .cell.user {
          font-variant-numeric: tabular-nums;
        }
        .cell.time {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
        }
        .right {
          text-align: right;
        }
        .empty {
          grid-template-columns: 1fr;
          color: var(--muted);
          background: #fff;
        }

        /* Dedicated scrolling area for the lists so headers stick nicely */
        .tableList {
          max-height: 360px;
          overflow-y: auto;
          border-top: 1px solid var(--row-sep);
        }

        /* Mobile adjustments */
        @media (max-width: 820px) {
          .card-head {
            grid-template-columns: 1fr;
          }
          .table .thead,
          .table .row {
            grid-template-columns: 1fr 130px 100px;
          }
          .cell {
            font-size: 14px;
            padding: 10px 12px;
          }
        }
        @media (max-width: 420px) {
          .table .thead,
          .table .row {
            grid-template-columns: 1fr 118px 94px;
          }
          .title {
            font-size: 22px;
          }
          .sub {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
