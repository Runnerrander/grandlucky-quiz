// pages/winners.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu");

  const PLAY_HREF = "/vivko";
  const LEADERBOARD_HREF = "/leaderboard";

  const HERO_BG = "/winners-hero.jpg";

  const copy = {
    hu: {
      headTitle: "Korábbi nyerteseink — GrandLuckyTravel",
      langBtnHU: "HU",
      langBtnEN: "EN",

      sectionTitle: "Korábbi nyerteseink",
      sectionIntro:
        "Nézd meg az előző játékok nyerteseinek videóit. Hamarosan jön a következő lehetőség!",

      w1Name: "Napsugár",
      w1City: "Budapest",
      w1Text:
        "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",

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
      sectionIntro:
        "Watch videos from winners of previous games. A new opportunity is coming soon!",

      w1Name: "Napsugár",
      w1City: "Budapest",
      w1Text:
        "Napsugár and her partner explore the magical Advent atmosphere of New York with Vivko.",

      w2Name: "Emma",
      w2City: "Seregélyes",
      w2Text:
        "Emma arrived with her mother from Seregélyes and won the game with an outstanding performance.",

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
      </Head>

      <div className="lang">
        <button
          className={`chip ${lang === "hu" ? "active" : ""}`}
          onClick={() => setLang("hu")}
        >
          {t.langBtnHU}
        </button>
        <button
          className={`chip ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
        >
          {t.langBtnEN}
        </button>
      </div>

      <section className="hero" />

      <section className="content">
        <header className="top">
          <h1 className="title">{t.sectionTitle}</h1>
          <p className="intro">{t.sectionIntro}</p>
        </header>

        {/* Winner 1 */}
        <div className="block blockA">
          <h2 className="name">
            {t.w1Name} — {t.w1City}
          </h2>
          <p className="desc">{t.w1Text}</p>
          <p className="watch">{t.watch}</p>
          <div className="videoWrap">
            <video controls playsInline preload="metadata">
              <source src="/napsugar.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Winner 2 */}
        <div className="block blockB">
          <h2 className="name">
            {t.w2Name} — {t.w2City}
          </h2>
          <p className="desc">{t.w2Text}</p>
          <p className="watch">{t.watch}</p>
          <div className="videoWrap">
            <video controls playsInline preload="metadata">
              <source src="/emma.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div className="actions">
          <Link href={PLAY_HREF}>
            <a className="btn primary">{t.primary}</a>
          </Link>

          <Link href={LEADERBOARD_HREF}>
            <a className="btn secondary">{t.secondary}</a>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f6a83b;
          font-family: "Montserrat", sans-serif;
        }

        .lang {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 8px;
          z-index: 50;
        }

        .chip {
          padding: 8px 14px;
          border-radius: 999px;
          background: white;
          font-weight: 900;
          border: none;
        }

        .chip.active {
          background: #ffdca7;
        }

        .hero {
          height: 100vh;
          background: url("${HERO_BG}") center / cover no-repeat;
        }

        .content {
          width: min(980px, 92vw);
          margin: 24px auto 50px;
        }

        .top {
          background: rgba(255, 255, 255, 0.9);
          padding: 18px;
          border-radius: 16px;
          margin-bottom: 18px;
        }

        .title {
          font-size: 28px;
          font-weight: 900;
        }

        .block {
          background: #fffaf1;
          padding: 20px;
          border-radius: 18px;
          margin-bottom: 18px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .blockB {
          background: #ffe9c4;
        }

        .name {
          font-size: 22px;
          font-weight: 900;
        }

        .desc {
          margin: 8px 0;
          font-weight: 600;
        }

        .videoWrap {
          border-radius: 14px;
          overflow: hidden;
          background: black;
        }

        video {
          width: 100%;
          display: block;
        }

        .actions {
          display: flex;
          gap: 14px;
          margin-top: 20px;
        }

        .btn {
          flex: 1;
          text-align: center;
          padding: 14px;
          border-radius: 999px;
          font-weight: 900;
          text-decoration: none;
        }

        .primary {
          background: #faaf3b;
          color: black;
        }

        .secondary {
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.15);
          color: black;
        }

        /* MOBILE FIX */
        @media (max-width: 768px) {
          .actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}