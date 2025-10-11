// pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Landing() {
  const [lang, setLang] = useState("hu");

  const t = {
    hu: {
      chip: "ANGOL",
      titleTop: "GrandLucky Travel",
      titleSub: "Új nyereményjáték hamarosan",
      closed: "A korábbi nyereményjáték lezárult. Köszönjük a részvételt!",
      blurb:
        "Hamarosan új, tudásalapú játékot indítunk. Addig is, kérdés esetén vedd fel velünk a kapcsolatot.",
      btnContact: "Kapcsolat / Impresszum",
      btnUpdates: "Szabályok & Felhasználói Feltételek",
    },
    en: {
      chip: "MAGYAR",
      titleTop: "GrandLucky Travel",
      titleSub: "New contest coming soon",
      closed: "The previous contest has ended. Thank you for participating!",
      blurb:
        "We’ll launch our next skill-based contest soon. Meanwhile, feel free to reach out if you have any questions.",
      btnContact: "Contact / Imprint",
      btnUpdates: "Rules & Terms of Use",
    },
  };

  const c = t[lang];

  return (
    <main className="wrap">
      <Head>
        <title>GrandLucky Travel — {c.titleSub}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* language toggle */}
      <button className="lang" onClick={() => setLang(lang === "hu" ? "en" : "hu")}>
        {c.chip}
      </button>

      {/* soft hero background (reuses an existing image if you like) */}
      <div className="hero" role="img" aria-label="seasonal-background" />

      <section className="card">
        <h1 className="brand">{c.titleTop}</h1>
        <h2 className="coming">{c.titleSub}</h2>
        <p className="closed">{c.closed}</p>
        <p className="blurb">{c.blurb}</p>

        <div className="row">
          <Link href="/thank-yous" className="btn ghost">
            {c.btnContact}
          </Link>
          <Link href="/user-agreement" className="btn primary">
            {c.btnUpdates}
          </Link>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --ink: #111;
          --muted: rgba(0, 0, 0, 0.72);
          --accent: #faaf3b;
          --accent-border: #e49b28;
        }
        .wrap {
          min-height: 100dvh;
          font-family: "Montserrat", system-ui, sans-serif;
          color: var(--ink);
          position: relative;
          overflow: hidden;
        }
        .lang {
          position: fixed;
          top: clamp(12px, 2vw, 20px);
          right: clamp(12px, 2vw, 20px);
          z-index: 3;
          background: #ffdca7;
          border: 3px solid var(--accent-border);
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: 900;
          box-shadow: 0 10px 18px rgba(0,0,0,.15), inset 0 2px 0 #fff6;
        }
        .hero {
          position: absolute;
          inset: 0;
          background: url("/vivko-ny.jpg") center / cover no-repeat;
          filter: brightness(.85);
        }
        .hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.05) 0%,
            rgba(255,255,255,0.18) 40%,
            rgba(255,255,255,0.35) 100%
          );
        }
        .card {
          position: relative;
          z-index: 2;
          width: min(900px, 92vw);
          margin: clamp(64px, 14vh, 180px) auto 0;
          background: rgba(255,255,255,.86);
          backdrop-filter: blur(4px);
          border: 2px solid #eee;
          border-radius: 18px;
          padding: clamp(18px, 3.2vw, 28px);
          box-shadow: 0 24px 48px rgba(0,0,0,.22);
          text-align: center;
        }
        .brand {
          margin: 0;
          font: 900 clamp(22px, 3.2vw, 32px) / 1 "Montserrat";
          letter-spacing: .2px;
        }
        .coming {
          margin: 6px 0 8px;
          font: 700 clamp(34px, 5.6vw, 54px) "Caveat", cursive;
          color: var(--accent);
          text-shadow: 0 1px 0 #fff8, 0 2px 6px rgba(0,0,0,.08);
        }
        .closed {
          margin: 6px 0 2px;
          font-weight: 800;
        }
        .blurb {
          margin: 6px 0 18px;
          color: var(--muted);
          font-size: clamp(15px, 1.6vw, 18px);
          line-height: 1.55;
        }
        .row {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          text-decoration: none;
          border: 3px solid var(--accent-border);
        }
        .btn.primary {
          background: var(--accent);
          color: #111;
          box-shadow: 0 16px 28px rgba(0,0,0,.18), inset 0 2px 0 #fff6;
        }
        .btn.ghost {
          background: #fff;
          color: #111;
          border-color: #e8e8e8;
        }
      `}</style>
    </main>
  );
}

// No-cache so edits appear instantly
export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
