// pages/winners.js
import { useState } from "react";
import Link from "next/link";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu"); // default HU

  const dict = {
    hu: {
      badge: "AZ ELŐZŐ JÁTÉK NYERTESE:",
      title: "Napsugár Budapestről",
      p1: "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",
      p2: "Gratulálunk! Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul.",
      cta1: "Tovább a részletekhez",
      cta2: "Vissza a kezdőlapra",
    },
    en: {
      badge: "WINNER OF THE PREVIOUS CONTEST:",
      title: "Napsugár from Budapest",
      p1: "Napsugár and her boyfriend will explore New York’s Advent season with Vivko.",
      p2: "Congratulations! See you in the next round — a new contest is starting now.",
      cta1: "Go to details",
      cta2: "Back to home",
    },
  };
  const t = dict[lang];

  return (
    <main>
      {/* language toggle */}
      <div className="lang">
        <button
          className={`chip ${lang === "hu" ? "active" : ""}`}
          onClick={() => setLang("hu")}
          aria-label="Magyar"
        >
          HU
        </button>
        <button
          className={`chip ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          aria-label="English"
        >
          EN
        </button>
      </div>

      <div className="wrap">
        <section className="card">
          <div className="badge">{t.badge}</div>
          <h1 className="title">{t.title}</h1>
          <p>{t.p1}</p>
          <p>{t.p2}</p>

          <div className="actions">
            <Link href="/vivko" className="btn primary">
              {t.cta1}
            </Link>
            <Link href="/" className="btn ghost">
              {t.cta2}
            </Link>
          </div>
        </section>

        <figure className="photo">
          <img
            src="/winners/napsugar.jpg"
            alt="Napsugár — GrandLucky Travel winner"
            loading="eager"
            decoding="async"
          />
        </figure>
      </div>

      <style jsx>{`
        :root {
          --accent: #faaf3b;
          --accent-deep: #eeaa2a;
          --shadow: rgba(0, 0, 0, 0.14);
        }

        /* Page */
        main {
          min-height: 100vh;
          position: relative;
          padding: clamp(18px, 2.4vw, 28px);
        }
        /* SAFE background layer (always visible) */
        main::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            linear-gradient(0deg, rgba(255,255,255,0.20), rgba(255,255,255,0.20)),
            url("/bg-advent.jpg") center/cover no-repeat;
          z-index: 0;
        }

        /* Content sits above background */
        .wrap, .lang { position: relative; z-index: 2; }

        .lang {
          position: fixed;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;
        }
        .chip {
          appearance: none;
          border: 0;
          font: 600 12px/1.1 Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff9f0;
          color: #8a6a2e;
          box-shadow: 0 6px 20px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.6);
          cursor: pointer;
          transition: transform .12s ease;
        }
        .chip:active { transform: scale(.98); }
        .chip.active {
          background: linear-gradient(180deg, #ffd77a 0%, #ffbf3a 100%);
          color: #402400;
        }

        .wrap {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: clamp(18px, 3vw, 28px);
          align-items: center;
          max-width: 1180px;
          margin: clamp(56px, 6vw, 84px) auto;
        }

        .card {
          background: #fff;
          border-radius: 14px;
          padding: clamp(16px, 3.2vw, 28px);
          box-shadow: 0 14px 40px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.6);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border-radius: 999px;
          font: 800 12px/1.1 Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          letter-spacing: .4px;
          background: linear-gradient(180deg, #ffd77a 0%, #ffbf3a 100%);
          color: #3b2a00;
          border: 2px solid var(--accent-deep);
          box-shadow: 0 6px 18px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.7);
          margin-bottom: 12px;
          /* we pass exact caps with accents in the string */
          text-transform: none;
        }

        .title {
          font: 900 clamp(22px, 3.6vw, 34px)/1.2 "Montserrat", Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          margin: 4px 0 10px;
          color: #111;
        }

        p {
          margin: 8px 0;
          font: 500 clamp(14px, 1.6vw, 16px)/1.55 Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          color: #333;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        /* BUTTONS (restore yellow pill + white pill) */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          text-decoration: none;
          font: 800 13px/1 Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          box-shadow: 0 10px 26px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.6);
          border: 0;
          transition: transform .12s ease, box-shadow .2s ease;
          color: #3b2a00;
        }
        .btn:active { transform: translateY(1px); }
        .btn.primary {
          background: linear-gradient(180deg, #ffd77a 0%, #ffbf3a 100%);
          border: 2px solid var(--accent-deep);
        }
        .btn.ghost {
          background: #fff;
          border: 2px solid #e7e2d9;
          color: #333;
        }

        .photo {
          margin: 0;
          background: rgba(255,255,255,.55);
          border-radius: 16px;
          box-shadow: 0 20px 50px var(--shadow), inset 0 1px 0 rgba(255,255,255,.8);
          padding: clamp(8px, 1.4vw, 12px);
        }
        .photo img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 12px;
        }

        @media (max-width: 980px) {
          .wrap { grid-template-columns: 1fr; max-width: 680px; }
          .photo { order: 2; }
          .card { order: 1; }
        }
      `}</style>
    </main>
  );
}
