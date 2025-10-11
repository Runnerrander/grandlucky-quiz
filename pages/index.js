// pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Landing() {
  const [lang, setLang] = useState<"hu" | "en">("hu");

  const t = {
    hu: {
      title: "GrandLuckyTravel — Tájékoztatás",
      h1: "Köszönjük az érdeklődést!",
      p1: "Ez a promóció jelenleg zárva van. Hamarosan új játékkal jelentkezünk ezen az oldalon.",
      p2: "Kérdéseiddel fordulj hozzánk bizalommal:",
      email: "support@grandluckytravel.com",
      oct12:
        "A 2. fordulóba jutó 6 versenyző felhasználónevét 2025. október 12-én 20:00-kor (magyar idő) tesszük közzé. Ugyanebben az időpontban az összes, kvízt teljesítő versenyző felhasználónevét is közzétesszük a befejezési idővel együtt.",
      home: "Vissza a kezdőlapra",
    },
    en: {
      title: "GrandLuckyTravel — Notice",
      h1: "Thank you for your interest!",
      p1: "This promotion is currently closed. We’ll announce the next contest here soon.",
      p2: "If you have any questions, please contact:",
      email: "support@grandluckytravel.com",
      oct12:
        "Usernames of the six contestants entering the second round will be posted on October 12 at 20:00 (Hungarian time). At the same time we’ll also publish the usernames of all participants who completed the trivia, with their completion time.",
      home: "Back to home",
    },
  }[lang];

  return (
    <main className="wrap">
      <Head>
        <title>{t.title}</title>
        {/* prevent indexing & try to avoid stale caching without SSR headers */}
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      <button className="lang" onClick={() => setLang(lang === "hu" ? "en" : "hu")}>
        {lang === "hu" ? "EN" : "HU"}
      </button>

      <section className="card">
        <h1 className="h1">{t.h1}</h1>
        <p className="p">{t.p1}</p>
        <p className="p">
          {t.p2}{" "}
          <a className="link" href="mailto:support@grandluckytravel.com">
            {t.email}
          </a>
        </p>
        <hr className="hr" />
        <p className="p strong">{t.oct12}</p>

        <div className="row">
          <Link href="/" className="btn">
            {t.home}
          </Link>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --bg: #101010;
          --ink: #222;
          --muted: rgba(0, 0, 0, 0.7);
          --accent: #faaf3b;
          --accent-border: #e49b28;
          --paper: #ffffff;
        }
        .wrap {
          min-height: 100dvh;
          background:
            radial-gradient(1400px 700px at 70% 10%, #2222 0%, transparent 60%),
            linear-gradient(180deg, #181818 0%, #0f0f0f 100%);
          display: grid;
          place-items: center;
          padding: 24px;
          font-family: "Montserrat", system-ui, sans-serif;
        }
        .lang {
          position: fixed;
          top: 14px;
          right: 14px;
          padding: 10px 16px;
          font-weight: 900;
          background: var(--accent);
          border: 3px solid var(--accent-border);
          border-radius: 999px;
          color: #111;
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.2), inset 0 2px 0 #fff6;
        }
        .card {
          width: min(880px, 92vw);
          background: var(--paper);
          color: var(--ink);
          border-radius: 18px;
          padding: clamp(20px, 4vw, 34px);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);
          transform: translateY(-2px);
        }
        .h1 {
          margin: 0 0 8px 0;
          font-weight: 900;
          font-size: clamp(22px, 3vw, 30px);
        }
        .p {
          margin: 10px 0;
          color: var(--muted);
          font-size: clamp(16px, 1.7vw, 18px);
          line-height: 1.55;
        }
        .p.strong {
          color: #111;
          font-weight: 700;
        }
        .hr {
          border: none;
          border-top: 1px solid #ececec;
          margin: 16px 0;
        }
        .link {
          color: #111;
          font-weight: 800;
          text-decoration: underline;
        }
        .row {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          background: var(--accent);
          border: 3px solid var(--accent-border);
          color: #111;
          text-decoration: none;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.18), inset 0 2px 0 #fff6;
        }
      `}</style>
    </main>
  );
}
