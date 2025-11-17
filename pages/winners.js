// pages/winners.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu");

  const STR = {
    hu: {
      titleTop: "Ő az előző játék nyertese:",
      name: "Napsugár Budapestről",
      p1: "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",
      p2: "Gratulálunk! Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul.",
      ctaPrimary: "TOVÁBB A RÉSZLETEKHEZ",
      ctaSecondary: "VISSZA A KEZDŐLAPRA",
      langHU: "HU",
      langEN: "EN",
    },
    en: {
      titleTop: "Winner of the previous contest:",
      name: "Napsugár from Budapest",
      p1: "Napsugár and her boyfriend will explore New York’s Advent season with Vivko.",
      p2: "Congratulations! See you in the next round — a brand-new contest starts now.",
      ctaPrimary: "GO TO DETAILS",
      ctaSecondary: "BACK TO HOME",
      langHU: "HU",
      langEN: "EN",
    },
  };

  const t = STR[lang];

  return (
    <main className="page">
      <Head>
        <title>GrandLucky Travel — Winner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* language toggle */}
      <div className="lang">
        <button
          className={`chip ${lang === "hu" ? "active" : ""}`}
          onClick={() => setLang("hu")}
        >
          {t.langHU}
        </button>
        <button
          className={`chip ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
        >
          {t.langEN}
        </button>
      </div>

      <div className="wrap">
        {/* left: card */}
        <section className="card">
          <h2 className="titleTop">{t.titleTop}</h2>
          <h1 className="name">{t.name}</h1>
          <p className="p">{t.p1}</p>
          <p className="p">{t.p2}</p>

          <div className="actions">
            <Link href="/vivko" legacyBehavior>
              <a className="btn primary">{t.ctaPrimary}</a>
            </Link>
            <Link href="/" legacyBehavior>
              <a className="btn">{t.ctaSecondary}</a>
            </Link>
          </div>
        </section>

        {/* right: photo (NOTE: root path) */}
        <div className="photo">
          <img src="/napsugar.jpg" alt="Napsugár — GrandLucky Travel winner" />
        </div>
      </div>

      <style jsx>{`
        :global(:root) {
          --ink: #111;
          --muted: rgba(0, 0, 0, 0.7);
          --card: #fff;
          --beige: #fff7ea;
          --yellow: #ffbf3b;
          --yellow-border: #eaa21a;
          --border: #eee2c9;
        }

        .page {
          min-height: 100dvh;
          background:
            linear-gradient(180deg, #fffdf8 0%, #fff7e6 100%),
            url("/bg-advent.jpg") center/cover no-repeat fixed;
          color: var(--ink);
        }

        .lang {
          position: sticky;
          top: 0;
          z-index: 5;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          max-width: 1180px;
          margin: 10px auto 0;
          padding: 10px 14px;
        }
        .chip {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #fff;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
        }
        .chip.active {
          background: var(--yellow);
          border-color: var(--yellow-border);
        }

        .wrap {
          max-width: 1180px;
          margin: 26px auto 56px;
          padding: 0 14px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(16px, 3vw, 36px);
          align-items: start;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: clamp(16px, 3.2vw, 26px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);
        }
        .titleTop {
          font: 700 clamp(18px, 2vw, 22px) "Caveat", ui-sans-serif;
          color: #f0a800;
          margin: 0 0 6px;
        }
        .name {
          margin: 0 0 10px;
          font: 900 clamp(22px, 3vw, 30px) ui-sans-serif;
        }
        .p {
          margin: 8px 0;
          color: var(--muted);
          line-height: 1.5;
        }

        .actions {
          margin-top: 14px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          font: 800 12px/1 ui-sans-serif;
          text-transform: uppercase;
          text-decoration: none;
          color: #222;
          background: #fff;
          border: 1px solid #e5e7eb;
        }
        .btn.primary {
          background: linear-gradient(180deg, #ffd767 0%, #ffbf3b 100%);
          border: 3px solid var(--yellow-border);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.6);
        }

        .photo {
          display: grid;
          place-items: center;
          padding: clamp(6px, 1vw, 10px);
        }
        .photo img {
          display: block;
          width: min(520px, 40vw);
          height: auto;
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
          background: var(--beige);
        }

        @media (max-width: 980px) {
          .wrap {
            grid-template-columns: 1fr;
          }
          .photo img {
            width: min(640px, 92vw);
          }
        }
      `}</style>
    </main>
  );
}
