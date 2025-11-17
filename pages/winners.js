// pages/winners.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu");

  const T = {
    hu: {
      titleTop: "Ő az előző játék nyertese:",
      name: "Napsugár Budapestről",
      blurb1:
        "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",
      blurb2:
        "Gratulálunk! Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul.",
      cta: "Tovább a részletekhez",
      back: "Vissza a kezdőlapra",
    },
    en: {
      titleTop: "Winner of the previous contest:",
      name: "Napsugár from Budapest",
      blurb1:
        "Napsugár and her boyfriend will explore New York’s Advent season with Vivko.",
      blurb2:
        "Congratulations! A new contest is starting now — join the next round.",
      cta: "Continue to details",
      back: "Back to homepage",
    },
  };

  const t = T[lang];

  return (
    <main className={`wrap ${lang === "hu" ? "is-hu" : "is-en"}`}>
      <Head>
        <title>GrandLucky Travel — Winner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Background */}
      <div className="bg" aria-hidden />

      <div className="content">
        {/* Lang switch */}
        <div className="lang">
          <button
            className={lang === "hu" ? "active" : ""}
            onClick={() => setLang("hu")}
          >
            HU
          </button>
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>

        {/* Text block */}
        <section className="text">
          <h1 className="script">{t.titleTop}</h1>
          <h2 className="name">{t.name}</h2>
          <p className="p">{t.blurb1}</p>
          <p className="p">{t.blurb2}</p>

          <div className="ctaRow">
            <Link href="/vivko" legacyBehavior>
              <a className="btn primary">{t.cta}</a>
            </Link>
            <Link href="/" legacyBehavior>
              <a className="btn ghost">{t.back}</a>
            </Link>
          </div>
        </section>

        {/* Photo */}
        <figure className="photo">
          <img
            src="/winners/napsugar.jpg"
            alt="Napsugár — GrandLucky Travel winner"
            loading="eager"
          />
        </figure>
      </div>

      <style jsx>{`
        :global(:root) {
          --ink: #161616;
          --muted: rgba(0, 0, 0, 0.72);
          --yellow: #ffbf3b;
          --yellow-border: #eaa21a;
          --card: #ffffff;
          --ring: #e6e6e6;
        }
        .wrap {
          min-height: 100dvh;
          position: relative;
          color: var(--ink);
          font-family: "Montserrat", system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial, "Noto Sans", sans-serif;
          overflow-x: hidden;
        }
        .bg {
          position: fixed;
          inset: 0;
          background: url("/bg-advent.jpg") center / cover no-repeat;
          filter: brightness(0.96) saturate(1.02);
          z-index: -2;
        }
        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(14px, 3vw, 28px);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: clamp(18px, 3vw, 36px);
          align-items: center;
        }
        .lang {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: clamp(6px, 1.2vw, 10px);
        }
        .lang button {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--ring);
          background: #fff;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
        }
        .lang .active {
          border-color: var(--ink);
        }

        .text {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: saturate(1.05) blur(0.5px);
          border: 1px solid #f0e3c9;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: clamp(18px, 3.4vw, 36px);
        }
        .script {
          font-family: "Caveat", cursive;
          font-weight: 700;
          font-size: clamp(28px, 4.4vw, 52px);
          color: var(--yellow);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6),
            0 0 10px rgba(255, 191, 59, 0.3);
          margin: 0 0 4px;
        }
        .name {
          font-weight: 900;
          font-size: clamp(22px, 2.6vw, 34px);
          margin: 0 0 10px;
          letter-spacing: -0.2px;
        }
        .p {
          margin: 8px 0;
          font-weight: 500;
          color: var(--muted);
          line-height: 1.45;
          font-size: clamp(14px, 1.3vw, 18px);
        }
        .ctaRow {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.3px;
        }
        .primary {
          background: linear-gradient(180deg, #ffd767 0%, #ffbf3b 100%);
          color: #1b1b1b;
          border: 3px solid var(--yellow-border);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.14),
            0 4px 10px rgba(0, 0, 0, 0.08), 0 0 10px rgba(255, 191, 59, 0.28),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.55);
        }
        .ghost {
          background: #ffffff;
          color: var(--ink);
          border: 2px solid var(--ring);
        }

        .photo {
          margin: 0;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #eadfcb;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.12);
          background: var(--card);
        }
        .photo img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        @media (max-width: 980px) {
          .content {
            grid-template-columns: 1fr;
          }
          .lang {
            justify-content: center;
          }
          .photo {
            order: -1;
          }
        }
      `}</style>
    </main>
  );
}
