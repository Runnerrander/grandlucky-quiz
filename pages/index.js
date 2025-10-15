// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/**
 * Single source of truth for finishers (username + display time).
 * Top 6 and Next 20 are derived by username so all three lists stay in sync.
 */
const ALL = [
  { username: "GL-UJQA", time: "00:05.362" },
  { username: "GL-FB5U", time: "00:05.756" },
  { username: "GL-V5UM", time: "00:07.198" },
  { username: "GL-JUNA", time: "00:08.391" },
  { username: "GL-WO9I", time: "00:10.639" },
  { username: "GL-QX3V", time: "00:12.101" },

  // Next 20 (add the rest you want visible here to complete your 20)
  { username: "GL-OVEN", time: "00:22.459" },
  { username: "GL-JCWO", time: "00:22.597" },
  { username: "GL-NCAD", time: "00:25.069" },
  { username: "GL-6X2U", time: "00:26.767" },
  { username: "GL-ANN7", time: "00:26.788" },
  { username: "GL-IFNC", time: "00:28.143" },
  { username: "GL-PSKY", time: "00:29.851" },
  { username: "GL-KKHC", time: "00:30.735" },
  { username: "GL-PWIQ", time: "00:40.077" },
  { username: "GL-GAZT", time: "00:39.230" },
  { username: "GL-Q6QJ", time: "00:39.619" },

  // Others (sample — include as many as you want to show)
  { username: "GL-ONCU", time: "00:37.114" },
  { username: "GL-HUVF", time: "00:38.977" },
  { username: "GL-VD5B", time: "00:39.139" },
  { username: "GL-SA2T", time: "00:39.230" },
  { username: "GL-0KYS", time: "01:01.551" },
  { username: "GL-LFJT", time: "01:01.245" },
  { username: "GL-UGER", time: "00:52.418" },
  { username: "GL-WSXW", time: "00:52.147" },
  { username: "GL-DIMW", time: "00:55.006" },
  { username: "GL-ERPN", time: "00:55.603" },
  { username: "GL-L7MH", time: "01:11.118" },
  { username: "GL-6VI8", time: "01:11.686" },
  { username: "GL-ZRXW", time: "01:14.234" },
  { username: "GL-MDE7", time: "01:14.846" },
  { username: "GL-KEQD", time: "01:15.804" },
  { username: "GL-XZJE", time: "01:10.376" },
  { username: "GL-12I0", time: "02:29.860" },
  { username: "GL-ORSO", time: "02:06.653" },
  { username: "GL-ESAX", time: "02:18.995" },
  { username: "GL-E9XM", time: "01:57.403" },
];

const TOP6_USERNAMES = ["GL-UJQA", "GL-FB5U", "GL-V5UM", "GL-JUNA", "GL-WO9I", "GL-QX3V"];
const NEXT20_USERNAMES = [
  "GL-OVEN",
  "GL-JCWO",
  "GL-NCAD",
  "GL-6X2U",
  "GL-ANN7",
  "GL-IFNC",
  "GL-PSKY",
  "GL-KKHC",
  "GL-PWIQ",
  "GL-GAZT",
  "GL-Q6QJ",
  // add the remaining backup names you want listed here
];

const byUser = (arr, names) =>
  names.map((u) => arr.find((r) => r.username === u)).filter(Boolean);

const normalize = (s) =>
  (s || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/–|—/g, "-");

const COPY = {
  en: {
    pageTitle: "GrandLucky Travel — Results",
    title: "The Vivko contest Round 1 has ended.",
    subtitle: "New contest coming soon.",
    banner:
      "The Vivko contest Round 1 has ended. A new contest is coming soon.",
    questions: "Questions? Email us at",
    searchPlaceholder: "Type username (e.g., GL-XX)",
    top6: "Contestants for 2nd round (Top 6)",
    next20: "Back up contestants for 2nd round (Next 20)",
    others: "All other registered (this table is searchable)",
    username: "Username",
    quizTime: "Quiz Time",
  },
  hu: {
    pageTitle: "GrandLucky Travel — Eredmények",
    title: "A Vivkó nyereményjáték 1. fordulója lezárult.",
    subtitle: "Hamarosan új játék indul.",
    banner:
      "A Vivkó nyereményjáték első fordulója lezárult. Hamarosan új játék indul.",
    questions: "Kérdés esetén írj nekünk:",
    searchPlaceholder: "Írd be a felhasználónevet (pl. GL-XX)",
    top6: "2. forduló versenyzői (Top 6)",
    next20: "Tartalék versenyzők (Következő 20)",
    others: "Többi regisztrált (ez a tábla kereshető)",
    username: "Felhasználónév",
    quizTime: "Kvízidő",
  },
};

export default function ResultsPage() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [queryOthers, setQueryOthers] = useState("");

  const t = COPY[lang];

  const TOP6 = useMemo(() => byUser(ALL, TOP6_USERNAMES), []);
  const NEXT20 = useMemo(() => byUser(ALL, NEXT20_USERNAMES), []);
  const OTHERS = useMemo(() => {
    const picked = new Set([...TOP6, ...NEXT20].map((r) => r.username));
    return ALL.filter((r) => !picked.has(r.username));
  }, [TOP6, NEXT20]);

  const searchHit = useMemo(() => {
    const q = normalize(query);
    if (!q) return null;
    return ALL.find((r) => normalize(r.username) === q) || null;
  }, [query]);

  const filteredOthers = useMemo(() => {
    const q = normalize(queryOthers);
    if (!q) return OTHERS;
    return OTHERS.filter((r) => normalize(r.username).includes(q));
  }, [OTHERS, queryOthers]);

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

        {/* Find your result (single hit row like the orange page) */}
        <section className="block">
          <div className="row head">
            <div className="cell head">{t.username}</div>
            <div className="cell head right">{t.quizTime}</div>
          </div>

          <input
            className="input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
          />

          <div className="row">
            {searchHit ? (
              <>
                <div className="cell">{searchHit.username}</div>
                <div className="cell right">{searchHit.time}</div>
              </>
            ) : (
              <div className="cell muted">No matches.</div>
            )}
          </div>
        </section>

        {/* Top 6 */}
        <h3 className="sectionTitle">{t.top6}</h3>
        <section className="block">
          <div className="row head">
            <div className="cell head">{t.username}</div>
            <div className="cell head right">{t.quizTime}</div>
          </div>
          {TOP6.map((r) => (
            <div className="row" key={`top-${r.username}`}>
              <div className="cell">{r.username}</div>
              <div className="cell right">{r.time}</div>
            </div>
          ))}
        </section>

        {/* Next 20 */}
        <h3 className="sectionTitle">{t.next20}</h3>
        <section className="block">
          <div className="row head">
            <div className="cell head">{t.username}</div>
            <div className="cell head right">{t.quizTime}</div>
          </div>
          {NEXT20.map((r) => (
            <div className="row" key={`n20-${r.username}`}>
              <div className="cell">{r.username}</div>
              <div className="cell right">{r.time}</div>
            </div>
          ))}
        </section>

        {/* All others (searchable table) */}
        <h3 className="sectionTitle">{t.others}</h3>
        <input
          className="input"
          type="text"
          value={queryOthers}
          onChange={(e) => setQueryOthers(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
        />
        <section className="block">
          <div className="row head">
            <div className="cell head">{t.username}</div>
            <div className="cell head right">{t.quizTime}</div>
          </div>
          {filteredOthers.map((r) => (
            <div className="row" key={`other-${r.username}`}>
              <div className="cell">{r.username}</div>
              <div className="cell right">{r.time}</div>
            </div>
          ))}
        </section>
      </main>

      <style jsx>{`
        :root {
          --bg: #ec9733; /* orange like your working screenshot */
          --panel: transparent;
          --ink: #111;
          --muted: #2b2b2b;
          --sep: rgba(0, 0, 0, 0.12);
          --banner: #fdeed9;
          --banner-border: rgba(0, 0, 0, 0.1);
        }
        * { box-sizing: border-box; }
        html, body, .page {
          margin: 0;
          padding: 0;
          background: var(--bg);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            "Helvetica Neue", Arial, "Noto Sans";
        }
        .page { padding: 16px 12px 56px; }
        .hero { text-align: center; }
        .title {
          margin: 12px 0 6px;
          font-size: 28px;
          font-weight: 800;
        }
        .sub { margin: 0 0 12px; font-weight: 600; }
        .lang {
          display: inline-flex; gap: 6px; background: #f7e0b6;
          border-radius: 999px; padding: 4px;
        }
        .lang button {
          border: 0; border-radius: 999px; padding: 6px 12px; background: transparent;
          font-weight: 700; cursor: pointer; color: #584015;
        }
        .lang button.on { background: #fff; color: #111; }

        .banner {
          max-width: 980px; margin: 12px auto 16px; background: var(--banner);
          border: 1px solid var(--banner-border); border-radius: 8px; padding: 12px 14px;
        }
        .banner a { color: #1d1d1f; font-weight: 700; }

        .sectionTitle {
          max-width: 980px; margin: 18px auto 6px; font-size: 16px; font-weight: 800;
        }
        .block {
          max-width: 980px; margin: 0 auto 8px; background: var(--panel);
        }

        .row {
          display: grid; grid-template-columns: 1fr 140px; align-items: center;
          border-bottom: 1px solid var(--sep);
        }
        .row:last-child { border-bottom: 0; }
        .row.head { font-weight: 800; }
        .cell { padding: 8px 6px; font-size: 15px; }
        .right { text-align: right; }
        .muted { color: #222; opacity: 0.7; }

        .input {
          width: 100%; max-width: 980px; display: block; margin: 6px auto 10px;
          height: 36px; padding: 6px 10px; border-radius: 8px; border: 1px solid #d9b072;
          background: #fff; outline: none; font-size: 14px;
        }

        @media (max-width: 520px) {
          .row { grid-template-columns: 1fr 120px; }
          .cell { font-size: 14px; }
        }
      `}</style>
    </>
  );
}
