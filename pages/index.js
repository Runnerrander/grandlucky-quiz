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
      subTop: "Fedezd fel New Yorkot, Washington DC-t",
      subBottom:
        "és a Niagara-vízesést (Kanadai oldal is) Vivkóval 2026 nyarán!",
      cta: "KATTINTS A RÉSZLETEKÉRT!",
      tagTop: "Egy kis tudással és gyorsasággal",
      tagBottom: "egy ebéd áráért velünk utazhatsz! $24.99",
      href: "/winners",
    },
    en: {
      script: "Welcome",
      strongTop: "to\u00A0GrandLuckyTravel",
      strongBottom: "website!",
      subTop:
        "Explore New York, Washington DC and the Niagara Falls (Canadian Side Too)",
      subBottom: "with Vivko in Summer 2026!",
      cta: "CLICK FOR DETAILS",
      tagTop: "With a little knowledge and speed",
      tagBottom: "you can travel with us for the price of a lunch! $24.99",
      href: "/winners",
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
          {/* language */}
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

          {/* doodles */}
          <img className="decor plane" src="/plane-hero.png" alt="" />
          <img className="decor passport" src="/leaflet.png" alt="" />
          <img className="decor drop d1" src="/drop-1.png" alt="" />
          <img className="decor drop d2" src="/drop-2.png" alt="" />

          {/* heading */}
          <h1 className="title">
            <span className="script">{c.script}</span>
            <br />
            <span className="strong">{c.strongTop}</span>
            <br className="desktop-break" />
            <span className="strong">{c.strongBottom}</span>
          </h1>

          {/* subline split */}
          <p className="subline">
            <span className="block">{c.subTop}</span>
            <span className="block">{c.subBottom}</span>
          </p>

          {/* CTA */}
          <div className="cta-row">
            <div className="cta-wrap">
              <Link href={c.href} legacyBehavior>
                <a className="btn">{c.cta}</a>
              </Link>
            </div>
          </div>

          {/* tagline split (BLINKING) */}
          <p className="tagline blink">
            <span className="block">{c.tagTop}</span>
            <span className="block">{c.tagBottom}</span>
          </p>
        </div>

        {/* camera */}
        <img className="decor camera" src="/camera.png" alt="" />
      </div>

      <style jsx>{`
        :global(:root) {
          --dark: #262626;
          --muted: rgba(0, 0, 0, 0.62);
          --yellow: #ffbf3b;
          --yellow-border: #eaa21a;

          /* Sharper background (moderate zoom) */
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

          /* keep fonts crisp */
          -webkit-font-smoothing: auto;
          -moz-osx-font-smoothing: auto;
          text-rendering: geometricPrecision;
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
          word-break: keep-all;
        }

        .script {
          position: relative;
          z-index: 3;
          font: 700 clamp(56px, 5.2vw, 88px) "Caveat", cursive;
          color: var(--yellow);
          text-shadow:
            0 2px 0 rgba(255, 255, 255, 0.55),
            0 10px 18px rgba(0, 0, 0, 0.08),
            0 0 14px rgba(255, 191, 59, 0.45),
            0 0 1px rgba(255, 191, 59, 0.3);
          margin-left: clamp(220px, 17vw, 280px);
        }

        .strong {
          font-family: "Montserrat", system-ui, sans-serif;
          font-weight: 900;
          font-size: clamp(40px, 4vw, 64px);
          letter-spacing: -0.2px;
        }

        .subline {
          margin: clamp(12px, 1.2vw, 16px) 0 clamp(18px, 1.6vw, 22px);
          font: 500 clamp(18px, 1.6vw, 24px) "Montserrat", system-ui, sans-serif;
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
          position: relative;
          display: inline-block;
          margin-bottom: clamp(6px, 0.8vw, 10px);
          isolation: isolate;
          /* default: no side shift for EN */
          margin-right: 0;
        }
        .cta-wrap::before {
          content: "";
          position: absolute;
          inset: -8px -14px -10px;
          background: radial-gradient(
            55% 60% at 50% 40%,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.12) 48%,
            rgba(255, 255, 255, 0) 80%
          );
          filter: blur(1.2px);
          z-index: -1;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(14px, 1.2vw, 16px) clamp(24px, 2.2vw, 32px);
          border-radius: 999px;
          font: 900 clamp(12px, 0.95vw, 14px)/1 "Montserrat";
          text-transform: uppercase;
          background: linear-gradient(180deg, #ffd767 0%, #ffbf3b 100%);
          color: #1b1b1b;
          border: 3px solid var(--yellow-border);
          text-decoration: none;
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.14),
            0 4px 10px rgba(0, 0, 0, 0.08),
            0 0 10px rgba(255, 191, 59, 0.28),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.55);
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            filter 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 16px 28px rgba(0, 0, 0, 0.2),
            0 7px 14px rgba(0, 0, 0, 0.12),
            0 0 14px rgba(255, 191, 59, 0.38),
            inset 0 2px 0 rgba(255, 255, 255, 0.62);
          filter: saturate(1.04);
        }

        /* Tagline */
        .tagline {
          margin-top: clamp(8px, 1vw, 12px);
          font: 700 clamp(22px, 2.1vw, 30px) "Caveat", cursive;
          color: var(--yellow);
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.5),
            0 0 8px rgba(255, 191, 59, 0.35);
        }

        /* BLINK between yellow and white */
        .blink {
          animation: blinkY 1.15s infinite ease-in-out;
        }
        @keyframes blinkY {
          0%,
          100% {
            color: var(--yellow);
            text-shadow:
              0 1px 0 rgba(255, 255, 255, 0.5),
              0 0 8px rgba(255, 191, 59, 0.35);
          }
          50% {
            color: #ffffff;
            text-shadow:
              0 1px 0 rgba(0, 0, 0, 0.18),
              0 0 10px rgba(255, 255, 255, 0.7);
          }
        }

        /* --- HUNGARIAN-ONLY LEFT SHIFT --- */
        .is-hu .cta-wrap {
          margin-right: clamp(56px, 8vw, 140px);
        }
        .is-hu .tagline {
          text-align: right;
          width: fit-content;
          margin-left: auto;
          margin-right: clamp(56px, 8vw, 140px);
        }

        /* Doodles */
        .decor {
          position: absolute;
          pointer-events: none;
          z-index: 2;
          opacity: 0.98;
        }
        .plane {
          left: clamp(-24px, 0.8vw, 36px);
          top: clamp(-64px, -4.6vw, -18px);
          width: clamp(240px, 19.5vw, 320px);
        }
        .passport {
          left: clamp(240px, 19vw, 300px);
          top: clamp(-6px, 0.6vw, 22px);
          width: clamp(84px, 7.4vw, 116px);
          transform: rotate(-12deg);
        }
        .drop.d1 {
          left: clamp(200px, 16.4vw, 250px);
          top: clamp(52px, 5.6vw, 100px);
          width: clamp(14px, 1.6vw, 24px);
        }
        .drop.d2 {
          left: clamp(222px, 17.8vw, 268px);
          top: clamp(76px, 7.4vw, 126px);
          width: clamp(12px, 1.5vw, 22px);
        }
        .camera {
          position: fixed;
          right: clamp(28px, 3vw, 64px);
          bottom: clamp(12px, 2.2vw, 34px);
          width: clamp(110px, 12vw, 188px);
          transform: rotate(8deg);
          z-index: 1;
        }

        /* Desktop crop */
        @media (min-width: 1280px) and (max-width: 1920px) {
          .hero {
            background-size: 125% auto;
            background-position: 8% 43%;
          }
        }

        /* Mobile */
        @media (max-width: 900px) {
          .overlay {
            grid-template-columns: 1fr;
            background: none !important;
          }
          .text {
            margin: 0 auto;
            text-align: center;
            padding: max(16px, env(safe-area-inset-top))
              clamp(16px, 6vw, 36px) clamp(24px, 8vw, 40px);
          }

          .lang {
            justify-content: center;
            gap: 10px;
            margin-bottom: clamp(10px, 3.6vw, 18px);
          }
          .lang button {
            background: var(--yellow);
            color: #1b1b1b;
            border: 3px solid var(--yellow-border);
            padding: 10px 16px;
            box-shadow:
              0 8px 16px rgba(0, 0, 0, 0.12),
              inset 0 1.5px 0 rgba(255, 255, 255, 0.65);
          }
          .lang .active {
            filter: saturate(1.05) brightness(1.02);
          }

          .script {
            margin-left: 0 !important;
            font-size: clamp(40px, 10vw, 56px);
          }
          .strong {
            font-size: clamp(30px, 7.4vw, 46px);
          }
          .subline {
            font-size: clamp(16px, 4.4vw, 20px);
          }
          .cta-row {
            justify-content: center;
          }
          .cta-wrap {
            margin-right: 0;
          }
          .decor {
            display: none;
          }
          .hero {
            background-size: cover;
            background-position: center;
          }
          .is-hu .tagline {
            margin-left: 0;
            margin-right: 0;
            text-align: center;
          }
        }

        @media (max-width: 375px) {
          .script {
            font-size: 36px;
          }
          .strong {
            font-size: 28px;
          }
          .subline {
            font-size: 15px;
          }
          .btn {
            padding: 12px 18px;
          }
        }
      `}</style>
    </main>
  );
}