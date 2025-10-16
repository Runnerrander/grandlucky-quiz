// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/* -------- DATA (>=5 correct and time_ms > 0) -------- */
const TOP6 = [
  { username: "GL-UJQA", time_ms: 5362 },
  { username: "GL-FB5U", time_ms: 5756 },
  { username: "GL-V5UM", time_ms: 7198 },
  { username: "GL-JUNA", time_ms: 8391 },
  { username: "GL-WO9I", time_ms: 10639 },
  { username: "GL-QX3V", time_ms: 12101 }
];

const NEXT20 = [
  { username: "GL-OVEN", time_ms: 22459 },
  { username: "GL-JCWO", time_ms: 22597 },
  { username: "GL-NCAD", time_ms: 25069 },
  { username: "GL-6X2U", time_ms: 26767 },
  { username: "GL-ANN7", time_ms: 26788 },
  { username: "GL-IFNC", time_ms: 28143 },
  { username: "GL-YGY9", time_ms: 28252 },
  { username: "GL-PSKY", time_ms: 29851 },
  { username: "GL-Z9PW", time_ms: 30142 },
  { username: "GL-KKHC", time_ms: 30735 },
  { username: "GL-SFUR", time_ms: 31604 },
  { username: "GL-P35S", time_ms: 32575 },
  { username: "GL-JJRR", time_ms: 32996 },
  { username: "GL-UAKO", time_ms: 33708 },
  { username: "GL-ERZD", time_ms: 33708 }, // no password on file
  { username: "GL-Y7QF", time_ms: 34591 },
  { username: "GL-TEST", time_ms: 34968 }, // no password on file
  { username: "GL-T1TU", time_ms: 35231 },
  { username: "GL-OTRG", time_ms: 35952 },
  { username: "GL-6L9E", time_ms: 36177 }
];

const OTHERS = [
  { username: "GL-ONCU", time_ms: 37114 }, { username: "GL-HUVF", time_ms: 38977 }, { username: "GL-VD5B", time_ms: 39139 },
  { username: "GL-GAZT", time_ms: 39230 }, { username: "GL-Q6QJ", time_ms: 39619 }, { username: "GL-PWIQ", time_ms: 40077 },
  { username: "GL-CQTA", time_ms: 42039 }, { username: "GL-B9NC", time_ms: 42151 }, { username: "GL-4HB6", time_ms: 43647 },
  { username: "GL-ZYLH", time_ms: 43675 }, { username: "GL-MEKJ", time_ms: 43838 }, { username: "GL-HOCK", time_ms: 44670 },
  { username: "GL-F5VI", time_ms: 45568 }, { username: "GL-THCM", time_ms: 51204 }, { username: "GL-KW6A", time_ms: 51331 },
  { username: "GL-P9BX", time_ms: 51464 }, { username: "GL-IGMV", time_ms: 51550 }, { username: "GL-NXJH", time_ms: 51886 },
  { username: "GL-WSXW", time_ms: 52147 }, { username: "GL-UGER", time_ms: 52418 }, { username: "GL-PBGA", time_ms: 53136 },
  { username: "GL-DIMW", time_ms: 55006 }, { username: "GL-OH1J", time_ms: 55092 }, { username: "GL-6AKS", time_ms: 55475 },
  { username: "GL-ERPN", time_ms: 55603 }, { username: "GL-LFJT", time_ms: 61245 }, { username: "GL-0KYS", time_ms: 61551 },
  { username: "GL-JDG3", time_ms: 63072 }, { username: "GL-MQUG", time_ms: 64414 }, { username: "GL-LXDL", time_ms: 70120 },
  { username: "GL-ZNAM", time_ms: 70323 }, { username: "GL-XZJE", time_ms: 70376 }, { username: "GL-L7MH", time_ms: 71118 },
  { username: "GL-6VI8", time_ms: 71686 }, { username: "GL-HABY", time_ms: 72711 }, { username: "GL-2RPL", time_ms: 73680 },
  { username: "GL-ZRXW", time_ms: 74234 }, { username: "GL-MDE7", time_ms: 74846 }, { username: "GL-KEQD", time_ms: 75804 },
  { username: "GL-KG6X", time_ms: 76244 }, { username: "GL-OA7O", time_ms: 76787 }, { username: "GL-GCAH", time_ms: 76961 },
  { username: "GL-DFWD", time_ms: 78498 }, { username: "GL-R8SP", time_ms: 80811 }, { username: "GL-U4HU", time_ms: 81166 },
  { username: "GL-ZBUX", time_ms: 86818 }, { username: "GL-SKWJ", time_ms: 88877 }, { username: "GL-G7MM", time_ms: 90914 },
  { username: "GL-KNPL", time_ms: 93432 }, { username: "GL-D3S5", time_ms: 103216 }, { username: "GL-5XWQ", time_ms: 105621 },
  { username: "GL-HCNP", time_ms: 106663 }, { username: "GL-9PVN", time_ms: 110606 }, { username: "GL-PB9B", time_ms: 111820 },
  { username: "GL-E9XM", time_ms: 117403 }, { username: "GL-JSA9", time_ms: 125788 }, { username: "GL-ORSO", time_ms: 126653 },
  { username: "GL-AMFT", time_ms: 128346 }, { username: "GL-LYMP", time_ms: 132258 }, { username: "GL-ZLQP", time_ms: 134875 },
  { username: "GL-ESAX", time_ms: 138995 }, { username: "GL-12I0", time_ms: 149860 }, { username: "GL-KHBZ", time_ms: 151678 },
  { username: "GL-PUXZ", time_ms: 157298 }, { username: "GL-GUHH", time_ms: 176442 }, { username: "GL-PBQM", time_ms: 189435 },
  { username: "GL-L8HB", time_ms: 211507 }, { username: "qa.091", time_ms: 212204 }, { username: "GL-LT9B", time_ms: 225765 },
  { username: "GL-UUFQ", time_ms: 231437 }, { username: "GL-YWZP", time_ms: 233971 }, { username: "GL-E8YO", time_ms: 247502 },
  { username: "GL-225U", time_ms: 284724 }, { username: "GL-6QRH", time_ms: 290891 }, { username: "GL-GOIS", time_ms: 359008 },
  { username: "GL-VH35", time_ms: 449747 }
];

/* -------- Round 2 credentials (Top6 + Next20 where we have one) -------- */
const R2_CREDENTIALS = {
  // Top 6
  "GL-UJQA": "PASS-UJQA",
  "GL-FB5U": "PASS-FB5U",
  "GL-V5UM": "xGw8pMEN",
  "GL-JUNA": "PASS-JUNA",
  "GL-WO9I": "PASS-WO9I",
  "GL-QX3V": "PASS-QX3V",
  // Backups
  "GL-OVEN": "PASS-OVEN",
  "GL-JCWO": "PASS-JCWO",
  "GL-NCAD": "PASS-NCAD",
  "GL-6X2U": "gZqf2Dxh",
  "GL-ANN7": "PASS-ANN7",
  "GL-IFNC": "PASS-IFNC",
  "GL-YGY9": "PASS-YGY9",
  "GL-PSKY": "MyQCnwGa",
  "GL-Z9PW": "QHDec8pv",
  "GL-KKHC": "neeWLzT3",
  "GL-SFUR": "oZzeYhxk",
  "GL-P35S": "wHiE5BV6",
  "GL-JJRR": "PASS-JJRR",
  "GL-UAKO": "PASS-UAKO",
  // GL-ERZD: no password provided
  "GL-Y7QF": "PASS-Y7QF",
  // GL-TEST: no password provided
  "GL-T1TU": "PASS-T1TU",
  "GL-OTRG": "PASS-OTRG",
  "GL-6L9E": "PASS-6L9E"
};

/* -------- Zoom -------- */
const ZOOM_URL = "https://us05web.zoom.us/j/85402282413?pwd=FkbbboEQv04N1LXAkNcFB6yZtyEfuD.1";

/* -------- i18n -------- */
const STR = {
  en: {
    heroTitle: "The Vivko contest Round 1 has ended.",
    heroSub: "New contest coming soon.",
    infoP: "The Vivko contest Round 1 has ended. A new contest is coming soon.",
    contact: "Questions? Email us at",
    find: "Find your result",
    searchPh: "Type username (e.g., GL-XXXX)...",
    username: "Username",
    time: "Quiz Time",
    group: "Group",
    gTop: "Top 6",
    gBackups: "Backups",
    gOthers: "Others",
    s1: "Contestants for 2nd round (Top 6)",
    s2: "Back up contestants for 2nd round (Next 20)",
    s3: "All other registered (this table is searchable)",
    noMatches: "No matches.",
    noResults: "No results.",
    zoomTitle: "Round 2 — Zoom access",
    zoomIntro: "Enter the username & password from registration to reveal the Zoom link.",
    zoomUser: "Username",
    zoomPass: "Password",
    zoomReveal: "Reveal Zoom link",
    zoomBad: "Invalid credentials or not eligible.",
    zoomShown: "Join Zoom",
    zoomCopy: "Copy link",
    zoomCopied: "Copied!"
  },
  hu: {
    heroTitle: "A Vivkó nyereményjáték 1. fordulója lezárult.",
    heroSub: "Hamarosan új játék indul.",
    infoP: "A Vivkó nyereményjáték első fordulója lezárult. Hamarosan új játék indul.",
    contact: "Kérdés esetén írj nekünk:",
    find: "Keresd meg az eredményed",
    searchPh: "Írd be a felhasználónevet (pl. GL-XXXX)...",
    username: "Felhasználónév",
    time: "Kvízidő",
    group: "Csoport",
    gTop: "Top 6",
    gBackups: "Tartalékok",
    gOthers: "Egyéb",
    s1: "2. forduló versenyzői (Top 6)",
    s2: "Tartalék versenyzők (Következő 20)",
    s3: "Többi regisztrált (ez a tábla kereshető)",
    noMatches: "Nincs találat.",
    noResults: "Nincs eredmény.",
    zoomTitle: "2. forduló — Zoom hozzáférés",
    zoomIntro: "Írd be a regisztrációnál kapott felhasználónevet és jelszót a Zoom link megjelenítéséhez.",
    zoomUser: "Felhasználónév",
    zoomPass: "Jelszó",
    zoomReveal: "Zoom link megjelenítése",
    zoomBad: "Hibás adatok vagy nem jogosult.",
    zoomShown: "Csatlakozás Zoomhoz",
    zoomCopy: "Link másolása",
    zoomCopied: "Másolva!"
  }
};

/* -------- helpers -------- */
const norm = (s) => (s || "").toString().trim().toUpperCase().replace(/\s+/g, "");
const normalizeUsername = (u) => norm(u).replace(/^GL-/, "GL").replace(/^GL(?=[A-Z0-9]{4}$)/, "GL-");
const fmt = (ms) => {
  const t = Math.max(0, Math.floor(ms || 0));
  const mm = String(Math.floor(t / 60000)).padStart(2, "0");
  const ss = String(Math.floor((t % 60000) / 1000)).padStart(2, "0");
  const mmm = String(t % 1000).padStart(3, "0");
  return `${mm}:${ss}.${mmm}`;
};
const lev1 = (a, b) => {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, e = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++e > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  if (i < la || j < lb) e++;
  return e <= 1;
};
const fuzzyMatch = (hay, needle) => {
  if (!needle) return true;
  if (hay.includes(needle)) return true;
  const H = [hay, hay.replace(/^GL-/, "")];
  const N = [needle, needle.replace(/^GL-/, "")];
  for (const h of H) for (const n of N) if (lev1(h, n)) return true;
  return false;
};

/* -------- small components -------- */
function Section({ title, items, searchable, dict }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    if (!searchable || !q) return items;
    const n = normalizeUsername(q);
    return items.filter((r) => fuzzyMatch(normalizeUsername(r.username), n));
  }, [items, q, searchable]);
  return (
    <section className="card">
      <div className="bar">{title}</div>
      {searchable ? (
        <div className="head">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.searchPh}
            aria-label={dict.searchPh}
            className="search"
          />
        </div>
      ) : null}
      <div className={`table ${searchable ? "tall" : "med"}`}>
        <div className="thead">
          <div className="cell head">{dict.username}</div>
          <div className="cell head right">{dict.time}</div>
        </div>
        {list.length === 0 ? (
          <div className="row empty">{dict.noResults}</div>
        ) : (
          list.map((r) => (
            <div key={r.username} className="row">
              <div className="cell">{r.username}</div>
              <div className="cell right">{fmt(r.time_ms)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function GlobalSearch({ top6, next20, others, dict }) {
  const [q, setQ] = useState("");
  const all = useMemo(() => {
    const tag = (arr, g) => arr.map((x) => ({ ...x, group: g }));
    return [...tag(top6, dict.gTop), ...tag(next20, dict.gBackups), ...tag(others, dict.gOthers)];
  }, [top6, next20, others, dict]);
  const results = useMemo(() => {
    const n = normalizeUsername(q);
    if (!n) return [];
    return all.filter((x) => fuzzyMatch(normalizeUsername(x.username), n)).slice(0, 50);
  }, [all, q]);

  return (
    <section className="card">
      <div className="bar">{dict.find}</div>
      <div className="head">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.searchPh}
          aria-label={dict.searchPh}
          className="search"
        />
      </div>
      {q ? (
        <div className="table">
          <div className="thead three">
            <div className="cell head">{dict.username}</div>
            <div className="cell head right">{dict.time}</div>
            <div className="cell head">{dict.group}</div>
          </div>
          {results.length === 0 ? (
            <div className="row empty">{dict.noMatches}</div>
          ) : (
            results.map((r) => (
              <div key={`${r.username}-${r.group}`} className="row three">
                <div className="cell">{r.username}</div>
                <div className="cell right">{fmt(r.time_ms)}</div>
                <div className="cell">{r.group}</div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}

function ZoomGate({ dict }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [ok, setOk] = useState(false);
  const [copied, setCopied] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const U = normalizeUsername(u);
    const pass = R2_CREDENTIALS[U] || R2_CREDENTIALS[U.replace(/^GL-/, "GL")];
    setOk(Boolean(pass && p === pass));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ZOOM_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <aside className="zoom">
      <div className="bar">{dict.zoomTitle}</div>
      <div className="zoomInner">
        <p className="zoomIntro">{dict.zoomIntro}</p>
        {!ok ? (
          <form onSubmit={onSubmit} className="zoomForm">
            <label>
              {dict.zoomUser}
              <input value={u} onChange={(e) => setU(e.target.value)} placeholder="GL-XXXX" autoComplete="username" required />
            </label>
            <label>
              {dict.zoomPass}
              <input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="********" autoComplete="current-password" required />
            </label>
            <button type="submit" className="revealBtn">{dict.zoomReveal}</button>
            {(u || p) ? <div className="zoomError">{dict.zoomBad}</div> : null}
          </form>
        ) : (
          <div className="zoomReveal">
            <a className="zoomLink" href={ZOOM_URL} target="_blank" rel="noreferrer">{dict.zoomShown}</a>
            <button className="copyBtn" onClick={copy}>{copied ? dict.zoomCopied : dict.zoomCopy}</button>
          </div>
        )}
      </div>
    </aside>
  );
}

/* -------- page component -------- */
function IndexPage() {
  const [lang, setLang] = useState("en");
  const dict = STR[lang];

  return (
    <>
      <Head>
        <title>GrandLucky Travel — Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx global>{`
        :root{
          --page-yellow:#F4A53B;
          --accent:#faaf3b;
          --ink:#111;
          --border:#e79f47;
          --card:#fff;
          --thead:#fae4c8;
          --row-sep:#eee;
        }
        html,body{ background:var(--page-yellow); color:var(--ink); }
        a{ color:#1f2937; }
      `}</style>

      <main className="wrap">
        <div className="content">
          <header className="hero">
            <h1 className="h1">{dict.heroTitle}</h1>
            <p className="sub">{dict.heroSub}</p>
            <div className="lang">
              <button onClick={() => setLang("hu")} className={`btn ${lang==="hu"?"on":""}`}>HU</button>
              <button onClick={() => setLang("en")} className={`btn ${lang==="en"?"on":""}`}>EN</button>
            </div>
          </header>

          <section className="info">
            <p style={{ margin: "6px 0" }}>{dict.infoP}</p>
            <p style={{ margin: 0 }}>
              {dict.contact} <a href="mailto:support@grandluckytravel.com">support@grandluckytravel.com</a>
            </p>
          </section>

          <GlobalSearch top6={TOP6} next20={NEXT20} others={OTHERS} dict={dict} />
          <Section title={dict.s1} items={TOP6} dict={dict} />
          <Section title={dict.s2} items={NEXT20} dict={dict} />
          <Section title={dict.s3} items={OTHERS} searchable dict={dict} />
        </div>

        <ZoomGate dict={dict} />
      </main>

      <style jsx>{`
        .wrap{
          max-width:1180px; margin:0 auto; padding:24px 10px 56px;
          display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:16px;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,"Helvetica Neue",Arial,"Noto Sans";
        }
        @media (max-width:980px){ .wrap{ grid-template-columns:1fr; } }

        .content{ min-width:0; }
        .hero{ text-align:center; margin-bottom:8px; }
        .h1{ margin:0 0 6px; font-size:28px; line-height:1.2; font-weight:800; }
        .sub{ margin:0; font-size:16px; opacity:.9; }
        .lang{ margin-top:10px; display:inline-flex; gap:8px; background:#fff; padding:6px; border-radius:999px; border:1px solid var(--border); }
        .btn{ padding:8px 14px; border-radius:999px; border:2px solid transparent; background:transparent; font-weight:800; cursor:pointer; }
        .btn.on{ background:var(--accent); border-color:#e49b28; }

        .info{ background:#fbf1e1; border:1px solid var(--border); border-radius:12px; padding:12px 14px; margin:12px auto; max-width:920px; }

        .card{ margin-top:12px; border-radius:14px; overflow:hidden; background:var(--card); border:1px solid var(--border); box-shadow:0 10px 22px rgba(0,0,0,.06); }
        .bar{ background:var(--thead); font-weight:800; padding:10px 14px; border-bottom:1px solid var(--border); }
        .head{ display:flex; justify-content:flex-end; padding:10px 12px; }
        .search{ width:min(100%,360px); height:40px; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:#fffdfa; font-size:14px; }

        .table{ padding:0 0 6px; }
        .table.tall{ max-height:420px; overflow-y:auto; }
        .table.med{ max-height:320px; overflow-y:auto; }
        .thead{ position:sticky; top:0; display:grid; grid-template-columns:1fr 160px; background:var(--thead); border-bottom:1px solid var(--border); font-size:13px; }
        .thead.three{ grid-template-columns:1fr 160px 140px; }
        .row{ display:grid; grid-template-columns:1fr 160px; border-bottom:1px solid var(--row-sep); background:#fff; }
        .row.three{ grid-template-columns:1fr 160px 140px; }
        .cell{ padding:12px 14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cell.head{ font-weight:800; }
        .right{ text-align:right; }

        .zoom{ align-self:start; background:#fffdf8; border:1px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:0 10px 22px rgba(0,0,0,.06); }
        .zoomInner{ padding:12px 14px; }
        .zoomIntro{ margin:8px 0 12px; font-size:14px; }
        .zoomForm{ display:grid; gap:10px; }
        .zoomForm label{ display:grid; gap:6px; font-weight:700; font-size:13px; }
        .zoomForm input{ height:40px; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:#fff; font-size:14px; }
        .revealBtn{ height:40px; border-radius:999px; border:2px solid #e49b28; background:var(--accent); font-weight:900; cursor:pointer; }
        .zoomError{ color:#8b0000; font-size:13px; min-height:18px; }
        .zoomReveal{ display:flex; gap:8px; align-items:center; }
        .zoomLink{ display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:999px; border:2px solid #e49b28; background:var(--accent); font-weight:900; text-decoration:none; color:#111; }
        .copyBtn{ height:40px; padding:0 12px; border-radius:999px; border:1px solid var(--border); background:#fff; cursor:pointer; font-weight:700; }

        @media (max-width:480px){
          .thead{ grid-template-columns:1fr 110px; font-size:12px; }
          .thead.three{ grid-template-columns:1fr 110px 120px; }
          .row{ grid-template-columns:1fr 110px; }
          .row.three{ grid-template-columns:1fr 110px 120px; }
          .cell{ padding:10px 12px; font-size:14px; }
        }
      `}</style>
    </>
  );
}

export default IndexPage;
