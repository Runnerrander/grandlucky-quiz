// pages/vivko.js 
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Vivko() {
  const [lang, setLang] = useState("hu");
  const [i, setI] = useState(0); 
  const [uaClass, setUaClass] = useState(""); 

  useEffect(() => {
    const compute = () => {
      const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
      const isAndroid = /Android/i.test(ua);
      const isChrome =
        /Chrome\/\d+/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua);
      const isAndroidChrome = isAndroid && isChrome;

      const touchCapable =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          (navigator && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)));

      const w = typeof window !== "undefined" ? window.innerWidth : 0;
      const tpad = touchCapable && w >= 700 && w <= 1400;

      const classes = [];
      if (tpad) classes.push("tpad");
      if (isAndroidChrome) classes.push("androidchrome");
      setUaClass(classes.join(" "));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ---------- Copy (HU / EN) ----------
  const copy = {
    hu: [
      {
        id: "heart",
        bg: "/vivko-ny-1.jpg",
        blur: "right",
        hScript: "2026 Február",
        hStrongTop: "Vivkóval New Yorkban és Washington DC-ben",
        sub: "Fedezd fel New Yorkot és az Amerikai Egyesült Államok fővárosát, Washington DC-t Vivkóval.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "times",
        bg: "/vivko-ny-2.jpg",
        blur: "left",
        hScript: "Egy kis tudással és gyorsasággal",
        hStrongTop: "New York és Washington DC Vár Rád",
        sub: "Fedezd fel a Times Square varázsát és Washington DC látványosságait Vivkóval.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "bridge",
        bg: "/vivko-ny-3.jpg",
        blur: "left",
        hScript: "Légy Te a Következő Nyertes",
        hStrongTop: "New York és DC Téged Vár",
        sub:
          "Ha Te leszel a kétfordulós, tudásalapú verseny nyertese, Te és az utazótársad felejthetetlen élményeket élhettek át az USA keleti partján egy 8 nap 6 éjszakás utazás keretében. A nevezési díj: $14.99.",
        ui: "prevnext",
        back: "VISSZA",
        next: "TOVÁBB",
      },
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",   // UPDATED
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1. forduló: Online kvíz, lezárás 2025. október 11 — 23:59 (CET)",
        phase2:
          "2. forduló: Online élő verseny, kezdés 2025. október 18 — 18:00 (CET)",
        phase3:
          "3. Utazás: november 27 – december 3 (7 nap/5 éjszaka)",
        sub:
          "Nyertesként Te és egy általad választott kísérő a Grand Slam Travel és a Vivkó Nails kíséretében utazhattok...",
        ui: "cta",
        home: "FŐOLDAL",
        play: "JÁTSZOM!",
      },
    ],
    en: [
      {
        id: "heart",
        bg: "/vivko-ny-1.jpg",
        blur: "right",
        hScript: "February 2026",
        hStrongTop: "In New York and Washington DC with Vivko",
        sub: "Discover New York and the Capital City of the US with Vivko.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "times",
        bg: "/vivko-ny-2.jpg",
        blur: "left",
        hScript: "With a little knowledge and fastness",
        hStrongTop: "New York and Washington DC",
        sub: "Discover the magic of Times Square and the view of the Capital City with Vivko.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "bridge",
        bg: "/vivko-ny-3.jpg",
        blur: "left",
        hScript: "Be the Next Winner",
        hStrongTop: "New York and DC Waiting for You",
        sub:
          "If you are the winner of the two-round, knowledge-based contest, you and your travel companion will enjoy unforgettable experiences on the US East Coast on an 8-day, 6-night trip. Entry fee: $14.99.",
        ui: "prevnext",
        back: "BACK",
        next: "NEXT",
      },
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",   // UPDATED
        blur: "left",
        hScript: "",
        hStrongTop: "",
        phase1:
          "1st Round: Online trivia, closes October 11, 2025 — 11:59 PM (CET)",
        phase2:
          "2nd Round: Online Live Contest, starts October 18, 2025 — 18:00 (CET)",
        phase3:
          "3. Travel: November 27 – December 3 (7 days / 5 nights)",
        sub:
          "As the winner, you and a companion of your choice will travel to the Big Apple...",
        ui: "cta",
        home: "HOME",
        play: "ENTER TO THE CONTEST",
      },
    ],
  };

  const footer = {
    hu: {
      contact: "Ha kérdésed vagy észrevételed van, kérjük, írj nekünk: ",
      rights1: "Minden jog fenntartva – Grandlucky Travel",
      rights2: "3495 US Highway 1 STE34#1217 Princeton, NJ 08540",
      phoneLabel: "Telefon:",
    },
    en: {
      contact: "If you have any questions or concerns please contact us at: ",
      rights1: "All rights reserved to Grandlucky Travel",
      rights2: "3495 US Highway 1 STE34#1217 Princeton, NJ 08540",
      phoneLabel: "Phone:",
    },
  };

  const F = footer[lang];
  const slides = copy[lang];
  const S = slides[i];

  return (
    <main className={`hero s-${S.id} blur-${S.blur} ${uaClass}`}>
      <Head>
        <title>Vivkó – GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Background */}
      <div className="bg" role="img" aria-label={S.id} />

      {/* Language toggle */}
      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      {/* Content */}
      <section className={`text ${S.id === "draw" ? "text-draw" : ""}`}>
        <h1 className="title">
          {S.hScript ? <span className="script">{S.hScript}</span> : null}
          {S.hStrongTop ? <span className="strong">{S.hStrongTop}</span> : null}

          {S.id === "draw" && (S.phase1 || S.phase2 || S.phase3) ? (
            <>
              {S.phase1 ? <span className="phase">{S.phase1}</span> : null}
              {S.phase2 ? <span className="phase">{S.phase2}</span> : null}
              {S.phase3 ? <span className="phase">{S.phase3}</span> : null}
            </>
          ) : null}
        </h1>

        {S.sub && (
          <div className={`subwrap ${S.id === "draw" ? "subwrap-draw" : ""}`}>
            <p className="sub">
              {S.sub.split("\n").map((line, k) => (
                <span key={k}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        )}

        {S.ui === "prevnext" ? (
          <div className="row">
            <button
              className="btn"
              onClick={() => setI((p) => (p > 0 ? p - 1 : p))}
            >
              {S.back}
            </button>
            <button
              className="btn"
              onClick={() =>
                setI((p) => (p < slides.length - 1 ? p + 1 : p))
              }
            >
              {S.next}
            </button>
          </div>
        ) : (
          <div className="row">
            <Link href="/" legacyBehavior>
              <a className="btn">{S.home}</a>
            </Link>
            <Link href="/user-agreement" legacyBehavior>
              <a className="btn">{S.play}</a>
            </Link>
          </div>
        )}
      </section>

      {S.id !== "draw" && (
        <footer className="legal">
          <p className="contact">
            {F.contact}
            <a href="mailto:support@grandluckytravel.com">
              support@grandluckytravel.com
            </a>
            <span> &nbsp;|&nbsp; </span>
            <strong>{F.phoneLabel}</strong>&nbsp;
            <a href="tel:+18553047263">
              +1 855-304-7263
            </a>
          </p>
          <p className="rights">
            <span>{F.rights1}</span>
            <br />
            <span>{F.rights2}</span>
          </p>
        </footer>
      )}

      <style jsx>{`
        /* ALL CSS FROM YOUR ORIGINAL FILE — unchanged */
      `}</style>
    </main>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
