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
          "Ha Te leszel a kétfordulós, tudásalapú verseny nyertese, Te és utazótárad felejthetetlen élményeket élhettek át az USA keleti partján, minden költséget mi fedezünk. A nevezési díj: $9.99.",
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
        phase1:
          "1. forduló: Online kvíz, lezárás 2025. szeptember 26. — 0:30 (CET)",
        phase2:
          "2. forduló: Online élő verseny, kezdés 2025. szeptember 27. — 20:00 (CET)",
        sub:
          "Nyertesként Te és egy általad választott kísérő a Grand Slam Travel és a Vivkó Nails kíséretében utazhattok New Yorkba. Az utazás teljes körűen megszervezett, így sem tapasztalatra, sem nyelvtudásra nincs szükség. A nyeremény tartalmazza az ESTA ügyintézést, a repülőjegyeket, a transzfereket, a manhattani szállást reggelivel, ebéddel és vacsorával különböző éttermekben, belépőket több nevezetességhez, valamint egy különleges meglepetést.\n" +
          "Az első forduló lezárása után a rendszer kiértékeli az eredményeket, és kiválasztja azt a hat versenyzőt, akik a legrövidebb idő alatt teljesítették a kvízt, valamint kiválaszt további huszonöt versenyzőt a befejezési idő alapján tartalék (standby) listára arra az esetre, ha a legjobb hat valamelyike nem lépne be a 2. fordulóba (élő verseny). Minden, a kvízt sikeresen teljesítő felhasználónév felkerül a GrandLucky Travel weboldalára 2025. szeptember 26-án 02:00-kor (CT) a befejezés idejével együtt.",
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
          "If you will be the winner the two round contest based on your skills, You and your  travel companion will enjoy unforgettable experiences on the US East Coast with all expense covered. You can enter the contest for a $ 9.99 entry fee",
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
          "1st. Round: Online trivia, closing down September 26, 2025 - 0.30 (CET)",
        phase2:
          "2nd. Round: Online Live Contest, Starts September 27, 2025 — 18:00 (CET)",
        sub:
          "As the winner, you and a companion of your choice will travel to the Big Apple, accompanied by Grand Slam Travel and Vivko Nails. The trip is fully organized, so no prior experience or language skills are required. The prize includes ESTA processing, flights, transfers, a Manhattan hotel with breakfast, lunch and dinner in different restaurants, tickets to several attractions, and a special surprise.\n" +
          "After the first round will be closed down the system will evaluate and pick sixt contestant who completed the trivia in the shortest time and picks twenty five contestant based on the time of completion who be listed as standby in case someone from the first six not enters to the second round (live content). All the Usernames that completed the trivia will be listed on the grandlucky travel webpage on September 26 2025-02.00 CT with the time of completation.",
        ui: "cta",
        home: "HOME",
        play: "ENTER TO THE CONTEST",
      },
    ],
  };

  // Footer copy (bilingual)
  const footer = {
    hu: {
      contact:
        "Ha kérdésed vagy észrevételed van, kérjük, írj nekünk: ",
      rights1: "Minden jog fenntartva – Grandlucky Travel",
      rights2: "3495 US Highway 1 STE34#1217 Princeton, NJ 08540",
    },
    en: {
      contact:
        "If you have any questions or concerns please contact us at: ",
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
      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      {/* Content */}
      <section className="text">
        <h1 className="title">
          {S.hScript ? <span className="script">{S.hScript}</span> : null}
          {S.hStrongTop ? <span className="strong">{S.hStrongTop}</span> : null}

          {/* Slide 4: two small date lines */}
          {S.id === "draw" && S.phase1 && S.phase2 ? (
            <>
              <span className="phase">{S.phase1}</span>
              <span className="phase">{S.phase2}</span>
            </>
          ) : null}
        </h1>

        {S.sub && (
          <p className="sub">
            {S.sub.split("\n").map((line, k) => (
              <span key={k}>
                {line}
                <br />
              </span>
            ))}
          </p>
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

      {/* Footer (left, two-line rights/address, black text, bilingual) */}
      <footer className="legal">
        <p className="contact">
          {F.contact}
          <a href="mailto:support@gradluckytravel.com">
            support@gradluckytravel.com
          </a>
        </p>
        <p className="rights">
          <span>{F.rights1}</span>
          <br />
          <span>{F.rights2}</span>
        </p>
      </footer>

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

        .s-times.blur-left::before,
        .s-bridge.blur-left::before {
          background: none;
        }
        .s-times::after,
        .s-bridge::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: clamp(240px, 36vw, 520px);
          height: clamp(200px, 30vh, 400px);
          pointer-events: none;
          z-index: 1;
          background: radial-gradient(
              120% 100% at 0% 0%,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 255, 255, 0.75) 22%,
              rgba(255, 255, 255, 0.46) 48%,
              rgba(255, 255, 255, 0.18) 70%,
              rgba(255, 255, 255, 0) 100%
            ),
            radial-gradient(
              50% 40% at 12% 10%,
              rgba(255, 255, 255, 0.85) 0%,
              rgba(255, 255, 255, 0) 100%
            );
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .s-times .text {
          padding-top: clamp(12px, 4.8vw, 60px);
        }
        .s-times .strong {
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85),
            0 3px 10px rgba(0, 0, 0, 0.08);
        }
        .s-times .sub {
          color: #2a2a2a;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
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

        .text {
          position: relative;
          z-index: 2;
          max-width: min(980px, 86vw);
          margin-left: clamp(24px, 6.2vw, 80px);
          padding-top: clamp(38px, 7.2vw, 100px);
        }
        .s-bridge .text {
          padding-top: clamp(26px, 6.0vw, 80px);
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
        /* Smaller lines for the two rounds + keep each on a single line (desktop/tablet) */
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
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.18);
        }

        .row {
          display: flex;
          gap: clamp(12px, 1.6vw, 16px);
          align-items: center;
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

        /* Footer (left, two-line rights/address, black text) */
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
          .s-times.blur-left::before,
          .s-bridge.blur-left::before {
            background: none !important;
          }
          .s-times::after,
          .s-bridge::after {
            width: clamp(220px, 60vw, 520px);
            height: clamp(200px, 44vh, 380px);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
          .text {
            max-width: 92vw;
            margin: 0 auto;
            padding-top: clamp(22px, 9vw, 44px);
            text-align: left;
          }
          .s-times .text {
            padding-top: clamp(10px, 7vw, 38px);
          }
          .script {
            font-size: clamp(44px, 10vw, 66px);
          }
          .strong {
            font-size: clamp(32px, 8.5vw, 48px);
          }
          .phase {
            font-size: clamp(16px, 4.6vw, 22px);
            white-space: normal;
          }
          .sub {
            font-size: clamp(16px, 4.4vw, 20px);
          }
          .row {
            gap: 10px;
          }
          .btn {
            font-size: 12px;
            padding: 12px 20px;
          }
          .legal {
            bottom: clamp(14px, 3.6vh, 26px);
            left: clamp(12px, 4vw, 20px);
          }
          .legal .contact,
          .legal .rights {
            font-size: clamp(12px, 3.4vw, 14px);
          }
        }
      `}</style>
    </main>
  );
}
