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
      subTop: "Fedezd fel New Yorkot és Washington DC-t",
      subBottom: "Vivkóval februárban!",
      cta: "KATTINTS A RÉSZLETEKÉRT!",
      tagTop: "Egy kis tudással és gyorsasággal",
      tagBottom: "egy ebéd áráért velünk utazhatsz! $14.99",
      href: "/weekly",
    },
    en: {
      script: "Welcome",
      strongTop: "to\u00A0GrandLuckyTravel",
      strongBottom: "website!",
      subTop: "Explore New York and Washington DC",
      subBottom: "with Vivko in February!",
      cta: "CLICK FOR DETAILS",
      tagTop: "With a little knowledge and speed",
      tagBottom: "you can travel with us for the price of a lunch! $14.99",
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

          <p className="tagline">
            <span className="block">{c.tagTop}</span>
            <span className="block">{c.tagBottom}</span>
          </p>
        </div>

        <img className="decor camera" src="/camera.png" alt="" />
      </div>

      {/* styles unchanged — keep your original styling block exactly as before */}