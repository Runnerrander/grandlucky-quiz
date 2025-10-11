// pages/index.js
import Head from "next/head";
import { useState } from "react";

export default function Landing() {
  const [lang, setLang] = useState("hu");

  const t = {
    hu: {
      langBtn: "ENGLISH",
      title: "GrandLucky Travel",
      headline: "A játék véget ért",
      sub: "Köszönjük az érdeklődést! Hamarosan új bejelentéssel jelentkezünk.",
      contactLabel: "Kapcsolat:",
      contactEmail: "support@grandluckytravel.com",
      homeCta: "Vissza a kezdőlapra",
    },
    en: {
      langBtn: "MAGYAR",
      title: "GrandLucky Travel",
      headline: "The contest has ended",
      sub: "Thanks for your interest! New announcements are coming soon.",
      contactLabel: "Contact:",
      contactEmail: "support@grandluckytravel.com",
      homeCta: "Back to home",
    },
  };

  const c = t[lang];

  return (
    <main className="wrap">
      <Head>
        <title>{c.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Temporary page: do not index */}
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Language toggle */}
      <button
        className="lang"
        aria-label="Toggle language"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {c.langBtn}
      </button>

      <section className="card">
        <h1 className="brand">GrandLucky</h1>
        <h2 className="headline">{c.headline}</h2>
        <p className="sub">{c.sub}</p>

        {/* Contact ONLY (email) */}
        <p className="contact">
          <strong>{c.contactLabel}</strong>{" "}
          <a className="link" href="mailto:support@grandluckytravel.com">
            {c.contactEmail}
          </a>
        </p>
      </section>

      <style jsx>{`
        :global(:root) {
          --paper: #f6a83b;
          --ink: #222;
          --chip: #fff;
          --shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
        }
        .wrap {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          background: var(--paper);
          font-family: "Montserrat", system-ui, sans-serif;
          color: var(--ink);
          padding: 18px;
        }
        .lang {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 2;
          background: #ffdca7;
          border: 3px solid #e69b2f;
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: 900;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), inset 0 2px 0 #fff6;
        }
        .card {
          background: var(--chip);
          width: min(760px, 92vw);
          border-radius: 16px;
          padding: clamp(22px, 5vw, 36px);
          box-shadow: var(--shadow);
          text-align: center;
        }
        .brand {
          margin: 0 0 4px;
          font: 700 clamp(40px, 6.5vw, 56px) "Caveat", cursive;
        }
        .headline {
          margin: 0;
          font-size: clamp(22px, 3.2vw, 30px);
          font-weight: 900;
        }
        .sub {
          margin: 10px 0 14px;
          font-size: clamp(16px, 2vw, 18px);
          opacity: 0.9;
        }
        .contact {
          margin: 14px 0 0;
          font-weight: 700;
        }
        .link {
          color: var(--ink);
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}

// Keep it fresh while this temp page is live
export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
