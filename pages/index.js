// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/**
 * DATA
 * ----
 * Top 6 (fastest) + Next 20 (backup) + All other finishers for Round 1.
 * Times are mm:ss.mmm. Lists match the completion export you provided.
 */
const TOP6 = [
  { username: "GL-UJQA", time: "00:05.362" },
  { username: "GL-FB5U", time: "00:05.756" },
  { username: "GL-V5UM", time: "00:07.198" },
  { username: "GL-JUNA", time: "00:08.391" },
  { username: "GL-WO9I", time: "00:10.639" },
  { username: "GL-QX3V", time: "00:12.101" },
];

// Backup 20 – keep your validated order
const NEXT20 = [
  { username: "GL-OVEN", time: "00:22.459" },
  { username: "GL-JCWO", time: "00:22.597" },
  { username: "GL-NCAD", time: "00:25.069" },
  { username: "GL-6XZU", time: "00:26.767" },
  { username: "GL-ANN7", time: "00:26.788" },
  { username: "GL-IFNC", time: "00:28.143" },
  { username: "GL-PSKY", time: "00:29.851" },
  { username: "GL-KKHC", time: "00:30.735" },
  { username: "GL-Z9PW", time: "00:30.142" },
  { username: "GL-SFUR", time: "00:31.604" },
  { username: "GL-P35S", time: "00:32.575" },
  { username: "GL-JJRR", time: "00:32.996" },
  { username: "GL-GAZT", time: "00:39.230" },
  { username: "GL-PWIQ", time: "00:40.077" },
  { username: "GL-B9NC", time: "00:42.151" },
  { username: "GL-THCM", time: "00:51.204" },
  { username: "GL-ESAX", time: "02:18.995" },
  { username: "GL-12I0", time: "02:29.860" },
  { username: "GL-ORSO", time: "02:06.653" },
  { username: "qa.091", time: "03:32.204" },
];

/**
 * All other finishers (correct=5) from your export, excluding Top6/NEXT20.
 * Order doesn’t change your Top6/Next20; feel free to reorder later by time if you want.
 */
const OTHERS = [
  { username: "GL-HABY", time: "01:12.711" },
  { username: "GL-IGMV", time: "00:51.550" },
  { username: "GL-UGER", time: "00:52.418" },
  { username: "GL-6AKS", time: "00:55.475" },
  { username: "GL-9PVN", time: "01:50.606" },
  { username: "GL-ZLQP", time: "02:14.875" },
  { username: "GL-CQTA", time: "00:42.039" },
  { username: "GL-HUVF", time: "00:38.977" },
  { username: "GL-D3S5", time: "01:43.216" },
  { username: "GL-XZJE", time: "01:10.376" },
  { username: "GL-F5VI", time: "00:45.568" },
  { username: "GL-GOIS", time: "05:59.008" },
  { username: "GL-LYMP", time: "02:12.258" },
  { username: "GL-6L9E", time: "00:36.177" },
  { username: "GL-HOCK", time: "00:44.670" },
  { username: "GL-DIMW", time: "00:55.006" },
  { username: "GL-WSXW", time: "00:52.147" },
  { username: "GL-ONCU", time: "00:37.114" },
  { username: "GL-T1TU", time: "00:35.231" },
  { username: "GL-0KYS", time: "01:01.551" },
  { username: "GL-E9XM", time: "01:57.403" },
  { username: "GL-YGY9", time: "00:28.252" },
  { username: "GL-Q6QJ", time: "00:39.619" },
  { username: "GL-2RPL", time: "01:13.680" },
  { username: "GL-GCAH", time: "01:16.961" },
  { username: "GL-E8YO", time: "04:07.502" },
  { username: "GL-PBQM", time: "03:09.435" },
  { username: "GL-ZNAM", time: "01:10.323" },
  { username: "GL-YWZP", time: "03:53.971" },
  { username: "GL-ERPN", time: "00:55.603" },
  { username: "GL-OH1J", time: "00:55.092" },
  { username: "GL-LFJT", time: "01:01.245" },
  { username: "GL-VH35", time: "07:29.747" },
  { username: "GL-DFWD", time: "01:18.498" },
  { username: "GL-MDE7", time: "01:14.846" },
  { username: "GL-HCNP", time: "01:46.663" },
  { username: "GL-ZRXW", time: "01:14.234" },
  { username: "GL-ZYLH", time: "00:43.675" },
  { username: "GL-P9BX", time: "00:51.464" },
  { username: "GL-6QRH", time: "04:50.891" },
  { username: "GL-L7MH", time: "01:11.118" },
  { username: "GL-GUHH", time: "02:56.442" },
  { username: "GL-ZBUX", time: "01:26.818" },
  { username: "GL-Y7QF", time: "00:34.591" },
  { username: "GL-KHBZ", time: "02:31.678" },
  { username: "GL-AMFT", time: "02:08.346" },
  { username: "GL-KEQD", time: "01:15.804" },
  { username: "GL-G7MM", time: "01:30.914" },
  { username: "GL-KW6A", time: "00:51.331" },
  { username: "GL-OTRG", time: "00:35.952" },
  { username: "GL-PBGA", time: "00:53.136" },
  { username: "GL-6VI8", time: "01:11.686" },
  { username: "GL-OA7O", time: "01:16.787" },
  { username: "GL-R8SP", time: "01:20.811" },
  { username: "GL-MEKJ", time: "00:43.838" },
  { username: "GL-UAKO", time: "00:33.708" },
  // Optional test/utility users with correct=5 and the same round_id:
  { username: "GL-TEST", time: "00:34.968" },
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

const withGroup = (rows, label) => rows.map((r) => ({ ...r, group: label }));

const ALL = [
  ...withGroup(TOP6, "Top 6"),
  ...withGroup(NEXT20, "Backup"),
  ...withGroup(OTHERS, "Finished"),
];

const searchUser = (needle) => {
  const q = normalize(needle);
  if (!q) return [];
  return ALL.filter((r) => normalize(r.username) === q);
};

/**
 * i18n copy
 */
const COPY = {
  en: {
    title: "The Vivko contest Round 1 has ended.",
    subtitle: "New contest coming soon.",
    banner: "The Vivko contest Round 1 has ended. A new contest is coming soon.",
    questions: "Questions? Email us at",
    searchLabel: "Find your result",
    searchPlaceholder: "Type username (e.g., GL-XX)",
    noMatch: "No matches.",
    top6: "Contestants for 2nd round (Top 6)",
    next20: "Back up contestants for 2nd round (Next 20)",
    others: "All other finishers",
    username: "Username",
    quizTime: "Quiz Time",
    group: "Group",
  },
  hu: {
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
    others: "További befejezők",
    username: "Felhasználónév",
    quizTime: "Kvízidő",
    group: "Csoport",
  },
};

export default function ResultsPage() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");

  const t = COPY[lang];
  const results = useMemo(() => searchUser(query), [query]);

  return (
    <>
      <Head>
        <title>GrandLucky Travel — Results</title>
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
              <div className="cell head">{t.group}</div>
            </div>

            <div className="tbody">
              {results.length === 0 ? (
                <div className="row empty">{t.noMatch}</div>
              ) : (
                results.map((r) => (
                  <div className="row" key={`find-${r.username}`}>
                    <div className="cell user">{r.username}</div>
                    <div className="cell time right">{r.time}</div>
                    <div className="cell">{r.group}</div>
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
              <div className="cell head">{t.group}</div>
            </div>
            <div className="tbody">
              {TOP6.map((r) => (
                <div className="row" key={`t6-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell">Top 6</div>
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
              <div className="cell head">{t.group}</div>
            </div>
            <div className="tbody">
              {NEXT20.map((r) => (
                <div className="row" key={`n20-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell">Backup</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All other finishers */}
        <section className="card">
          <h3 className="list-title">{t.others}</h3>

          <div className="table tableList">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head">{t.group}</div>
            </div>
            <div className="tbody">
              {OTHERS.map((r) => (
                <div className="row" key={`other-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell">Finished</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        :root {
          --brand: #ee8f2e; /* orange background */
          --ink: #1d1d1f;
          --muted: #6b7280;
          --card: #fff7ea;
          --row-sep: #f0d2a3;
          --head: #f8e8cd;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body,
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
          background: rgba(255, 255, 255, 0.45);
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
          color: #4a320d;
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
          background: #fffdf8;
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
          grid-template-columns: 1fr 130px 100px; /* user | time | group */
          background: var(--head);
          border-bottom: 1px solid var(--row-sep);
          z-index: 2;
        }
        .tbody {
          display: grid;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 130px 100px;
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

        /* Dedicated scrolling area so headers stick nicely */
        .tableList {
          max-height: 360px;
          overflow-y: auto;
          border-top: 1px solid var(--row-sep);
        }

        /* Mobile */
        @media (max-width: 820px) {
          .card-head {
            grid-template-columns: 1fr;
          }
          .table .thead,
          .table .row {
            grid-template-columns: 1fr 118px 86px;
          }
          .cell {
            font-size: 14px;
            padding: 10px 12px;
          }
        }
        @media (max-width: 420px) {
          .table .thead,
          .table .row {
            grid-template-columns: 1fr 110px 76px;
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
