// pages/index.js
import Head from "next/head";
import { useState } from "react";

export default function Landing() {
  const [lang, setLang] = useState<"hu" | "en">("hu");

  const copy = {
    hu: {
      langBtn: "ENGLISH",
      title: "GrandLucky Travel",
      headline: "Köszönjük az érdeklődést!",
      sub: "Az aktuális nyereményjáték véget ért. Hamarosan új projekttel jelentkezünk.",
      extra:
        "A második fordulóba bejutó 5 szerencsés versenyző felhasználónevei október 12-én 20:00-kor (magyar idő szerint) kerülnek közzétételre. Ugyanekkor közzétesszük az összes résztvevő felhasználónevét is a kvíz befejezési idejével együtt.",
      contactBtn: "KAPCSOLAT",
      contactAria: "Kapcsolatfelvétel e-mailben",
    },
    en: {
      langBtn: "MAGYAR",
      title: "GrandLucky Travel",
      headline: "Thanks for your interest!",
      sub: "The current contest has ended. We’ll be back soon with a new project.",
      extra:
        "The usernames of the 5 lucky contestants entering Round 2 will be listed on October 12 at 20:00 (Hungarian time). At the same time, all participating contestants’ usernames will be listed together with their quiz completion time.",
      contactBtn: "CONTACT",
      contactAria: "Contact us by email",
    },
  }[lang];

  return (
    <main className="wrap">
      <Head>
        <title>{copy.title}</title>
        {/* Temporary page should not be indexed */}
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Language toggle */}
      <button
        className="lang"
        onClick={() => setLang((l) => (l === "hu" ? "en" : "hu"))}
        aria-label="Toggle language"
      >
        {copy.langBtn}
      </button>

      {/* Content card */}
      <section className="card">
        <h1 className="brand">GrandLucky</h1>
        <h2 className="headline">
          <span className="script">{copy.headline}</span>
        </h2>

        <p className="sub">{copy.sub}</p>
        <p className="extra">{copy.extra}</p>

        <div className="actions">
          <a
            className="btn primary"
            href="mailto:support@grandluckytravel.com"
            aria-label={copy.contactAria}
          >
            {copy.contactBtn}
          </a>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --bg: #0f0f0f;
          --ink: #111;
          --paper: #fff8ef;
          --accent: #faaf3b;
          --accent-border: #e49b28;
          --muted: rgba(0, 0, 0, 0.7);
        }

        .wrap {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          background:
            radial-gradient(60vw 60vw at 85% 10%, #1a1a1a 0%, #0f0f0f 60%, #0a0a0a 100%),
            url("/vivko-ny.jpg") center / cover no-repeat fixed;
          position: relative;
          overflow: hidden;
          font-family: "Montserrat", system-ui, sans-serif;
        }

        /* soft veil over background for readability */
        .wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.42),
            rgba(0, 0, 0, 0.62)
          );
        }

        .lang {
          position: fixed;
          top: clamp(12px, 2.2vw, 20px);
          right: clamp(12px, 2.2vw, 20px);
          z-index: 3;
          padding: 10px 16px;
          border-radius: 999px;
          background: var(--accent);
          border: 3px solid var(--accent-border);
          color: #111;
          font-weight: 900;
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.25),
            inset 0 2px 0 rgba(255, 255, 255, 0.6);
        }

        .card {
          position: relative;
          z-index: 2;
          width: min(820px, 92vw);
          background: var(--paper);
          color: var(--ink);
          border-radius: 20px;
          padding: clamp(18px, 4vw, 36px);
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.35);
          border: 1px solid #f0eadf;
        }

        .brand {
          margin: 0 0 4px 0;
          font-size: clamp(18px, 1.6vw, 20px);
          letter-spacing: 0.6px;
          color: var(--muted);
          font-weight: 900;
        }

        .headline {
          margin: 0;
        }
        .script {
          display: inline-block;
          font: 700 clamp(36px, 5vw, 56px) "Caveat", cursive;
          color: var(--accent);
          text-shadow: 0 1px 0 #fff8, 0 2px 6px rgba(0, 0, 0, 0.12);
        }

        .sub {
          margin: 10px 0 8px;
          font-size: clamp(16px, 1.6vw, 18px);
          color: var(--muted);
          line-height: 1.55;
        }

        .extra {
          margin: 6px 0 16px;
          font-weight: 700;
          font-size: clamp(16px, 1.6vw, 18px);
          line-height: 1.5;
        }

        .actions {
          margin-top: 10px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 14px;
        }

        .btn.primary {
          background: var(--accent);
          border: 3px solid var(--accent-border);
          color: #111;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.2),
            inset 0 2px 0 rgba(255, 255, 255, 0.65);
        }
        .btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 22px 36px rgba(0, 0, 0, 0.28),
            inset 0 2px 0 rgba(255, 255, 255, 0.75);
        }

        @media (max-width: 900px) {
          .card {
            backdrop-filter: blur(2px);
          }
        }
      `}</style>
    </main>
  );
}

// Force no-cache so copy changes appear instantly
export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
