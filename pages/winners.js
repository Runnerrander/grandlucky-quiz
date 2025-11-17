// pages/winners.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu");

  const t = {
    hu: {
      badge: "Ő az előző játék nyertese:",
      name: "Napsugár Budapestről",
      line1:
        "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát.",
      line2:
        "Gratulálunk! Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul.",
      cta1: "TOVÁBB A RÉSZLETEKHEZ",
      cta2: "VISSZA A KEZDŐLAPRA",
    },
    en: {
      badge: "Winner of the previous contest:",
      name: "Napsugár from Budapest",
      line1:
        "Napsugár and her boyfriend will explore New York’s Advent season with Vivko.",
      line2:
        "Congratulations! See you in the next round — a brand-new contest starts now.",
      cta1: "GO TO DETAILS",
      cta2: "BACK TO HOME",
    },
  };

  const c = t[lang];

  return (
    <main className={`winners-hero ${lang === "hu" ? "is-hu" : "is-en"}`}>
      <Head>
        <title>GrandLucky Travel — Winner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Background layer handled in CSS ::before */}

      <div className="content">
        {/* language toggle */}
        <div className="lang">
          <button className={lang === "hu" ? "active" : ""} onClick={() => setLang("hu")}>
            HU
          </button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
            EN
          </button>
        </div>

        <div className="wrap">
          {/* left card */}
          <section className="card">
            <p className="badge">{c.badge}</p>
            <h1 className="name">{c.name}</h1>
            <p className="p">{c.line1}</p>
            <p className="p">{c.line2}</p>

            <div className="actions">
              <Link href="/vivko" legacyBehavior>
                <a className="btn primary">{c.cta1}</a>
              </Link>
              <Link href="/" legacyBehavior>
                <a className="btn ghost">{c.cta2}</a>
              </Link>
            </div>
          </section>

          {/* right photo */}
          <figure className="photo">
            {/* NOTE: filename is case-sensitive on Vercel */}
            <img src="/winners/napsugar.JPG" alt="Napsugár — GrandLucky Travel winner" />
          </figure>
        </div>
      </div>

      <style jsx>{`
        :global(:root) {
          --beige: #fff6e6;
          --shadow: rgba(0, 0, 0, 0.12);
          --muted: #444;
          --yellow: #ffbf3b;
          --yellow-border: #eaa21a;
        }

        .winners-hero {
          position: relative;
          min-height: 100dvh;
          display: grid;
          align-items: start;
          isolation: isolate;
          color: #111;
        }

        /* full-bleed background image + soft overlay */
        .winners-hero::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            linear-gradient(0deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.86)),
            url("/winners/bg-winner.jpg") center / cover no-repeat;
          z-index: -2;
        }
        /* warm vignette around edges for depth */
        .winners-hero::after {
          content: "";
          position: fixed;
          inset: 0;
          box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.12);
          z-index: -1;
          pointer-events: none;
        }

        .content {
          width: min(1200px, 92vw);
          margin: clamp(18px, 3vw, 28px) auto;
        }

        .lang {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-bottom: clamp(10px, 1.6vw, 14px);
        }
        .lang button {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #fff;
          font: 700 12px/1 "Montserrat", system-ui, sans-serif;
          cursor: pointer;
        }
        .lang .active {
          border-color: #111;
        }

        .wrap {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: clamp(20px, 3vw, 30px);
          align-items: center;
        }

        .card {
          background: #fff;
          border-radius: 14px;
          padding: clamp(18px, 2.6vw, 24px);
          box-shadow: 0 10px 30px var(--shadow);
        }
        .badge {
          font: 700 clamp(18px, 2.2vw, 22px) "Caveat", cursive;
          color: var(--yellow);
          margin: 0 0 6px;
          text-shadow: 0 1px 0 #fff;
        }
        .name {
          font: 900 clamp(26px, 3.2vw, 34px) "Montserrat", system-ui, sans-serif;
          margin: 0 0 8px;
        }
        .p {
          margin: 6px 0;
          color: var(--muted);
          font: 500 16px/1.55 "Montserrat", system-ui, sans-serif;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: clamp(12px, 1.8vw, 16px);
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          font: 900 12px/1 "Montserrat", system-ui, sans-serif;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          border: 3px solid var(--yellow-border);
        }
        .btn.primary {
          background: linear-gradient(180deg, #ffd767 0%, #ffbf3b 100%);
          color: #1b1b1b;
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.14),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.55);
        }
        .btn.primary:hover {
          transform: translateY(-2px);
          filter: saturate(1.05);
        }
        .btn.ghost {
          background: #fff;
          color: #1b1b1b;
          border-color: #e5e7eb;
        }

        .photo {
          margin: 0;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
        }
        .photo img {
          display: block;
          width: 100%;
          height: auto;
        }

        /* mobile */
        @media (max-width: 980px) {
          .wrap {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .photo {
            order: 2;
          }
          .card {
            order: 1;
          }
          .lang {
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
