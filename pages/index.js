// pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Welcome() {
  const [lang, setLang] = useState("hu");

  const t = {
    hu: {
      script: "Üdvözlünk",
      strongTop: "a\u00A0GrandLuckyTravel",
      strongBottom: "weboldalán!",
      subTop:
        "Fedezd fel New Yorkot, Washington DC-t és a Niagara-vízesést (Kanadai oldal is)",
      subBottom: "Vivkóval júliusban!",
      cta: "KATTINTS A RÉSZLETEKÉRT!",
      tagTop: "Egy kis tudással és gyorsasággal",
      tagBottom: "egy ebéd áráért velünk utazhatsz! $24.99",
      href: "/weekly",
    },
    en: {
      script: "Welcome",
      strongTop: "to\u00A0GrandLuckyTravel",
      strongBottom: "website!",
      subTop:
        "Explore New York and Washington DC and the Niagara Falls (Canadian Side Too)",
      subBottom: "with Vivko in July!",
      cta: "CLICK FOR DETAILS",
      tagTop: "With a little knowledge and speed",
      tagBottom: "you can travel with us for the price of a lunch! $24.99",
      href: "/weekly",
    },
  };

  const c = t[lang];

  return (
    <main className={`hero ${lang === "hu" ? "is-hu" : "is-en"}`}>
      <Head>
        <title>GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      <div className="overlay">
        <div className="text">
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

          <img className="decor plane" src="/plane-hero.png" alt="" />
          <img className="decor passport" src="/leaflet.png" alt="" />
          <img className="decor drop d1" src="/drop-1.png" alt="" />
          <img className="decor drop d2" src="/drop-2.png" alt="" />

          <h1 className="title">
            <span className="script">{c.script}</span>
            <br />
            <span className="strong">{c.strongTop}</span>
            <br className="desktop-break" />
            <span className="strong">{c.strongBottom}</span>
          </h1>

          <p className="subline">
            <span className="block">{c.subTop}</span>
            <span className="block">{c.subBottom}</span>
          </p>

          <div className="cta-row">
            <div className="cta-wrap">
              <Link href={c.href} legacyBehavior>
                <a className="btn">{c.cta}</a>
              </Link>
            </div>
          </div>

          <p className="tagline blink">
            <span className="block">{c.tagTop}</span>
            <span className="block">{c.tagBottom}</span>
          </p>
        </div>

        <img className="decor camera" src="/camera.png" alt="" />
      </div>

      <style jsx>{`
        :global(:root) {
          --dark: #262626;
          --muted: rgba(0, 0, 0, 0.62);
          --yellow: #ffbf3b;
          --yellow-border: #eaa21a;

          --bg-zoom: 120%;
          --bg-pos-x: 8%;
          --bg-pos-y: 43%;
        }

        .hero {
          min-height: 100dvh;
          background: url("/BG-fooldal.png") no-repeat
            var(--bg-pos-x) var(--bg-pos-y) / var(--bg-zoom) auto;
          color: var(--dark);
        }

        .overlay {
          position: relative;
          min-height: inherit;
          display: grid;
          grid-template-columns: 1fr min(50vw, 980px);
          align-items: center;
          background: none;
        }

        .text {
          grid-column: 2 / 3;
          position: relative;
          margin-left: auto;
          padding: clamp(18px, 4.4vw, 56px) clamp(22px, 4.8vw, 60px);
          max-width: 980px;
        }

        .lang {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-bottom: clamp(6px, 0.8vw, 10px);
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

        .title {
          margin: 2px 0 clamp(12px, 1.2vw, 18px);
          line-height: 1.03;
        }

        .script {
          font: 700 clamp(56px, 5.2vw, 88px) "Caveat", cursive;
          color: var(--yellow);
          margin-left: clamp(220px, 17vw, 280px);
        }

        .strong {
          font-family: "Montserrat", system-ui, sans-serif;
          font-weight: 900;
          font-size: clamp(40px, 4vw, 64px);
        }

        .subline {
          margin: clamp(12px, 1.2vw, 16px) 0 clamp(18px, 1.6vw, 22px);
          font: 500 clamp(18px, 1.6vw, 24px) "Montserrat";
          color: var(--muted);
        }

        .block {
          display: block;
        }

        .cta-row {
          display: flex;
          justify-content: flex-end;
        }

        .cta-wrap {
          margin-bottom: clamp(6px, 0.8vw, 10px);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 999px;
          font: 900 14px/1 "Montserrat";
          text-transform: uppercase;
          background: linear-gradient(180deg, #ffd767 0%, #ffbf3b 100%);
          color: #1b1b1b;
          border: 3px solid var(--yellow-border);
          text-decoration: none;
        }

        .tagline {
          margin-top: 10px;
          font: 700 clamp(22px, 2.1vw, 30px) "Caveat", cursive;
          color: var(--yellow);
        }

        @keyframes blinkYellowWhite {
          0% { color: var(--yellow); }
          50% { color: #ffffff; }
          100% { color: var(--yellow); }
        }

        .tagline.blink {
          animation: blinkYellowWhite 1.1s infinite ease-in-out;
        }

        .decor {
          position: absolute;
          pointer-events: none;
        }

        .plane {
          left: 0;
          top: -40px;
          width: 260px;
        }

        .passport {
          left: 260px;
          top: 10px;
          width: 100px;
        }

        .camera {
          position: fixed;
          right: 40px;
          bottom: 20px;
          width: 150px;
        }
      `}</style>
    </main>
  );
}