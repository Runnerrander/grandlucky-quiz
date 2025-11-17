// pages/winners.js
import { useState } from "react";
import Head from "next/head";

export default function WinnersPage() {
  const [lang, setLang] = useState<"hu" | "en">("hu");

  const copy = {
    hu: {
      badge: "AZ ELŐZŐ JÁTÉK NYERTESE:",
      title: "Napsugár Budapestről",
      p1: "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",
      p2: "Gratulálunk! Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul.",
      cta1: "Tovább a részletekhez",
      cta2: "Vissza a kezdőlapra",
      cta1Href: "/vivko",
      cta2Href: "/",
    },
    en: {
      badge: "PREVIOUS GAME WINNER:",
      title: "Napsugár from Budapest",
      p1: "Napsugár and her partner explore New York’s holiday spirit with Vivko.",
      p2: "Congratulations! See you in the next round — a brand-new giveaway starts now.",
      cta1: "See the details",
      cta2: "Back to home",
      cta1Href: "/vivko",
      cta2Href: "/",
    },
  }[lang];

  return (
    <>
      <Head>
        <title>Winner — GrandLucky Travel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main>
        {/* Language toggle */}
        <div className="lang">
          <button
            aria-label="Magyar"
            className={lang === "hu" ? "on" : ""}
            onClick={() => setLang("hu")}
          >
            HU
          </button>
          <button
            aria-label="English"
            className={lang === "en" ? "on" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>

        <div className="wrap">
          {/* Text card */}
          <section className="card">
            <div className="badge">{copy.badge}</div>
            <h1 className="title">{copy.title}</h1>
            <p>{copy.p1}</p>
            <p>{copy.p2}</p>

            <div className="actions">
              <a className="btn" href={copy.cta1Href}>
                {copy.cta1}
              </a>
              <a className="btn ghost" href={copy.cta2Href}>
                {copy.cta2}
              </a>
            </div>
          </section>

          {/* Winner photo */}
          <figure className="photo">
            <img
              src="/winners/napsugar.jpg"
              alt="Napsugár — GrandLucky Travel winner"
              width="820"
              height="1025"
            />
          </figure>
        </div>
      </main>

      <style jsx>{`
        :root {
          --bg: #fff;
          --text: #1a1a1a;
          --beige: #fff6e7;
          --pill: #faaf3b;
          --pillText: #222;
          --shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
          --scrim: rgba(255, 255, 255, 0.0); /* keep sharp; no blur */
          --radius: 18px;
        }

        main {
          position: relative;
          min-height: 100vh;
          color: var(--text);
          z-index: 0;
        }

        /* SHARP festive background (no blur) */
        main::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("/winners/bg-advent.jpg");
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          z-index: -2; /* sit behind everything */
        }

        /* subtle readability scrim (no blur) */
        main::after {
          content: "";
          position: fixed;
          inset: 0;
          background: var(--scrim);
          z-index: -1;
        }

        .wrap {
          display: grid;
          grid-template-columns: 1fr 680px;
          gap: 24px;
          align-items: center;
          padding: clamp(48px, 4vw, 64px) clamp(18px, 4vw, 40px);
          max-width: 1280px;
          margin: 0 auto;
        }

        .card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: none; /* keep sharp */
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 28px 28px 24px;
        }

        .badge {
          display: inline-block;
          background: var(--pill);
          color: var(--pillText);
          font-weight: 800;
          letter-spacing: 0.3px;
          padding: 8px 14px;
          border-radius: 999px;
          box-shadow: 0 6px 18px rgba(250, 175, 59, 0.35);
          margin-bottom: 14px;
          font-size: 13px;
        }

        .title {
          font-size: clamp(28px, 4vw, 36px);
          line-height: 1.2;
          margin: 6px 0 10px;
        }

        p {
          margin: 0 0 10px;
          font-size: 16px;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 999px;
          background: #fff;
          color: #222;
          border: 2px solid #fff;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.08s ease, box-shadow 0.12s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .btn.ghost {
          background: transparent;
          border-color: #fff;
        }

        .photo {
          background: #fff;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 10px;
        }
        .photo img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 12px;
        }

        /* Language toggle */
        .lang {
          position: fixed;
          top: 18px;
          right: 18px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .lang button {
          border: 0;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        .lang button.on {
          background: var(--pill);
        }

        @media (max-width: 990px) {
          .wrap {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .photo {
            order: 2;
          }
          .card {
            order: 1;
          }
        }
      `}</style>
    </>
  );
}
