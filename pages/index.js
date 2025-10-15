// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/**
 * --- What this file does ---
 * - Restores the ORIGINAL orange layout and colors.
 * - Shows THREE sections:
 *    1) Top 6
 *    2) Back up contestants (Next 20)
 *    3) All other finishers (everyone else who finished)
 * - Keeps the simple search by username (GL-XXXX).
 *
 * Data notes:
 * - TOP6 and NEXT20 are your original lists that matched your earlier page.
 * - "ALL" below contains every completed attempt you pasted (correct=5 & time>0).
 *   We derive the third section by removing TOP6 & NEXT20 from ALL.
 */

/* ---------- Top 6 (your original working list) ---------- */
const TOP6 = [
  { username: "GL-UJQA", time: "00:05.362" },
  { username: "GL-FB5U", time: "00:05.756" },
  { username: "GL-V5UM", time: "00:07.198" },
  { username: "GL-JUNA", time: "00:08.391" },
  { username: "GL-WO9I", time: "00:10.639" },
  { username: "GL-QX3V", time: "00:12.101" },
];

/* ---------- Next 20 (your original working list) ---------- */
const NEXT20 = [
  { username: "GL-OVEN", time: "00:22.459" },
  { username: "GL-JCWO", time: "00:22.597" },
  { username: "GL-NCAD", time: "00:25.069" },
  { username: "GL-6XZU", time: "00:26.767" },
  { username: "GL-ANN7", time: "00:26.788" },
  { username: "GL-IFNC", time: "00:28.143" },
  { username: "GL-PSKY", time: "00:29.851" },
  { username: "GL-KKHC", time: "00:30.735" },
  // keep the same ordering you used before (these three were in your sheet)
  { username: "GL-Z9PW", time: "00:30.142" },
  { username: "GL-SFUR", time: "00:31.604" },
  { username: "GL-P35S", time: "00:32.575" },

  { username: "GL-JJRR", time: "00:32.996" },
  { username: "GL-GAZT", time: "00:39.230" },
  { username: "GL-PWIQ", time: "00:40.077" },
  { username: "GL-B9NC", time: "00:42.151" },
  { username: "GL-THCM", time: "00:51.204" },
  // these three were in your sheet in this order
  { username: "GL-ESAX", time: "02:18.995" },
  { username: "GL-12I0", time: "02:29.860" },
  { username: "GL-ORSO", time: "02:06.653" },

  { username: "qa.091", time: "03:32.204" },
];

/* ---------- ALL finishers (built from the data you pasted) ---------- */
/* We only keep rows where correct === 5 and time_ms > 0 */
const RAW = [
  {"idx":0,"id":208,"username":"GL-HABY","time_ms":72711,"correct":5,"time_mm_ss_ms":"01:12.711"},
  {"idx":1,"id":209,"username":"GL-QX3V","time_ms":12101,"correct":5,"time_mm_ss_ms":"00:12.101"},
  {"idx":2,"id":210,"username":"GL-WO9I","time_ms":10639,"correct":5,"time_mm_ss_ms":"00:10.639"},
  {"idx":3,"id":211,"username":"GL-FB5U","time_ms":5756,"correct":5,"time_mm_ss_ms":"00:05.756"},
  {"idx":4,"id":212,"username":"GL-UJQA","time_ms":5362,"correct":5,"time_mm_ss_ms":"00:05.362"},
  {"idx":5,"id":213,"username":"GL-IGMV","time_ms":51550,"correct":5,"time_mm_ss_ms":"00:51.550"},
  {"idx":6,"id":214,"username":"GL-UGER","time_ms":52418,"correct":5,"time_mm_ss_ms":"00:52.418"},
  {"idx":7,"id":215,"username":"GL-6AKS","time_ms":55475,"correct":5,"time_mm_ss_ms":"00:55.475"},
  {"idx":8,"id":216,"username":"GL-JUNA","time_ms":8391,"correct":5,"time_mm_ss_ms":"00:08.391"},
  {"idx":9,"id":217,"username":"GL-9PVN","time_ms":110606,"correct":5,"time_mm_ss_ms":"01:50.606"},
  {"idx":10,"id":218,"username":"GL-ZLQP","time_ms":134875,"correct":5,"time_mm_ss_ms":"02:14.875"},
  {"idx":11,"id":219,"username":"GL-CQTA","time_ms":42039,"correct":5,"time_mm_ss_ms":"00:42.039"},
  {"idx":12,"id":220,"username":"GL-HUVF","time_ms":38977,"correct":5,"time_mm_ss_ms":"00:38.977"},
  {"idx":13,"id":221,"username":"GL-D3S5","time_ms":103216,"correct":5,"time_mm_ss_ms":"01:43.216"},
  {"idx":14,"id":222,"username":"GL-XZJE","time_ms":70376,"correct":5,"time_mm_ss_ms":"01:10.376"},
  {"idx":15,"id":223,"username":"GL-F5VI","time_ms":45568,"correct":5,"time_mm_ss_ms":"00:45.568"},
  {"idx":16,"id":224,"username":"GL-GOIS","time_ms":359008,"correct":5,"time_mm_ss_ms":"05:59.008"},
  {"idx":17,"id":225,"username":"GL-LYMP","time_ms":132258,"correct":5,"time_mm_ss_ms":"02:12.258"},
  {"idx":18,"id":226,"username":"GL-6L9E","time_ms":36177,"correct":5,"time_mm_ss_ms":"00:36.177"},
  {"idx":19,"id":227,"username":"GL-HOCK","time_ms":44670,"correct":5,"time_mm_ss_ms":"00:44.670"},
  {"idx":20,"id":228,"username":"GL-DIMW","time_ms":55006,"correct":5,"time_mm_ss_ms":"00:55.006"},
  {"idx":21,"id":229,"username":"GL-WSXW","time_ms":52147,"correct":5,"time_mm_ss_ms":"00:52.147"},
  {"idx":22,"id":230,"username":"GL-ONCU","time_ms":37114,"correct":5,"time_mm_ss_ms":"00:37.114"},
  {"idx":23,"id":231,"username":"GL-T1TU","time_ms":35231,"correct":5,"time_mm_ss_ms":"00:35.231"},
  {"idx":24,"id":232,"username":"GL-GAZT","time_ms":39230,"correct":5,"time_mm_ss_ms":"00:39.230"},
  {"idx":25,"id":233,"username":"GL-0KYS","time_ms":61551,"correct":5,"time_mm_ss_ms":"01:01.551"},
  {"idx":26,"id":234,"username":"qa.091","time_ms":212204,"correct":5,"time_mm_ss_ms":"03:32.204"},
  {"idx":27,"id":235,"username":"GL-E9XM","time_ms":117403,"correct":5,"time_mm_ss_ms":"01:57.403"},
  {"idx":28,"id":236,"username":"GL-YGY9","time_ms":28252,"correct":5,"time_mm_ss_ms":"00:28.252"},
  {"idx":29,"id":237,"username":"GL-THCM","time_ms":51204,"correct":5,"time_mm_ss_ms":"00:51.204"},
  {"idx":30,"id":238,"username":"GL-ANN7","time_ms":26788,"correct":5,"time_mm_ss_ms":"00:26.788"},
  {"idx":31,"id":239,"username":"GL-Q6QJ","time_ms":39619,"correct":5,"time_mm_ss_ms":"00:39.619"},
  {"idx":32,"id":240,"username":"GL-2RPL","time_ms":73680,"correct":5,"time_mm_ss_ms":"01:13.680"},
  {"idx":33,"id":241,"username":"GL-GCAH","time_ms":76961,"correct":5,"time_mm_ss_ms":"01:16.961"},
  {"idx":34,"id":242,"username":"GL-OVEN","time_ms":22459,"correct":5,"time_mm_ss_ms":"00:22.459"},
  {"idx":35,"id":243,"username":"GL-E8YO","time_ms":247502,"correct":5,"time_mm_ss_ms":"04:07.502"},
  {"idx":36,"id":244,"username":"GL-IFNC","time_ms":28143,"correct":5,"time_mm_ss_ms":"00:28.143"},
  {"idx":37,"id":245,"username":"GL-PBQM","time_ms":189435,"correct":5,"time_mm_ss_ms":"03:09.435"},
  {"idx":38,"id":246,"username":"GL-ZNAM","time_ms":70323,"correct":5,"time_mm_ss_ms":"01:10.323"},
  {"idx":39,"id":247,"username":"GL-YWZP","time_ms":233971,"correct":5,"time_mm_ss_ms":"03:53.971"},
  {"idx":40,"id":248,"username":"GL-ERPN","time_ms":55603,"correct":5,"time_mm_ss_ms":"00:55.603"},
  {"idx":41,"id":249,"username":"GL-JJRR","time_ms":32996,"correct":5,"time_mm_ss_ms":"00:32.996"},
  {"idx":42,"id":250,"username":"GL-OH1J","time_ms":55092,"correct":5,"time_mm_ss_ms":"00:55.092"},
  {"idx":43,"id":251,"username":"GL-LFJT","time_ms":61245,"correct":5,"time_mm_ss_ms":"01:01.245"},
  {"idx":44,"id":252,"username":"GL-VH35","time_ms":449747,"correct":5,"time_mm_ss_ms":"07:29.747"},
  {"idx":45,"id":253,"username":"GL-DFWD","time_ms":78498,"correct":5,"time_mm_ss_ms":"01:18.498"},
  {"idx":46,"id":254,"username":"GL-MDE7","time_ms":74846,"correct":5,"time_mm_ss_ms":"01:14.846"},
  {"idx":47,"id":255,"username":"GL-HCNP","time_ms":106663,"correct":5,"time_mm_ss_ms":"01:46.663"},
  {"idx":48,"id":256,"username":"GL-ZRXW","time_ms":74234,"correct":5,"time_mm_ss_ms":"01:14.234"},
  {"idx":49,"id":257,"username":"GL-ZYLH","time_ms":43675,"correct":5,"time_mm_ss_ms":"00:43.675"},
  {"idx":50,"id":258,"username":"GL-P9BX","time_ms":51464,"correct":5,"time_mm_ss_ms":"00:51.464"},
  {"idx":51,"id":259,"username":"GL-6QRH","time_ms":290891,"correct":5,"time_mm_ss_ms":"04:50.891"},
  {"idx":52,"id":260,"username":"GL-L7MH","time_ms":71118,"correct":5,"time_mm_ss_ms":"01:11.118"},
  {"idx":53,"id":261,"username":"GL-GUHH","time_ms":176442,"correct":5,"time_mm_ss_ms":"02:56.442"},
  {"idx":54,"id":262,"username":"GL-ZBUX","time_ms":86818,"correct":5,"time_mm_ss_ms":"01:26.818"},
  {"idx":55,"id":263,"username":"GL-Y7QF","time_ms":34591,"correct":5,"time_mm_ss_ms":"00:34.591"},
  {"idx":56,"id":264,"username":"GL-NCAD","time_ms":25069,"correct":5,"time_mm_ss_ms":"00:25.069"},
  {"idx":57,"id":265,"username":"GL-KHBZ","time_ms":151678,"correct":5,"time_mm_ss_ms":"02:31.678"},
  {"idx":58,"id":266,"username":"GL-AMFT","time_ms":128346,"correct":5,"time_mm_ss_ms":"02:08.346"},
  {"idx":59,"id":267,"username":"GL-KEQD","time_ms":75804,"correct":5,"time_mm_ss_ms":"01:15.804"},
  {"idx":60,"id":268,"username":"GL-G7MM","time_ms":90914,"correct":5,"time_mm_ss_ms":"01:30.914"},
  {"idx":61,"id":269,"username":"GL-PWIQ","time_ms":40077,"correct":5,"time_mm_ss_ms":"00:40.077"},
  {"idx":62,"id":270,"username":"GL-KW6A","time_ms":51331,"correct":5,"time_mm_ss_ms":"00:51.331"},
  {"idx":63,"id":271,"username":"GL-ESAX","time_ms":138995,"correct":5,"time_mm_ss_ms":"02:18.995"},
  {"idx":64,"id":272,"username":"GL-12I0","time_ms":149860,"correct":5,"time_mm_ss_ms":"02:29.860"},
  {"idx":65,"id":273,"username":"GL-ORSO","time_ms":126653,"correct":5,"time_mm_ss_ms":"02:06.653"},
  {"idx":66,"id":274,"username":"GL-OTRG","time_ms":35952,"correct":5,"time_mm_ss_ms":"00:35.952"},
  {"idx":67,"id":275,"username":"GL-PBGA","time_ms":53136,"correct":5,"time_mm_ss_ms":"00:53.136"},
  {"idx":68,"id":276,"username":"GL-6VI8","time_ms":71686,"correct":5,"time_mm_ss_ms":"01:11.686"},
  {"idx":69,"id":277,"username":"GL-OA7O","time_ms":76787,"correct":5,"time_mm_ss_ms":"01:16.787"},
  {"idx":70,"id":278,"username":"GL-R8SP","time_ms":80811,"correct":5,"time_mm_ss_ms":"01:20.811"},
  {"idx":71,"id":279,"username":"GL-MEKJ","time_ms":43838,"correct":5,"time_mm_ss_ms":"00:43.838"},
  {"idx":72,"id":280,"username":"GL-UAKO","time_ms":33708,"correct":5,"time_mm_ss_ms":"00:33.708"},
  {"idx":73,"id":281,"username":"GL-JCWO","time_ms":22597,"correct":5,"time_mm_ss_ms":"00:22.597"},
];

/* transform RAW -> ALL simple {username,time} sorted by time_ms asc */
const ALL = RAW
  .filter((r) => r.correct === 5 && typeof r.time_ms === "number" && r.time_ms > 0)
  .map((r) => ({ username: r.username, time: r.time_mm_ss_ms }))
  .sort((a, b) => {
    // sort by mm:ss.mmm as numeric milliseconds (we have time_ms but we removed it)
    // quick parse:
    const toMs = (t) => {
      const [mm, ssMs] = t.split(":");
      const [ss, ms] = ssMs.split(".");
      return parseInt(mm, 10) * 60000 + parseInt(ss, 10) * 1000 + parseInt(ms, 10);
    };
    return toMs(a.time) - toMs(b.time);
  });

/* derive OTHERS = ALL \ (TOP6 ∪ NEXT20) by username */
const setOf = (arr) => new Set(arr.map((x) => x.username.toUpperCase()));
const TOP_NEXT = setOf([...TOP6, ...NEXT20]);
const OTHERS = ALL.filter((r) => !TOP_NEXT.has(r.username.toUpperCase()));

/* ---------- helpers ---------- */
const normalize = (s) =>
  (s || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/–|—/g, "-");

const searchUser = (needle, lists) => {
  const q = normalize(needle);
  if (!q) return [];
  const hay = lists.flat();
  return hay.filter((r) => normalize(r.username) === q);
};

/* ---------- copy (EN/HU) exactly like before ---------- */
const COPY = {
  en: {
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
    others: "All other finishers",
    username: "Username",
    quizTime: "Quiz Time",
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
    others: "Többi teljesítő",
    username: "Felhasználónév",
    quizTime: "Kvízidő",
  },
};

export default function ResultsPage() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const t = COPY[lang];

  const results = useMemo(() => searchUser(query, [TOP6, NEXT20, OTHERS]), [query]);

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
            </div>

            <div className="tbody">
              {results.length === 0 ? (
                <div className="row empty">{t.noMatch}</div>
              ) : (
                results.map((r) => (
                  <div className="row" key={`find-${r.username}`}>
                    <div className="cell user">{r.username}</div>
                    <div className="cell time right">{r.time}</div>
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
            </div>
            <div className="tbody">
              {TOP6.map((r) => (
                <div className="row" key={`t6-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
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
            </div>
            <div className="tbody">
              {NEXT20.map((r) => (
                <div className="row" key={`n20-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
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
            </div>
            <div className="tbody">
              {OTHERS.map((r) => (
                <div className="row" key={`others-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        :root {
          --brand: #f4a546; /* orange background */
          --ink: #1d1d1f;
          --muted: #6b7280;
          --card: #fffaf2;
          --row-sep: #f0d2a3;
          --head: #f8e8cd;
        }

        * { box-sizing: border-box; }

        body, html, .page {
          margin: 0;
          padding: 0;
          background: var(--brand);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        }

        .page { padding: 24px 16px 56px; }
        .hero { text-align: center; }

        .title { margin: 0 0 6px; font-size: 28px; line-height: 1.2; font-weight: 800; color: #111827; }
        .sub { margin: 0 0 12px; font-size: 16px; color: #2d2d2d; font-weight: 600; }

        .lang { display: inline-flex; gap: 6px; background: #f7e0b6; border-radius: 999px; padding: 4px; }
        .lang button {
          border: 0; border-radius: 999px; padding: 6px 12px; background: transparent;
          font-weight: 700; cursor: pointer; color: #584015;
        }
        .lang button.on { background: #fff; color: #111; box-shadow: 0 1px 0 rgba(0,0,0,.08) inset; }

        .banner {
          max-width: 980px; margin: 16px auto 18px; background: #fff7ea; border-radius: 10px;
          padding: 14px 16px; border: 1px solid #f2d4a6; color: #3b2d17; font-size: 14px;
        }
        .banner a { color: #2a2a2a; font-weight: 700; text-decoration: underline; }

        .card {
          max-width: 980px; margin: 14px auto; background: #fffdf8; border-radius: 12px;
          border: 1px solid #f0d2a3; overflow: hidden; box-shadow: 0 2px 0 rgba(0,0,0,.03);
        }
        .card-head {
          padding: 14px 16px; display: grid; grid-template-columns: 1fr 320px; gap: 12px;
          align-items: center; border-bottom: 1px solid var(--row-sep);
        }
        .card-head h2 { margin: 0; font-size: 18px; font-weight: 800; }
        .card-head input {
          width: 100%; height: 40px; border-radius: 10px; border: 1px solid #e3c690; padding: 8px 10px;
          outline: none; font-size: 14px; background: #fff;
        }
        .card-head input::placeholder { color: #9a7a41; }

        .list-title { margin: 14px 16px 8px; font-size: 16px; font-weight: 800; }

        .table { display: grid; grid-auto-rows: minmax(44px, auto); }
        .thead {
          position: sticky; top: 0; display: grid; grid-template-columns: 1fr 160px;
          background: var(--head); border-bottom: 1px solid var(--row-sep); z-index: 2;
        }
        .tbody { display: grid; }
        .row {
          display: grid; grid-template-columns: 1fr 160px; background: #fff; border-bottom: 1px solid var(--row-sep);
        }
        .row:last-child { border-bottom: 0; }
        .cell { padding: 12px 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 15px; }
        .cell.head { font-weight: 800; font-size: 14px; color: #3e2d05; }
        .cell.user { font-variant-numeric: tabular-nums; }
        .cell.time { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
        .right { text-align: right; }
        .empty { grid-template-columns: 1fr; color: var(--muted); background: #fff; }

        .tableList { max-height: 420px; overflow-y: auto; border-top: 1px solid var(--row-sep); }

        @media (max-width: 820px) {
          .card-head { grid-template-columns: 1fr; }
          .table .thead, .table .row { grid-template-columns: 1fr 130px; }
          .cell { font-size: 14px; padding: 10px 12px; }
        }
        @media (max-width: 420px) {
          .table .thead, .table .row { grid-template-columns: 1fr 118px; }
          .title { font-size: 22px; }
          .sub { font-size: 14px; }
        }
      `}</style>
    </>
  );
}
