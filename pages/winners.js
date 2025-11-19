// pages/winners.js
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu"); // SSR-safe default

  const copy = {
    hu: {
      badge: "AZ ELŐZŐ JÁTÉK NYERTESE:",
      title: "Napsugár Budapestről",
      p1: "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",
      p2: "Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul.",
      ctaDetails: "TOVÁBB A RÉSZLETEKHEZ",
      ctaBack: "VISSZA A KEZDŐLAPRA",
    },
    en: {
      badge: "WINNER OF THE PREVIOUS GAME:",
      title: "Napsugár from Budapest",
      p1: "Napsugár and her partner will explore New York’s Advent vibes with Vivko.",
      p2: "See you in the next round — a brand-new prize game starts now.",
      ctaDetails: "SEE DETAILS",
      ctaBack: "BACK TO HOME",
    },
  };

  const t = copy[lang];

  return (
    <main className="page">
      {/* language toggle */}
      <div className="lang">
        <button
          className={`chip ${lang === "hu" ? "active" : ""}`}
          onClick={() => setLang("hu")}
          aria-pressed={lang === "hu"}
        >
          HU
        </button>
        <button
          className={`chip ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
        >
          EN
        </button>
      </div>

      <div className="wrap">
        <section className="card">
          <div className="badge">{t.badge}</div>
          <h1 className="h1">{t.title}</h1>
          <p>{t.p1}</p>
          <p>{t.p2}</p>

          <div className="actions">
            <a className="btn" href="/vivko">
              {t.ctaDetails}
            </a>
            <a className="btn ghost" href="/">
              {t.ctaBack}
            </a>
          </div>
        </section>

        <figure className="photo">
          <img
            src="/winners/napsugar.jpg"
            alt="Napsugár — GrandLucky Travel winner"
            loading="eager"
          />
        </figure>
      </div>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          padding: clamp(24px, 1.4vw, 28px);
          isolation: isolate; /* so ::before stays behind */
        }
        /* sharp festive background placed behind content (desktop/tablet) */
        .page::before {
          content: "";
          position: fixed; /* stays put while scrolling */
          inset: 0;
          background: url("/winners/bg-advent.jpg") center/cover no-repeat;
          z-index: -1;
        }

        .lang {
          position: sticky;
          top: 16px;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-bottom: 16px;
          z-index: 2;
        }
        .chip {
          border: 0;
          padding: 6px 12px;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06),
            0 4px 18px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          font-weight: 600;
        }
        .chip.active {
          background: #f7b940;
        }

        .wrap {
          display: grid;
          grid-template-columns: 1fr 680px;
          gap: 20px;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .card {
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: saturate(1.02);
          border-radius: 14px;
          padding: 22px 22px 20px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.13);
        }
        .badge {
          display: inline-block;
          background: #f7b940;
          color: #000;
          font-weight: 800;
          border-radius: 999px;
          padding: 8px 12px;
          margin-bottom: 10px;
        }
        .h1 {
          font-size: clamp(28px, 3.6vw, 40px);
          line-height: 1.1;
          margin: 4px 0 12px;
        }
        .actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-block;
          padding: 12px 18px;
          border-radius: 999px;
          background: #111;
          color: #fff;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn.ghost {
          background: #fff;
          color: #111;
          box-shadow: inset 0 0 0 2px #111;
        }

        .photo {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.16);
          overflow: hidden;
        }
        .photo img {
          display: block;
          width: 100%;
          height: auto;
        }

        @media (max-width: 990px) {
          .page {
            padding: 16px;
            min-height: 100vh;
          }

          /* use the winner photo as the full background on mobile */
          .page::before {
            display: none;
          }

          .wrap {
            max-width: 100%;
            margin: 0;
            min-height: calc(100vh - 32px);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .photo {
            position: absolute;
            inset: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .card {
            position: relative;
            max-width: 92vw;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
          }

          .actions {
            flex-direction: column;
          }
          .btn,
          .btn.ghost {
            text-align: center;
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
