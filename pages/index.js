// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/** ---------- DATA (static snapshot, correct ≥ 5 & time_ms > 0) ---------- */
const TOP6 = [
  {"username":"GL-UJQA","time_ms":5362},
  {"username":"GL-FB5U","time_ms":5756},
  {"username":"GL-V5UM","time_ms":7198},
  {"username":"GL-JUNA","time_ms":8391},
  {"username":"GL-WO9I","time_ms":10639},
  {"username":"GL-QX3V","time_ms":12101}
];

const NEXT20 = [
  {"username":"GL-OVEN","time_ms":22459},
  {"username":"GL-JCWO","time_ms":22597},
  {"username":"GL-NCAD","time_ms":25069},
  {"username":"GL-6X2U","time_ms":26767},
  {"username":"GL-ANN7","time_ms":26788},
  {"username":"GL-IFNC","time_ms":28143},
  {"username":"GL-YGY9","time_ms":28252},
  {"username":"GL-PSKY","time_ms":29851},
  {"username":"GL-Z9PW","time_ms":30142},
  {"username":"GL-KKHC","time_ms":30735},
  {"username":"GL-SFUR","time_ms":31604},
  {"username":"GL-P35S","time_ms":32575},
  {"username":"GL-JJRR","time_ms":32996},
  {"username":"GL-UAKO","time_ms":33708},
  {"username":"GL-ERZD","time_ms":33708},
  {"username":"GL-Y7QF","time_ms":34591},
  {"username":"GL-TEST","time_ms":34968},
  {"username":"GL-T1TU","time_ms":35231},
  {"username":"GL-OTRG","time_ms":35952},
  {"username":"GL-6L9E","time_ms":36177}
];

const OTHERS = [
  {"username":"GL-ONCU","time_ms":37114},{"username":"GL-HUVF","time_ms":38977},{"username":"GL-VD5B","time_ms":39139},{"username":"GL-GAZT","time_ms":39230},{"username":"GL-Q6QJ","time_ms":39619},{"username":"GL-PWIQ","time_ms":40077},{"username":"GL-CQTA","time_ms":42039},{"username":"GL-B9NC","time_ms":42151},{"username":"GL-4HB6","time_ms":43647},{"username":"GL-ZYLH","time_ms":43675},{"username":"GL-MEKJ","time_ms":43838},{"username":"GL-HOCK","time_ms":44670},{"username":"GL-F5VI","time_ms":45568},{"username":"GL-THCM","time_ms":51204},{"username":"GL-KW6A","time_ms":51331},{"username":"GL-P9BX","time_ms":51464},{"username":"GL-IGMV","time_ms":51550},{"username":"GL-NXJH","time_ms":51886},{"username":"GL-WSXW","time_ms":52147},{"username":"GL-UGER","time_ms":52418},{"username":"GL-PBGA","time_ms":53136},{"username":"GL-DIMW","time_ms":55006},{"username":"GL-OH1J","time_ms":55092},{"username":"GL-6AKS","time_ms":55475},{"username":"GL-ERPN","time_ms":55603},
  {"username":"GL-LFJT","time_ms":61245},
  {"username":"GL-0KYS","time_ms":61551},
  {"username":"GL-JDG3","time_ms":63072},
  {"username":"GL-LXDL","time_ms":70120},{"username":"GL-ZNAM","time_ms":70323},{"username":"GL-XZJE","time_ms":70376},{"username":"GL-L7MH","time_ms":71118},{"username":"GL-HABY","time_ms":72711},{"username":"GL-2RPL","time_ms":73680},{"username":"GL-ZRXW","time_ms":74234},{"username":"GL-MDE7","time_ms":74846},{"username":"GL-KEQD","time_ms":75804},{"username":"GL-KG6X","time_ms":76244},{"username":"GL-OA7O","time_ms":76787},{"username":"GL-GCAH","time_ms":76961},{"username":"GL-DFWD","time_ms":78498},{"username":"GL-R8SP","time_ms":80811},{"username":"GL-U4HU","time_ms":81166},{"username":"GL-ZBUX","time_ms":86818},{"username":"GL-SKWJ","time_ms":88877},{"username":"GL-G7MM","time_ms":90914},{"username":"GL-KNPL","time_ms":93432},
  {"username":"GL-D3S5","time_ms":103216},
  {"username":"GL-5XWQ","time_ms":105621},
  {"username":"GL-HCNP","time_ms":106663},
  {"username":"GL-9PVN","time_ms":110606},{"username":"GL-PB9B","time_ms":111820},{"username":"GL-E9XM","time_ms":117403},{"username":"GL-ORSO","time_ms":126653},{"username":"GL-AMFT","time_ms":128346},{"username":"GL-LYMP","time_ms":132258},{"username":"GL-ZLQP","time_ms":134875},{"username":"GL-ESAX","time_ms":138995},{"username":"GL-12I0","time_ms":149860},{"username":"GL-KHBZ","time_ms":151678},{"username":"GL-PUXZ","time_ms":157298},{"username":"GL-GUHH","time_ms":176442},{"username":"GL-PBQM","time_ms":189435},{"username":"GL-L8HB","time_ms":211507},{"username":"qa.091","time_ms":212204},{"username":"GL-LT9B","time_ms":225765},{"username":"GL-UUFQ","time_ms":231437},{"username":"GL-YWZP","time_ms":233971},{"username":"GL-E8YO","time_ms":247502},{"username":"GL-225U","time_ms":284724},{"username":"GL-6QRH","time_ms":290891},{"username":"GL-GOIS","time_ms":359008},{"username":"GL-VH35","time_ms":449747}
];

/** ---------- I18N ---------- */
const STR = {
  en: {
    heroTitle: "The Vivko contest Round 1 has ended.",
    heroSub: "New contest coming soon.",
    infoP: "The Vivko contest Round 1 has ended. A new contest is coming soon.",
    contact: "Questions? Email us at",
    find: "Find your result",
    searchPh: "Type username (e.g., GL-XXXX)…",
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
    noResults: "No results."
  },
  hu: {
    heroTitle: "A Vivkó nyereményjáték 1. fordulója lezárult.",
    heroSub: "Hamarosan új játék indul.",
    infoP: "A Vivkó nyereményjáték első fordulója lezárult. Hamarosan új játék indul.",
    contact: "Kérdés esetén írj nekünk:",
    find: "Keresd meg az eredményed",
    searchPh: "Írd be a felhasználónevet (pl. GL-XXXX)…",
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
    noResults: "Nincs eredmény."
  }
};

/** ---------- SEARCH NORMALIZATION + FUZZY ---------- */
const norm = (s) => (s || "").toString().trim().toUpperCase().replace(/\s+/g, "");
const normalizeUsername = (u) => {
  const n = norm(u).replace(/^GL-/, "GL").replace(/^GL(?=[A-Z0-9]{4}$)/, "GL-");
  return n;
};
// Levenshtein ≤ 1
function lev1(a, b) {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    edits++;
    if (edits > 1) return false;
    if (la > lb) i++;
    else if (lb > la) j++;
    else { i++; j++; }
  }
  if (i < la || j < lb) edits++;
  return edits <= 1;
}
function includesOrFuzzy(hay, needle) {
  if (!needle) return true;
  if (hay.includes(needle)) return true;
  const parts = [hay, hay.replace(/^GL-/, "")];
  const n2 = [needle, needle.replace(/^GL-/, "")];
  for (const h of parts) for (const n of n2) if (lev1(h, n)) return true;
  return false;
}

function formatMs(ms) {
  if (ms == null || isNaN(ms)) return "—";
  const t = Math.max(0, Math.floor(ms));
  const mm = String(Math.floor(t / 60000)).padStart(2, "0");
  const ss = String(Math.floor((t % 60000) / 1000)).padStart(2, "0");
  const mmm = String(t % 1000).padStart(3, "0");
  return `${mm}:${ss}.${mmm}`;
}

/** ---------- UI ---------- */
function RowSection({ title, items, searchable = false, dict }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!searchable || !q) return items;
    const needle = normalizeUsername(q);
    return items.filter((r) => includesOrFuzzy(normalizeUsername(r.username), needle));
  }, [items, q, searchable]);

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {searchable && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.searchPh}
            aria-label={dict.searchPh}
            style={styles.search}
          />
        )}
      </div>

      <div style={{ ...styles.tableWrap, ...(searchable ? styles.tallScroll : styles.mediumScroll) }}>
        <div style={styles.tableHeader}>
          <div style={{ ...styles.cell, ...styles.userCell, fontWeight: 800 }}>{dict.username}</div>
          <div style={{ ...styles.cell, ...styles.timeCell, fontWeight: 800 }}>{dict.time}</div>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.emptyRow}>{dict.noResults}</div>
        ) : (
          filtered.map((r, i) => (
            <div key={`${r.username}-${i}`} style={styles.tableRow}>
              <div style={{ ...styles.cell, ...styles.userCell }}>{r.username}</div>
              <div style={{ ...styles.cell, ...styles.timeCell }}>{formatMs(r.time_ms)}</div>
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
    const tag = (arr, group) => arr.map((x) => ({ ...x, group }));
    return [...tag(top6, dict.gTop), ...tag(next20, dict.gBackups), ...tag(others, dict.gOthers)];
  }, [top6, next20, others, dict]);

  const results = useMemo(() => {
    const needle = normalizeUsername(q);
    if (!needle) return [];
    return all.filter((x) => includesOrFuzzy(normalizeUsername(x.username), needle)).slice(0, 50);
  }, [all, q]);

  return (
    <section style={{ ...styles.section, marginTop: 12 }}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{dict.find}</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.searchPh}
          aria-label={dict.searchPh}
          style={styles.search}
        />
      </div>

      {q && (
        <div style={styles.tableWrap}>
          <div style={{ ...styles.tableHeader, gridTemplateColumns: "1fr 160px 140px" }}>
            <div style={{ ...styles.cell, fontWeight: 800 }}>{dict.username}</div>
            <div style={{ ...styles.cell, textAlign: "right", fontWeight: 800 }}>{dict.time}</div>
            <div style={{ ...styles.cell, fontWeight: 800 }}>{dict.group}</div>
          </div>
          {results.length === 0 ? (
            <div style={styles.emptyRow}>{dict.noMatches}</div>
          ) : (
            results.map((r, i) => (
              <div key={`${r.username}-${i}`} style={{ ...styles.tableRow, gridTemplateColumns: "1fr 160px 140px" }}>
                <div style={styles.cell}>{r.username}</div>
                <div style={{ ...styles.cell, textAlign: "right" }}>{formatMs(r.time_ms)}</div>
                <div style={styles.cell}>{r.group}</div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

/** ---------- PAGE ---------- */
export default function IndexPage() {
  const [lang, setLang] = useState("en"); // "en" | "hu"
  const dict = STR[lang];

  return (
    <>
      <Head>
        <title>GrandLucky Travel — Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Global theme: match the payment-page yellow */}
      <style jsx global>{`
        :root{
          --page-yellow:#F4A53B;  /* from your payment page */
          --accent:#faaf3b;
          --ink:#111;
          --muted:rgba(0,0,0,0.7);
          --border:#e79f47;
          --card:#fff;
          --thead:rgba(244,165,59,0.22);
          --row-sep:rgba(244,165,59,0.28);
        }
        html,body{
          background: var(--page-yellow);
          color:var(--ink);
        }
        a{ color:#1f2937; }
      `}</style>

      <main style={styles.main}>
        <header style={styles.hero}>
          <h1 style={styles.h1}>{dict.heroTitle}</h1>
          <p style={styles.sub}>{dict.heroSub}</p>

          <div style={styles.langSwitch}>
            <button onClick={() => setLang("hu")} aria-label="Magyar" style={{ ...styles.langBtn, ...(lang === "hu" ? styles.langActive : {}) }}>
              HU
            </button>
            <button onClick={() => setLang("en")} aria-label="English" style={{ ...styles.langBtn, ...(lang === "en" ? styles.langActive : {}) }}>
              EN
            </button>
          </div>
        </header>

        <section style={styles.infoCard}>
          <p style={{ margin: "8px 0" }}>{dict.infoP}</p>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {dict.contact} <a href="mailto:support@grandluckytravel.com">support@grandluckytravel.com</a>
          </p>
        </section>

        <GlobalSearch top6={TOP6} next20={NEXT20} others={OTHERS} dict={dict} />
        <RowSection title={dict.s1} items={TOP6} dict={dict} />
        <RowSection title={dict.s2} items={NEXT20} dict={dict} />
        <RowSection title={dict.s3} items={OTHERS} searchable dict={dict} />
      </main>
    </>
  );
}

/** ---------- STYLES ---------- */
const styles = {
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 16px 64px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
    color: "var(--ink)"
  },
  hero: { marginBottom: 10, textAlign: "center" },
  h1: { fontSize: 28, lineHeight: 1.2, margin: "0 0 6px", fontWeight: 800 },
  sub: { fontSize: 18, margin: 0, opacity: 0.9, fontWeight: 500 },

  langSwitch: {
    marginTop: 10, display: "inline-flex", gap: 6,
    background: "#fff", padding: 4, borderRadius: 999, border: "1px solid var(--border)"
  },
  langBtn: { padding: "6px 12px", borderRadius: 999, border: "1px solid transparent", cursor: "pointer", background: "transparent", fontWeight: 800 },
  langActive: { background: "var(--accent)", borderColor: "#e49b28" },

  infoCard: {
    border: "1px solid var(--border)",
    background: "#fff7e6",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 12px 24px rgba(0,0,0,0.05)"
  },

  section: {
    marginTop: 16,
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
    background: "var(--card)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.06)"
  },
  sectionHeader: {
    display: "flex", alignItems: "center", gap: 12,
    justifyContent: "space-between", marginBottom: 12
  },
  sectionTitle: { margin: 0, fontSize: 20, fontWeight: 800 },

  search: {
    flexShrink: 0, width: 280, height: 36, padding: "6px 10px",
    borderRadius: 10, border: "1px solid var(--border)", outline: "none",
    fontSize: 14, background: "#fffdfa"
  },

  tableWrap: {
    border: "1px solid var(--border)",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fff"
  },
  mediumScroll: { maxHeight: 260, overflowY: "auto" },
  tallScroll: { maxHeight: 360, overflowY: "auto" },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 160px",
    background: "var(--thead)",
    borderBottom: "1px solid var(--border)",
    fontSize: 13,
    letterSpacing: 0.2
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 160px",
    background: "#fff",
    borderBottom: "1px solid var(--row-sep)",
    fontSize: 15
  },
  cell: { padding: "10px 12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userCell: { fontVariantNumeric: "tabular-nums" },
  timeCell: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
  emptyRow: { padding: "14px 12px", fontSize: 14, color: "var(--muted)", background: "#fff" }
};
