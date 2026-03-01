// pages/vivko.js
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Vivko() {
  const [lang, setLang] = useState("hu");
  const [i, setI] = useState(0); // active slide index (only 1 slide)
  const [uaClass, setUaClass] = useState(""); // runtime: tablet / android chrome flags

  // Runtime detection: touch-tablet width band + Android Chrome hint
  useEffect(() => {
    const compute = () => {
      const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
      const isAndroid = /Android/i.test(ua);
      const isChrome =
        /Chrome\/\d+/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua);
      const isAndroidChrome = isAndroid && isChrome;

      const touchCapable =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          (navigator &&
            (navigator.maxTouchPoints > 0 ||
              navigator.msMaxTouchPoints > 0)));

      const w = typeof window !== "undefined" ? window.innerWidth : 0;
      const tpad = touchCapable && w >= 700 && w <= 1400;

      const classes = [];
      if (tpad) classes.push("tpad");
      if (isAndroidChrome) classes.push("androidchrome");
      setUaClass(classes.join(" "));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ---------- Copy (HU / EN) ----------
  // Slides 1–3 removed. Only the former Slide 4 remains.
  const copy = {
    hu: [
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1. forduló: Online kvíz, lezárás 2026. május 29. — 23:59 (HUN)",
        phase2:
          "2. forduló: Online élő verseny, kezdés 2026. május 30. — 18:00 (HUN)",
        phase3:
          "3. Utazás: 2026. július 31. – augusztus 08. (9 nap / 7 éjszaka) New Yorkban, Washington DC-ben és a Niagara-vízesésnél (Kanadai oldal is)",
        sub:
          "A nyertes és az utazótársa egy teljes körűen megszervezett, 9 nap 7 éjszakás utazást nyer New Yorkba, Washington DC-be és a Niagara-vízeséshez, Vivkó és a Grand Slam Travel kíséretében.\n\nAz utazás teljes mértékben megszervezett, így sem tapasztalatra, sem nyelvtudásra nincs szükség. A nyeremény tartalmazza az ESTA ügyintézést, a repülőjegyeket, a transzfereket, a szállodát reggelivel, több nevezetesség belépőjét, egy egynapos Washington DC-i kirándulást és egy egynapos kirándulást a Niagara-vízeséshez. Csak az ebédhez és vacsorához, illetve a költőpénzhez szükséges összeget kell magaddal hoznod.\n\nA rendszer kiválasztja azt a 10 versenyzőt, aki 2026. május 29. 23:59-ig (HUN) a legrövidebb idő alatt, hibátlanul teljesíti a kvízt. Ők jutnak be a 2. fordulóba (az online élő versenyre).\n\nA 10 leggyorsabb versenyző felhasználóneve folyamatosan frissülő eredménytáblán jelenik meg a GrandLucky Travel weboldalán. Az első forduló lezárulta után minden, a kvízt sikeresen teljesítő felhasználónév felkerül a GrandLucky Travel weboldalára vagy aloldalára 2026. május 30-án 16:00-kor (CT) a befejezési időkkel együtt.",
        ui: "cta",
        home: "FŐOLDAL",
        play: "JÁTSZOM!",
      },
    ],
    en: [
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1st Round: Online trivia, closes May 29, 2026 — 11:59 PM (HUN)",
        phase2:
          "2nd Round: Online Live Contest, starts May 30, 2026 — 18:00 (HUN)",
        phase3:
          "3. Travel: July 31 – August 08, 2026 (9 days 7 nights) in New York, Washington DC and Niagara Falls (Canadian side too)",
        sub:
          "The winner and their travel companion will receive a 9-day, 7-night trip to New York, Washington DC, and Niagara Falls accompanied by Vivko and Grand Slam Travel.\n\nThe trip is fully organized, so no prior experience or language skills are required. The prize includes ESTA processing, flights, transfers, hotel with breakfast, tickets to several attractions, and a one-day trip to Washington DC and a one-day trip to Niagara Falls. You only need to bring your own money for lunch, dinner, and spending money.\n\nThe system will select the 10 contestants who complete the trivia correctly in the shortest time by May 29, 2026 — 11:59 PM (HUN). They will qualify for Round 2 (the live contest).\n\nThe usernames of the 10 fastest contestants will be displayed on the continuously refreshed GrandLucky Travel leaderboard. After the first round closes, all usernames that successfully completed the trivia will be listed on the GrandLucky Travel website or a subsite on May 30, 2026 at 16:00 CT, together with their completion times.",
        ui: "cta",
        home: "HOME",
        play: "ENTER TO THE CONTEST",
      },
    ],
  };

  // Deep-link: open a specific slide via ?slide=4 (now clamps to the only slide)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const slideParam = params.get("slide");
      if (!slideParam) return;

      const n = parseInt(slideParam, 10);
      if (Number.isNaN(n)) return;

      const maxIdx = copy.hu.length - 1; // same length for HU/EN
      const idx = Math.min(Math.max(n - 1, 0), maxIdx);
      setI(idx);
    } catch (e) {
      // silently ignore invalid URL params
    }
  }, []);

  const footer = {
    hu: {
      contact: "Ha kérdésed vagy észrevételed van, kérjük, írj nekünk: ",
      rights1: "Minden jog fenntartva – Grandlucky Travel",
      rights2: "3495 US Highway 1 STE34#1217 Princeton, NJ 08540",
      phoneLabel: "Telefon:",
    },
    en: {
      contact: "If you have any questions or concerns please contact us at: ",
      rights1: "All rights reserved to Grandlucky Travel",
      rights2: "3495 US Highway 1 STE34#1217 Princeton, NJ 08540",
      phoneLabel: "Phone:",
    },
  };

  const F = footer[lang];
  const slides = copy[lang];
  const S = slides[i];

  return (
    <main className={`hero s-${S.id} blur-${S.blur} ${uaClass}`}>
      <Head>
        <title>Vivkó – GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Background */}
      <div className="bg" role="img" aria-label={S.id} />

      {/* Language toggle */}
      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      {/* Content */}
      <section className={`text ${S.id === "draw" ? "text-draw" : ""}`}>
        <h1 className="title">
          {S.hScript ? <span className="script">{S.hScript}</span> : null}
          {S.hStrongTop ? <span className="strong">{S.hStrongTop}</span> : null}

          {/* Date lines */}
          {S.phase1 ? <span className="phase">{S.phase1}</span> : null}
          {S.phase2 ? <span className="phase">{S.phase2}</span> : null}
          {S.phase3 ? <span className="phase">{S.phase3}</span> : null}
        </h1>

        {/* Scrollable text; buttons separated below (no overlap) */}
        {S.sub && (
          <div className="subwrap subwrap-draw">
            <p className="sub">
              {S.sub.split("\n").map((line, k) => (
                <span key={k}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        )}

        <div className="row">
          <Link href="/" legacyBehavior>
            <a className="btn">{S.home}</a>
          </Link>
          <Link href="/user-agreement" legacyBehavior>
            <a className="btn">{S.play}</a>
          </Link>
        </div>
      </section>

      {/* Footer — HIDE on this slide entirely */}
      {S.id !== "draw" && (
        <footer className="legal">
          <p className="contact">
            {F.contact}
            <a href="mailto:support@grandluckytravel.com">
              support@grandluckytravel.com
            </a>
            <span> &nbsp;|&nbsp; </span>
            <strong>{F.phoneLabel}</strong>&nbsp;
            <a
              href="tel:+18553047263"
              aria-label={
                lang === "hu"
                  ? "Telefon: GrandLucky Travel ügyfélszolgálat +1 855-304-7263"
                  : "Phone: GrandLucky Travel support +1 855-304-7263"
              }
            >
              +1 855-304-7263
            </a>
          </p>
          <p className="rights">
            <span>{F.rights1}</span>
            <br />
            <span>{F.rights2}</span>
          </p>
        </footer>
      )}

      <style jsx>{`
        :global(:root) {
          --dark: #222;
          --muted: rgba(0, 0, 0, 0.64);
          --yellow: #faaf3b;
          --yellow-border: #e49b28;
        }

        .hero {
          position: relative;
          height: 100dvh;
          height: 100svh;
          overflow: hidden;
          font-family: "Montserrat", system-ui, sans-serif;
          color: var(--dark);

          /* NEW: prevent any accidental horizontal scroll/crop on older desktops */
          max-width: 100vw;
          overflow-x: hidden;
        }

        .bg {
          position: absolute;
          inset: 0;
          background: url(${JSON.stringify(S.bg)}) center / cover no-repeat;
          z-index: 0;
        }

        /* Base soft gradient overlay */
        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 62%,
            rgba(255, 255, 255, 0.06) 76%,
            rgba(255, 255, 255, 0.12) 86%,
            rgba(255, 255, 255, 0.2) 94%,
            rgba(255, 255, 255, 0.26) 100%
          );
        }
        .blur-left::before {
          background: linear-gradient(
            270deg,
            rgba(255, 255, 255, 0) 62%,
            rgba(255, 255, 255, 0.06) 76%,
            rgba(255, 255, 255, 0.12) 86%,
            rgba(255, 255, 255, 0.2) 94%,
            rgba(255, 255, 255, 0.26) 100%
          );
        }

        .lang {
          position: absolute;
          top: clamp(14px, 2.4vw, 26px);
          right: clamp(14px, 2.4vw, 26px);
          z-index: 3;
          padding: 12px 22px;
          border: 3px solid var(--yellow-border);
          background: var(--yellow);
          color: var(--dark);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.15),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
          border-radius: 999px;
          font-weight: 900;
          cursor: pointer;
        }

        /* Slide 4 panel style (kept) */
        .text {
          position: relative;
          z-index: 2;
          max-width: min(980px, 86vw);
          margin-left: clamp(24px, 6.2vw, 80px);
          --top-pad: clamp(48px, 8.2vw, 110px);
          padding-top: var(--top-pad);
          display: block;
        }

        .s-draw .text {
          background: rgba(0, 0, 0, 0.82);
          padding: clamp(18px, 2.4vw, 26px);
          border-radius: 18px;

          /* NEW: keep the panel fully inside the viewport on older/smaller desktops */
          width: min(100%, calc(100vw - 32px));
          max-width: calc(100vw - 32px);
          margin-left: auto;
          margin-right: auto;
          box-sizing: border-box;
        }

        .title {
          margin: 0 0 clamp(12px, 1.8vw, 18px);
          line-height: 1.04;
        }

        .phase {
          display: block;
          font-weight: 900;
          font-size: clamp(20px, 2.4vw, 32px);
          letter-spacing: -0.2px;

          /* NEW: allow wrapping on older desktops so no right-crop */
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .sub {
          margin: clamp(12px, 1.6vw, 20px) 0 clamp(20px, 2.0vw, 26px);
          font-weight: 500;
          font-size: clamp(18px, 1.7vw, 24px);
          color: var(--muted);
        }

        .s-draw .phase,
        .s-draw .sub {
          color: var(--yellow);
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.38);
        }

        .row {
          display: flex;
          gap: clamp(12px, 1.6vw, 16px);
          align-items: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(14px, 1.1vw, 16px) clamp(24px, 2.2vw, 32px);
          border-radius: 999px;
          font-weight: 900;
          font-size: clamp(12px, 0.95vw, 14px);
          text-transform: uppercase;
          color: var(--dark);
          background: var(--yellow);
          border: 3px solid var(--yellow-border);
          text-decoration: none;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.18),
            inset 0 2px 0 rgba(255, 255, 255, 0.65);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(0, 0, 0, 0.24),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }

        .text-draw {
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 10px;
          max-height: calc(
            100svh - var(--top-pad) - max(12px, env(safe-area-inset-bottom))
          );
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
        .text-draw .subwrap {
          min-height: 0;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          padding-right: 4px;
        }
        .text-draw .row {
          justify-content: flex-start;
          position: static;
          background: transparent;
          margin-top: 0;
          padding-top: 0;
        }

        /* MOBILE — DO NOT CHANGE (kept exactly as you had it) */
        @media (max-width: 900px) {
          .hero::before,
          .blur-left::before {
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.78) 0%,
              rgba(255, 255, 255, 0.5) 28%,
              rgba(255, 255, 255, 0.22) 52%,
              rgba(255, 255, 255, 0.08) 72%,
              rgba(255, 255, 255, 0) 90%
            );
          }

          .text {
            max-width: 92vw;
            margin: 0 auto;
            --top-pad: clamp(16px, 7vw, 32px);
            padding-top: var(--top-pad);
            padding-bottom: 8px;
            text-align: left;
          }

          .lang {
            padding: 9px 14px;
            top: 8px;
            right: 8px;
          }

          .phase {
            font-size: clamp(16px, 4.6vw, 22px);
            white-space: normal;
          }
          .sub {
            font-size: clamp(16px, 4.4vw, 20px);
            margin-bottom: 14px;
          }
          .row {
            gap: 10px;
          }
          .btn {
            font-size: 12px;
            padding: 12px 20px;
          }

          .text-draw {
            max-height: calc(
              100svh - var(--top-pad) -
                max(16px, env(safe-area-inset-bottom))
            );
          }

          .s-draw .text {
            max-width: 92vw;
            margin: 0 auto;
          }
        }
      `}</style>
    </main>
  );
}

// Force no-cache so copy changes show up immediately
export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}