// pages/vivko.js 
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Vivko() {
  const [lang, setLang] = useState("hu");
  const [i, setI] = useState(0); // active slide index
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
  const copy = {
    hu: [
      {
        id: "heart",
        bg: "/vivko-ny-1.jpg",
        blur: "right",
        hScript: "2026 február",
        hStrongTop: "Vivkóval New Yorkban és Washington DC-ben",
        sub:
          "Fedezd fel New Yorkot és az USA fővárosát, Washingtont Vivkóval.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "times",
        bg: "/vivko-ny-2.jpg",
        blur: "left",
        hScript: "Egy kis tudással és gyorsasággal Vivkóval utazhatsz",
        hStrongTop: "New York és Washington DC",
        sub:
          "Fedezd fel a Times Square varázsát és az USA fővárosának lenyűgöző látképét Vivkóval.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "bridge",
        bg: "/vivko-ny-3.jpg",
        blur: "left",
        hScript: "Légy Te a következő nyertes",
        hStrongTop: "New York és Washington DC Téged vár",
        sub:
          "Ha Te leszel a kétfordulós, tudásalapú verseny nyertese, Te és az utazótársad felejthetetlen élményeket élhettek át az USA keleti partján egy 8 nap 6 éjszakás utazás keretében. A nevezési díj: $14.99.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1. forduló: Online kvíz, lezárás 2026. január 11. — 11:59 (CET)",
        phase2:
          "2. forduló: Online élő verseny, kezdés 2026. január 11. — 18:00 (CET)",
        phase3:
          "3. Utazás: 2026. február 12–19. (8 nap / 6 éjszaka) New Yorkban és Washington DC-ben",
        sub:
          "A nyertes egy teljes körűen megszervezett, 8 nap 6 éjszakás utazást nyer New Yorkba és Washington DC-be, Vivkó és a Grand Slam Travel kíséretében.\n\nAz utazás teljes mértékben megszervezett, így sem tapasztalatra, sem nyelvtudásra nincs szükség. A nyeremény tartalmazza az ESTA ügyintézést, a repülőjegyeket, a transzfereket, a szállodát reggelivel, több nevezetesség belépőjét, valamint egy egynapos washingtoni kirándulást. Csak az ebédhez és vacsorához, illetve a költőpénzhez szükséges összeget kell magaddal hoznod.\n\nA rendszer a nyolc hét alatt minden héten kiválasztja azt az egy versenyzőt, aki az adott héten a legrövidebb idő alatt, hibátlanul teljesítette a kvízt. Ezen felül minden héten két további versenyző kerül tartaléklistára, az adott heti helyes kitöltési idők sorrendje alapján, arra az esetre, ha a heti győztes nem lépne be a 2. forduló élő versenyébe.\n\nAz első forduló lezárulta után minden, a kvízt sikeresen teljesítő felhasználónév felkerül a GrandLucky Travel weboldalára vagy aloldalára 2026. január 11-én 16:00-kor (CT) a befejezési időkkel együtt.",
        ui: "cta",
        home: "FŐOLDAL",
        play: "JÁTSZOM!",
      },
    ],
    en: [
      {
        id: "heart",
        bg: "/vivko-ny-1.jpg",
        blur: "right",
        hScript: "February 2026",
        hStrongTop: "In New York and Washington DC with Vivko",
        sub: "Discover New York and the capital city of the US with Vivko.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "times",
        bg: "/vivko-ny-2.jpg",
        blur: "left",
        hScript:
          "With a little knowledge and fastness you can travel with Vivko",
        hStrongTop: "New York and Washington DC",
        sub:
          "Discover the magic of Times Square and the view of the Capital City with Vivko.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "bridge",
        bg: "/vivko-ny-3.jpg",
        blur: "left",
        hScript: "Be the Next Winner",
        hStrongTop: "New York and DC Waiting for You",
        sub:
          "If you are the winner of the two-round, knowledge-based contest, you and your travel companion will enjoy unforgettable experiences on the US East Coast on an 8-day, 6-night trip. Entry fee: $14.99.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1st Round: Online trivia, closes January 11, 2026 — 11:59 AM (CET)",
        phase2:
          "2nd Round: Online Live Contest, starts January 11, 2026 — 18:00 (CET)",
        phase3:
          "3. Travel: February 12–19, 2026 (8 days / 6 nights) in New York and Washington DC",
        sub:
          "The winner will receive a fully organized 8-day, 6-night trip to New York and Washington DC, accompanied by Vivko and Grand Slam Travel.\n\nThe trip is fully organized, so no prior experience or language skills are required. The prize includes ESTA processing, flights, transfers, hotel with breakfast, tickets to several attractions, and a one-day trip to Washington DC. You only need to bring your own money for lunch, dinner, and spending money.\n\nDuring the eight weeks of the first round, the system will select one contestant each week who completed the trivia correctly in the shortest time in that given week. In addition, two more contestants will be placed on a standby list every week, based on their correct completion times for that week, in case the weekly winner does not enter Round 2 (the live contest).\n\nAfter the first round closes, all usernames that successfully completed the trivia will be listed on the GrandLucky Travel website or a subsite on January 11, 2026 at 16:00 CT, together with their completion times.",
        ui: "cta",
        home: "HOME",
        play: "ENTER TO THE CONTEST",
      },
    ],
  };

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

          {/* Slide 4: date lines */}
          {S.id === "draw" && (S.phase1 || S.phase2 || S.phase3) ? (
            <>
              {S.phase1 ? <span className="phase">{S.phase1}</span> : null}
              {S.phase2 ? <span className="phase">{S.phase2}</span> : null}
              {S.phase3 ? <span className="phase">{S.phase3}</span> : null}
            </>
          ) : null}
        </h1>

        {/* Scrollable text on Slide 4; buttons separated below (no overlap) */}
        {S.sub && (
          <div className={`subwrap ${S.id === "draw" ? "subwrap-draw" : ""}`}>
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

        {S.ui === "prevnext" ? (
          <div className="row">
            <button
              className="btn"
              onClick={() => setI((p) => (p > 0 ? p - 1 : p))}
            >
              {S.back}
            </button>
            <button
              className="btn"
              onClick={() =>
                setI((p) => (p < slides.length - 1 ? p + 1 : p))
              }
            >
              {S.next}
            </button>
          </div>
        ) : (
          <div className="row">
            <Link href="/" legacyBehavior>
              <a className="btn">{S.home}</a>
            </Link>
            <Link href="/user-agreement" legacyBehavior>
              <a className="btn">{S.play}</a>
            </Link>
          </div>
        )}
      </section>

      {/* Footer — HIDE on slide 4 entirely */}
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

        /* REMOVE overlay/plate where requested (Slides 1–3) */
        .s-heart::before,
        .s-bridge::before {
          background: none !important;
        }
        .s-times::before,
        .s-times.blur-left::before {
          background: none !important;
        }
        .s-times::after {
          content: none !important;
          display: none !important;
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
        }

        /* Base text block */
        .text {
          position: relative;
          z-index: 2;
          max-width: min(980px, 86vw);
          margin-left: clamp(24px, 6.2vw, 80px);
          --top-pad: clamp(38px, 7.2vw, 100px);
          padding-top: var(--top-pad);
          display: block;
        }
        .s-bridge .text {
          --top-pad: clamp(26px, 6.0vw, 80px);
        }
        .s-draw .text {
          --top-pad: clamp(48px, 8.2vw, 110px);
          /* Solid dark overlay and FULL width with side margins on desktop */
          background: rgba(0, 0, 0, 0.82);
          padding: clamp(18px, 2.4vw, 26px);
          border-radius: 18px;
          max-width: none;
          margin-left: clamp(16px, 4vw, 40px);
          margin-right: clamp(16px, 4vw, 40px);
        }

        .title {
          margin: 0 0 clamp(12px, 1.8vw, 18px);
          line-height: 1.04;
        }
        .script {
          display: block;
          font: 700 clamp(54px, 6.2vw, 86px) "Caveat", cursive;
          color: #faaf3b;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55),
            0 2px 6px rgba(0, 0, 0, 0.08);
          margin-bottom: clamp(6px, 0.6vw, 8px);
        }
        .strong {
          display: block;
          font-weight: 900;
          font-size: clamp(42px, 5.0vw, 74px);
          letter-spacing: -0.2px;
        }
        .phase {
          display: block;
          font-weight: 900;
          font-size: clamp(20px, 2.4vw, 32px);
          letter-spacing: -0.2px;
          white-space: nowrap;
        }

        .sub {
          margin: clamp(12px, 1.6vw, 20px) 0 clamp(20px, 2.0vw, 26px);
          font-weight: 500;
          font-size: clamp(18px, 1.7vw, 24px);
          color: var(--muted);
        }

        /* Slide 3 description yellow */
        .s-bridge .sub {
          color: var(--yellow);
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25),
            0 2px 6px rgba(0, 0, 0, 0.18);
        }

        /* === Slide 2 (times) — make title & subtitle white === */
        .s-times .strong {
          color: #fff;
        }
        .s-times .sub {
          color: #fff;
        }

        /* === Slide 4 (draw) — phases + sub yellow === */
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

        /* ---------- Slide 4 (draw) — GRID so middle scrolls, buttons stay visible ---------- */
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

        /* Footer base (hidden on slide 4 via conditional render above) */
        .legal {
          position: absolute;
          bottom: clamp(16px, 3.2vh, 28px);
          left: clamp(16px, 3vw, 32px);
          right: auto;
          z-index: 3;
          max-width: min(92vw, 820px);
          text-align: left;
          color: var(--dark);
          font-weight: 700;
          line-height: 1.35;
        }
        .legal .contact {
          margin: 0 0 4px 0;
          font-size: clamp(12px, 1.4vw, 14px);
        }
        .legal .rights {
          margin: 0;
          font-size: clamp(12px, 1.35vw, 14px);
        }
        .legal a {
          color: var(--dark);
          text-decoration: underline;
        }

        /* Slide 3 footer white */
        .s-bridge .legal {
          color: #fff;
        }
        .s-bridge .legal a {
          color: #fff;
        }

        /* ---------- Laptop tuning (slides 1–3) ---------- */
        @media (min-width: 900px) and (max-width: 1400px) {
          .text {
            --top-pad: clamp(16px, 4.4vw, 56px);
          }
          .s-times .text {
            --top-pad: clamp(12px, 3.8vw, 48px);
          }
          .s-bridge .text {
            --top-pad: clamp(14px, 4.2vw, 52px);
          }
          .s-heart .text {
            transform: translateY(-1.4vh);
          }
          .s-times .text {
            transform: translateY(-2.0vh);
          }
          .s-bridge .text {
            transform: translateY(-1.4vh);
          }
          .s-heart .script,
          .s-times .script,
          .s-bridge .script {
            font-size: clamp(48px, 5.4vw, 78px);
          }
          .s-heart .strong,
          .s-times .strong,
          .s-bridge .strong {
            font-size: clamp(38px, 4.6vw, 68px);
          }
        }

        /* ---------- Mobile tweaks ---------- */
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
            /* move text slightly higher on mobile */
            --top-pad: clamp(16px, 7vw, 32px);
            padding-top: var(--top-pad);
            padding-bottom: 8px;
            text-align: left;
          }
          .s-times .text {
            /* slide 2 specifically a bit higher */
            --top-pad: clamp(12px, 6.8vw, 28px);
          }
          .s-bridge .text {
            --top-pad: clamp(18px, 7.4vw, 36px);
          }

          .lang {
            padding: 9px 14px;
            top: 8px;
            right: 8px;
          }

          .script {
            font-size: clamp(42px, 9.4vw, 64px);
          }
          .strong {
            font-size: clamp(30px, 7.8vw, 46px);
          }
          .phase {
            font-size: clamp(16px, 4.6vw, 22px);
            white-space: normal;
          }
          .sub {
            font-size: clamp(16px, 4.4vw, 20px);
            /* slightly reduce bottom margin to avoid pushing into buttons */
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

          /* On mobile, pull Slide 4 panel back to centered narrow width */
          .s-draw .text {
            max-width: 92vw;
            margin: 0 auto;
          }
        }

        /* ---------- ANDROID CHROME / TOUCH TABLET HARD OVERRIDE ---------- */
        @media (min-width: 700px) and (max-width: 1400px) {
          @media (orientation: landscape) {
            .androidchrome.s-heart .text,
            .tpad.s-heart .text {
              transform: translateY(-6vh);
            }
            .androidchrome.s-times .text,
            .tpad.s-times .text {
              transform: translateY(-6.5vh);
            }
            .androidchrome.s-bridge .text,
            .tpad.s-bridge .text {
              transform: translateY(-6vh);
            }

            .androidchrome .script,
            .tpad .script {
              font-size: clamp(40px, 4.6vw, 64px);
              line-height: 1.0;
            }
            .androidchrome .strong,
            .tpad .strong {
              font-size: clamp(32px, 3.8vw, 54px);
              line-height: 1.02;
            }

            .androidchrome .script,
            .androidchrome .strong,
            .androidchrome .sub,
            .tpad .script,
            .tpad .strong,
            .tpad .sub {
              overflow-wrap: anywhere;
              word-break: normal;
              hyphens: auto;
              -webkit-hyphens: auto;
            }
          }

          @media (orientation: portrait) {
            .androidchrome.s-heart .text,
            .tpad.s-heart .text {
              transform: translateY(-4vh);
            }
            .androidchrome.s-times .text,
            .tpad.s-times .text {
              transform: translateY(-4.5vh);
            }
            .androidchrome.s-bridge .text,
            .tpad.s-bridge .text {
              transform: translateY(-4vh);
            }

            .androidchrome .script,
            .tpad .script {
              font-size: clamp(42px, 5.0vw, 68px);
              line-height: 1.02;
            }
            .androidchrome .strong,
            .tpad .strong {
              font-size: clamp(34px, 4.2vw, 56px);
              line-height: 1.04;
            }
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
