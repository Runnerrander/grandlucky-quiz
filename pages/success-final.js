// pages/success-final.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const BG = "/final.jpg"; // make sure this exists in /public

export default function SuccessFinal() {
  const [lang, setLang] = useState("hu");

  const copy = {
    hu: {
      titleScript: "A regisztráció",
      titleStrong: "sikeresen megtörtént!",
      body: [
        "Köszönjük a regisztrációt! Örülünk, hogy csatlakoztál a sorsoláshoz és esélyed van Vivkóval együtt utazni!",
        "A felhasználónevedet és jelszavad tartsd biztonságos helyen. Később ezekkel az adatokkal azonosítunk. Ha többször is regisztrálsz, nagyobb az esélyed — minden egyes regisztráció adatait külön mentsd el.",
      ],
      emailPrefix: "Kérdés esetén írj nekünk a következő címen:",
      email: "support@grandluckytravel.com",
      legal1: "Grandlucky Travel a weboldal teljes tartalmáért felelős.",
      legal2:
        "Minden jog fenntartva — Grandlucky Travel, 3495 US Highway 1 STE34#1217, Princeton, NJ 08540, United States.",
      home: "FŐOLDAL",
      chip: "ANGOL",
    },
    en: {
      titleScript: "Registration",
      titleStrong: "completed successfully!",
      body: [
        "Thank you for registering! We’re excited you joined the drawing and now have a chance to travel with Vivko!",
        "Please keep your username and password in a safe place. We’ll use these later for verification. If you register multiple times, your chances increase—save each registration’s details separately.",
      ],
      emailPrefix: "Got a question? Email us at:",
      email: "support@grandluckytravel.com",
      legal1: "Grandlucky Travel is responsible for all the content of this website.",
      legal2:
        "All rights reserved to Grandlucky Travel, 3495 US Highway 1 STE34#1217, Princeton, NJ 08540, United States.",
      home: "HOME",
      chip: "MAGYAR",
    },
  }[lang];

  return (
    <main className="hero">
      <Head>
        <title>Thank You — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* lang toggle */}
      <button className="lang" onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}>
        {copy.chip}
      </button>

      {/* text block */}
      <section className="text">
        <h1 className="title">
          <span className="script">{copy.titleScript}</span>
          <span className="strong">{copy.titleStrong}</span>
        </h1>

        {copy.body.map((p, i) => (
          <p className="p" key={i}>
            {p}
          </p>
        ))}

        <p className="p email">
          {copy.emailPrefix}{" "}
          <a href={`mailto:${copy.email}`} rel="noopener noreferrer">
            {copy.email}
          </a>
        </p>

        <p className="legal">{copy.legal1}</p>
        <p className="legal">{copy.legal2}</p>

        <div className="row">
          <Link href="/" legacyBehavior>
            <a className="btn">{copy.home}</a>
          </Link>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --fg: #fff;
          --muted: rgba(255, 255, 255, 0.9);
          --yellow: #faaf3b;
          --yellow-border: #e49b28;
          --shadow: 0 16px 28px rgba(0, 0, 0, 0.35);
        }

        .hero {
          position: relative;
          height: 100svh;
          overflow: hidden;
          color: var(--fg);
          font-family: "Montserrat", system-ui, sans-serif;
          background: url(${JSON.stringify(BG)}) center / cover no-repeat #1e1e1e;
        }

        /* gentle left-side readability gradient */
        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.55) 24%,
            rgba(0, 0, 0, 0.3) 48%,
            rgba(0, 0, 0, 0) 70%
          );
          pointer-events: none;
        }

        .lang {
          position: fixed;
          top: clamp(14px, 2vw, 22px);
          right: clamp(14px, 2vw, 22px);
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 900;
          border: 0;
          background: #f6f6f6;
          color: #1e1e1e;
          box-shadow: var(--shadow);
          z-index: 2;
          cursor: pointer;
        }

        .text {
          position: relative;
          z-index: 1;
          max-width: min(960px, 92vw);
          margin-left: clamp(20px, 6vw, 120px);
          padding-top: clamp(80px, 12vh, 140px);
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
        }

        .title {
          margin: 0 0 clamp(10px, 1.6vw, 16px);
          line-height: 1.05;
        }
        .script {
          display: block;
          font: 700 clamp(52px, 6.2vw, 86px) "Caveat", cursive;
          color: var(--yellow);
          margin-bottom: 6px;
        }
        .strong {
          display: block;
          font-weight: 900;
          font-size: clamp(34px, 5.2vw, 64px);
        }

        .p {
          margin: 10px 0;
          font-size: clamp(16px, 1.8vw, 20px);
          color: var(--muted);
          max-width: 60ch;
        }

        .email a,
        .email a:visited {
          color: var(--yellow); /* make email link match the button color */
          text-decoration: underline;
        }
        .email a:hover {
          filter: brightness(1.06);
        }

        .legal {
          margin-top: 10px;
          font-size: clamp(13px, 1.4vw, 16px);
          color: rgba(255, 255, 255, 0.85);
        }

        .row {
          margin-top: clamp(14px, 2vw, 22px);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(12px, 1.1vw, 16px) clamp(22px, 2.2vw, 32px);
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          color: #222;
          background: var(--yellow);
          border: 3px solid var(--yellow-border);
          text-decoration: none;
          box-shadow: var(--shadow), inset 0 2px 0 rgba(255, 255, 255, 0.65);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(0, 0, 0, 0.46), inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 900px) {
          .text {
            margin-left: clamp(14px, 5vw, 40px);
            padding-top: clamp(68px, 10vh, 120px);
          }
        }
      `}</style>
    </main>
  );
}
