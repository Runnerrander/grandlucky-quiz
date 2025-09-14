// pages/vivko.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Vivko() {
  const [lang, setLang] = useState("hu");
  const [i, setI] = useState(0); // active slide index

  // ---------- Copy (HU / EN) ----------
  const copy = {
    hu: [
      {
        id: "heart",
        bg: "/vivko-ny-1.jpg",
        blur: "right",
        hScript: "Adventi Szezon",
        hStrongTop: "Vivkóval New Yorkban",
        sub: "Fedezd fel a Times Square varázsát Vivkóval az ünnepi Szezonban.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "times",
        bg: "/vivko-ny-2.jpg",
        blur: "left",
        hScript: "Adventi Szezon",
        hStrongTop: "Vivkóval New Yorkban",
        sub: "Fedezd fel a Times Square varázsát Vivkóval az ünnepi Szezonban.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "bridge",
        bg: "/vivko-ny-3.jpg",
        blur: "left",
        hScript: "Adventi Szezon",
        hStrongTop: "Vivkóval New Yorkban",
        sub:
          "Ha Te leszel a kétfordulós, tudásalapú verseny nyertese, Te és az utazótársad felejthetetlen élményeket élhettek át az USA keleti partján egy 7 nap 5 éjszakás utazás keretében. A nevezési díj: $9.99.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "draw",
        bg: "/vivko-ny.jpg",
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1: "1. forduló: Online kvíz, lezárás 2025. október 11. — 00:30 (CET)",
        phase2:
          "2. forduló: Online élő verseny, kezdés 2025. október 18. — 18:00 (CET)",
        phase3: "3. Utazás: november 27. – december 3. (7 nap / 5 éjszaka)",
        sub:
          "Nyertesként Te és egy általad választott kísérő a Grand Slam Travel és a Vivkó Nails kíséretében utazhattok New Yorkba. Az utazás teljes körűen megszervezett, így sem tapasztalatra, sem nyelvtudásra nincs szükség. A nyeremény tartalmazza az ESTA ügyintézést, a repülőjegyeket, a transzfereket, egy manhattani szállodát reggelivel, belépőket több nevezetességhez, valamint egy különleges meglepetést. Csak az ebédhez és vacsorához, illetve a költőpénzhez szükséges összeget kell magaddal hoznod.\nAz első forduló lezárása után a rendszer kiértékeli az eredményeket, és kiválasztja azt a hat versenyzőt, akik a kvízt helyesen a legrövidebb idő alatt teljesítették, valamint további versenyzőket is kiválaszt tartaléklistára (a befejezési idő alapján) azok közül, akik szintén helyesen teljesítették a kvízt, arra az esetre, ha a legjobb hatból valaki nem lépne be a 2. fordulóba (élő verseny), mindaddig, amíg 6 versenyző jelen nincs az élő versenyen. Minden, a kvízt sikeresen teljesítő felhasználónév felkerül a GrandLucky Travel weboldalára vagy aloldalára 2025. október 12-én 20:00-kor (CT) a befejezés idejével együtt.",
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
        hScript: "Advent Season",
        hStrongTop: "In New York with Vivko",
        sub: "Discover the magic of Times Square with Vivko during the holiday season.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "times",
        bg: "/vivko-ny-2.jpg",
        blur: "left",
        hScript: "Advent Season",
        hStrongTop: "In New York with Vivko",
        sub: "Discover the magic of Times Square with Vivko during the holiday season.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "bridge",
        bg: "/vivko-ny-3.jpg",
        blur: "left",
        hScript: "Advent Season",
        hStrongTop: "In New York with Vivko",
        sub:
          "If you are the winner of the two-round, knowledge-based contest, you and your travel companion will enjoy unforgettable experiences on the US East Coast on a 7-day, 5-night trip. Entry fee: $9.99.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "draw",
        bg: "/vivko-ny.jpg",
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1st Round: Online trivia, closes October 11, 2025 — 00:30 (CET)",
        phase2:
          "2nd Round: Online Live Contest, starts October 18, 2025 — 18:00 (CET)",
        phase3: "3. Travel: November 27 – December 3 (7 days / 5 nights)",
        sub:
          "As the winner, you and a companion of your choice will travel to the Big Apple, accompanied by Grand Slam Travel and Vivko Nails. The trip is fully organized, so no prior experience or language skills are required. The prize includes ESTA processing, flights, transfers, a Manhattan hotel with breakfast, tickets to several attractions, and a special surprise. You only need to bring your own money for lunch and dinner and for spending money.\nAfter the first round closes, the system will evaluate and pick six contestants who completed the trivia correctly in the shortest time, and pick additional contestants who also completed the trivia correctly (by the completion time) as standby in case any of the top six do not enter Round 2 (the live contest) until 6 contestants are present at the live contest. All usernames that successfully complete the trivia will be listed on the GrandLucky Travel website or a subsite on October 12, 2025 at 20:00 CT with their completion time.",
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
    },
    en: {
      contact: "If you have any questions or concerns please contact us at: ",
      rights1: "All rights reserved to Grandlucky Travel",
      rights2: "3495 US Highway 1 STE34#1217 Princeton, NJ 08540",
    },
  };

  const F = footer[lang];
  const slides = copy[lang];
  const S = slides[i];

  return (
    <main className={`hero s-${S.id} blur-${S.blur}`}>
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
      <button className="lang" onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}>
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

        {/* Slide 4 gets a scrollable body so buttons never overlap */}
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
            <button className="btn" onClick={() => setI((p) => (p > 0 ? p - 1 : p))}>
              {S.back}
            </button>
            <button
              className="btn"
              onClick={() => setI((p) => (p < slides.length - 1 ? p + 1 : p))}
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
            <a href="mailto:support@gradluckytravel.com">support@gradluckytravel.com</a>
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

        /* Base soft gradient overlay (disabled per slide below) */
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

        /* Remove all blur/plates for slides 1–3 */
        .s-heart::before,
        .s-times::before,
        .s-times.blur-left::before,
        .s-bridge::before {
          background: none !important;
        }
        .s-times::after { content: none !important; display: none !important; }

        .lang {
          position: absolute;
          top: clamp(14px, 2.4vw, 26px);
          right: clamp(14px, 2.4vw, 26px);
          z-index: 3;
          padding: 12px 22px;
          border: 3px solid var(--yellow-border);
          background: var(--yellow);
          color: var(--dark);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }
        @media (max-width: 900px) {
          .lang { padding: 10px 16px; top: 10px; right: 10px; }
        }

        /* Base text block; slide-specific top padding tweaked below */
        .text {
          position: relative;
          z-index: 2;
          max-width: min(980px, 86vw);
          margin-left: clamp(24px, 6.2vw, 80px);
          --top-pad: clamp(38px, 7.2vw, 100px); /* default */
          padding-top: var(--top-pad);
          display: block;
        }
        .s-bridge .text { --top-pad: clamp(26px, 6vw, 80px); }
        .s-draw .text   { --top-pad: clamp(48px, 8.2vw, 110px); }

        .title { margin: 0 0 clamp(12px, 1.8vw, 18px); line-height: 1.04; }
        .script {
          display: block;
          font: 700 clamp(54px, 6.2vw, 86px) "Caveat", cursive;
          color: #faaf3b;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 2px 6px rgba(0,0,0,.08);
          margin-bottom: clamp(6px, .6vw, 8px);
        }
        .strong { display: block; font-weight: 900; font-size: clamp(42px, 5vw, 74px); letter-spacing: -0.2px; }
        .phase  { display: block; font-weight: 900; font-size: clamp(20px, 2.4vw, 32px); letter-spacing: -0.2px; white-space: nowrap; }

        .sub {
          margin: clamp(12px, 1.6vw, 20px) 0 clamp(20px, 2vw, 26px);
          font-weight: 500;
          font-size: clamp(18px, 1.7vw, 24px);
          color: var(--muted);
        }
        .s-bridge .sub {
          color: var(--yellow);
          text-shadow: 0 1px 0 rgba(0,0,0,.25), 0 2px 6px rgba(0,0,0,.18);
        }

        .row { display: flex; gap: clamp(12px, 1.6vw, 16px); align-items: center; flex-wrap: wrap; }
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: clamp(14px, 1.1vw, 16px) clamp(24px, 2.2vw, 32px);
          border-radius: 999px; font-weight: 900; font-size: clamp(12px, .95vw, 14px);
          text-transform: uppercase; color: var(--dark);
          background: var(--yellow); border: 3px solid var(--yellow-border);
          text-decoration: none; box-shadow: 0 16px 28px rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.65);
          transition: transform .2s ease, box-shadow .2s ease; cursor: pointer;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 22px 36px rgba(0,0,0,.24), inset 0 2px 0 rgba(255,255,255,.7); }

        /* ---------- Slide 4 (draw) — GRID so buttons never overlap ---------- */
        .text-draw {
          display: grid;
          grid-template-rows: auto 1fr auto; /* title | scroll | buttons */
          gap: 10px;
          max-height: calc(100svh - var(--top-pad) - max(12px, env(safe-area-inset-bottom)));
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
        .text-draw .subwrap { min-height: 0; overflow: auto; -webkit-overflow-scrolling: touch; padding-right: 4px; }
        .text-draw .row     { justify-content: flex-start; position: static; background: transparent; margin-top: 0; padding-top: 0; }

        /* Footer (hidden on slide 4 via conditional render) */
        .legal {
          position: absolute; bottom: clamp(16px, 3.2vh, 28px); left: clamp(16px, 3vw, 32px);
          right: auto; z-index: 3; max-width: min(92vw, 820px); text-align: left; color: var(--dark);
          font-weight: 700; line-height: 1.35;
        }
        .legal .contact { margin: 0 0 4px 0; font-size: clamp(12px, 1.4vw, 14px); }
        .legal .rights  { margin: 0; font-size: clamp(12px, 1.35vw, 14px); }
        .legal a { color: var(--dark); text-decoration: underline; }

        /* ===================== PER-DEVICE TOP-PADDING TUNING ===================== */

        /* Desktop (>= 1200px): lift text slightly on slides 2 & 3 */
        @media (min-width: 1200px) {
          .s-heart .text  { --top-pad: 7vh; }
          .s-times .text  { --top-pad: 5.4vh; }
          .s-bridge .text { --top-pad: 5.2vh; }
        }

        /* Laptop (900–1199px): lift text a touch on slides 1–3 */
        @media (min-width: 900px) and (max-width: 1199px) {
          .s-heart .text  { --top-pad: 7.8vh; }
          .s-times .text  { --top-pad: 6.2vh; }
          .s-bridge .text { --top-pad: 6.0vh; }
        }

        /* Mobile (<= 900px): push 1–2 down (below head), slide 3 up a bit */
        @media (max-width: 900px) {
          .hero::before, .blur-left::before {
            background: linear-gradient(
              90deg,
              rgba(255,255,255,.78) 0%,
              rgba(255,255,255,.5) 28%,
              rgba(255,255,255,.22) 52%,
              rgba(255,255,255,.08) 72%,
              rgba(255,255,255,0) 90%
            );
          }
          .text {
            max-width: 92vw;
            margin: 0 auto;
            --top-pad: clamp(96px, 19vw, 150px);
            padding-top: var(--top-pad);
            text-align: left;
          }
          .s-heart .text { --top-pad: clamp(108px, 21.5vw, 170px); } /* down */
          .s-times .text { --top-pad: clamp(112px, 23vw, 180px); }   /* down */
          .s-bridge .text { --top-pad: clamp(76px, 16vw, 118px); }   /* up */

          .script { font-size: clamp(44px, 10vw, 66px); }
          .strong { font-size: clamp(32px, 8.5vw, 48px); }
          .phase  { font-size: clamp(16px, 4.6vw, 22px); white-space: normal; }
          .sub    { font-size: clamp(16px, 4.4vw, 20px); }
          .row    { gap: 10px; }
          .btn    { font-size: 12px; padding: 12px 20px; }

          /* extra headroom for slide 4 grid */
          .text-draw {
            max-height: calc(100svh - var(--top-pad) - max(16px, env(safe-area-inset-bottom)));
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
