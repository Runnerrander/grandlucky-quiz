// pages/winners.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu"); // HU default

  // Routes (easy to change later)
  const PLAY_HREF = "/contest";
  const LEADERBOARD_HREF = "/leaderboard";

  // Assets (put these in /public)
  // Background image: /public/winners-hero.jpg
  // Videos:
  //  - /public/winners/napsugar.mp4
  //  - /public/winners/emma.mp4
  const HERO_BG = "/winners-hero.jpg";

  const copy = {
    hu: {
      headTitle: "Korábbi nyerteseink — GrandLuckyTravel",
      langBtnHU: "HU",
      langBtnEN: "EN",

      sectionTitle: "Korábbi nyerteseink",

      w1Name: "Napsugár",
      w1City: "Budapest",
      w1Text:
        "Napsugár Budapestről érkezett, és fantasztikus teljesítménnyel nyerte meg a játékot.",

      w2Name: "Emma",
      w2City: "Seregélyes",
      w2Text:
        "Emma anyukájával Seregélyesről érkezett, és fantasztikus teljesítménnyel nyerte meg a játékot.",

      watch: "Nézd meg a videót:",
      primary: "TOVÁBB A JÁTÉKHOZ",
      secondary: "EREDMÉNYTÁBLA MEGTEKINTÉSE",
    },
    en: {
      headTitle: "Previous Winners — GrandLuckyTravel",
      langBtnHU: "HU",
      langBtnEN: "EN",

      sectionTitle: "Previous winners",

      w1Name: "Napsugár",
      w1City: "Budapest",
      w1Text:
        "Napsugár came from Budapest and won the game with an outstanding performance.",

      w2Name: "Emma",
      w2City: "Seregélyes",
      w2Text:
        "Emma came from Seregélyes with her mom and won the game with an outstanding performance.",

      watch: "Watch the video:",
      primary: "CONTINUE TO PLAY",
      secondary: "VIEW LEADERBOARD",
    },
  };

  const t = copy[lang];

  return (
    <main className="page">
      <Head>
        <title>{t.headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Language toggle */}
      <div className="lang">
        <button
          className={`chip ${lang === "hu" ? "active" : ""}`}
          onClick={() => setLang("hu")}
          aria-pressed={lang === "hu"}
        >
          {t.langBtnHU}
        </button>
        <button
          className={`chip ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
        >
          {t.langBtnEN}
        </button>
      </div>

      {/* FULL SCREEN HERO */}
      <section className="hero" aria-label="Winners hero image" />

      {/* Content starts BELOW the image */}
      <section className="content">
        <h1 className="pageTitle">{t.sectionTitle}</h1>

        {/* Winner 1 */}
        <div className="block blockA">
          <div className="inner">
            <h2 className="name">
              {t.w1Name} <span className="dash">—</span>{" "}
              <span className="city">{t.w1City}</span>
            </h2>

            <p className="desc">{t.w1Text}</p>

            <p className="watch">{t.watch}</p>

            <div className="videoWrap">
              <video className="video" controls playsInline preload="metadata">
                <source src="/winners/napsugar.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Winner 2 */}
        <div className="block blockB">
          <div className="inner">
            <h2 className="name">
              {t.w2Name} <span className="dash">—</span>{" "}
              <span className="city">{t.w2City}</span>
            </h2>

            <p className="desc">{t.w2Text}</p>

            <p className="watch">{t.watch}</p>

            <div className="videoWrap">
              <video className="video" controls playsInline preload="metadata">
                <source src="/winners/emma.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="actions">
          <Link href={PLAY_HREF} legacyBehavior>
            <a className="btn primary">{t.primary}</a>
          </Link>

          <Link href={LEADERBOARD_HREF} legacyBehavior>
            <a className="btn secondary">{t.secondary}</a>
          </Link>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --dark: #222;
          --muted: rgba(0, 0, 0, 0.74);
          --paper: #fffaf1;
          --yellow: #faaf3b;
          --yellow-border: #e79a2f;
        }

        .page {
          position: relative;
          min-height: 100dvh;
          font-family: "Montserrat", system-ui, sans-serif;
          background: #f6a83b;
          color: var(--dark);
          overflow-x: hidden;
        }

        /* top-right language chips */
        .lang {
          position: fixed;
          top: clamp(14px, 2.2vw, 24px);
          right: clamp(14px, 2.2vw, 24px);
          z-index: 50;
          display: flex;
          gap: 8px;
        }

        .chip {
          border: 0;
          padding: 10px 14px;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06),
            0 10px 22px rgba(0, 0, 0, 0.12);
          cursor: pointer;
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        .chip.active {
          background: #ffdca7;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12),
            inset 0 2px 0 rgba(255, 255, 255, 0.55);
        }

        /* Fullscreen hero image (no overlay) */
        .hero {
          height: 100svh;
          height: 100dvh;
          background: url(${JSON.stringify(HERO_BG)}) center / cover no-repeat;
        }

        .content {
          width: min(980px, 92vw);
          margin: 18px auto 44px;
        }

        .pageTitle {
          margin: 6px 0 12px;
          font-weight: 900;
          font-size: clamp(22px, 2.6vw, 32px);
          letter-spacing: -0.2px;
        }

        .block {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
          margin: 16px 0;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .blockA {
          background: var(--paper);
        }

        .blockB {
          background: #ffe9c4;
          border-color: #f1c27a;
        }

        .inner {
          padding: clamp(16px, 2.8vw, 26px);
        }

        .name {
          margin: 0 0 8px;
          font-weight: 900;
          font-size: clamp(22px, 2.6vw, 34px);
          letter-spacing: -0.2px;
        }

        .dash {
          opacity: 0.55;
          font-weight: 900;
        }

        .city {
          opacity: 0.9;
        }

        .desc {
          margin: 0 0 10px;
          font-weight: 600;
          font-size: clamp(15px, 1.55vw, 18px);
          color: rgba(0, 0, 0, 0.78);
          line-height: 1.45;
        }

        .watch {
          margin: 0 0 10px;
          font-weight: 800;
          color: var(--muted);
        }

        .videoWrap {
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .video {
          width: 100%;
          height: auto;
          display: block;
        }

        .actions {
          margin-top: 18px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          text-decoration: none;
          padding: 14px 22px;
          font-size: 13px;
          letter-spacing: 0.3px;
        }

        .btn.primary {
          background: var(--yellow);
          color: #111;
          border: 3px solid var(--yellow-border);
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.16),
            inset 0 2px 0 rgba(255, 255, 255, 0.55);
        }

        .btn.secondary {
          background: #fff;
          color: #111;
          border: 2px solid rgba(0, 0, 0, 0.14);
        }

        @media (max-width: 900px) {
          .content {
            width: calc(100vw - 28px);
            margin: 14px auto 28px;
          }

          .actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}