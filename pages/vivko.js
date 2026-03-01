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
          (navigator &&
            (navigator.maxTouchPoints > 0 ||
              navigator.msMaxTouchPoints > 0)));

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

  const copy = {
    hu: [
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",
        blur: "left",
        phase1:
          "1. forduló: Online kvíz, lezárás 2026. május 29. — 23:59 (HUN)",
        phase2:
          "2. forduló: Online élő verseny, kezdés 2026. május 30. — 18:00 (HUN)",
        phase3:
          "3. Utazás: 2026. július 31. – augusztus 08. (9 nap / 7 éjszaka) New Yorkban, Washington DC-ben és a Niagara-vízesésnél (Kanadai oldal is)",
        sub:
          "A nyertes és az utazótársa egy 9 nap 7 éjszakás utazást nyer New Yorkba, Washington DC-be és a Niagara-vízeséshez, Vivkó és a Grand Slam Travel kíséretében.\n\nAz utazás teljes mértékben megszervezett, így sem tapasztalatra, sem nyelvtudásra nincs szükség. A nyeremény tartalmazza az ESTA ügyintézést, a repülőjegyeket, a transzfereket, a szállodát reggelivel, több nevezetesség belépőjét, egy egynapos Washington DC-i kirándulást és egy egynapos kirándulást a Niagara-vízeséshez. Csak az ebédhez és vacsorához, illetve a költőpénzhez szükséges összeget kell magaddal hoznod.\n\nA rendszer kiválasztja azt a 10 versenyzőt, aki 2026. május 29. 23:59-ig (HUN) a legrövidebb idő alatt, hibátlanul teljesíti a kvízt. Ők jutnak be a 2. fordulóba (az online élő versenyre).\n\nA 10 leggyorsabb versenyző felhasználóneve folyamatosan frissülő eredménytáblán jelenik meg a GrandLucky Travel weboldalán. Az első forduló lezárulta után minden, a kvízt sikeresen teljesítő felhasználónév felkerül a GrandLucky Travel weboldalára vagy aloldalára 2026. május 30-án 16:00-kor (CT) a befejezési időkkel együtt.",
        home: "FŐOLDAL",
        play: "JÁTSZOM!",
      },
    ],
    en: [
      {
        id: "draw",
        bg: "/vivko-ny-4.jpg",
        blur: "left",
        phase1:
          "1st Round: Online trivia, closes May 29, 2026 — 11:59 PM (HUN)",
        phase2:
          "2nd Round: Online Live Contest, starts May 30, 2026 — 18:00 (HUN)",
        phase3:
          "3. Travel: July 31 – August 08, 2026 (9 days 7 nights) in New York, Washington DC and Niagara Falls (Canadian side too)",
        sub:
          "The winner and their travel companion will receive a 9-day, 7-night trip to New York, Washington DC, and Niagara Falls accompanied by Vivko and Grand Slam Travel.\n\nThe trip is fully organized, so no prior experience or language skills are required. The prize includes ESTA processing, flights, transfers, hotel with breakfast, tickets to several attractions, and a one-day trip to Washington DC and a one-day trip to Niagara Falls. You only need to bring your own money for lunch, dinner, and spending money.\n\nThe system will select the 10 contestants who complete the trivia correctly in the shortest time by May 29, 2026 — 11:59 PM (HUN). They will qualify for Round 2 (the live contest).\n\nThe usernames of the 10 fastest contestants will be displayed on the continuously refreshed GrandLucky Travel leaderboard. After the first round closes, all usernames that successfully completed the trivia will be listed on the GrandLucky Travel website or a subsite on May 30, 2026 at 16:00 CT, together with their completion times.",
        home: "HOME",
        play: "ENTER TO THE CONTEST",
      },
    ],
  };

  const slides = copy[lang];
  const S = slides[i];

  return (
    <main className="hero">
      <Head>
        <title>Vivkó – GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg" />

      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      <section className="text">
        <h1 className="title">
          <span className="phase">{S.phase1}</span>
          <span className="phase">{S.phase2}</span>
          <span className="phase">{S.phase3}</span>
        </h1>

        <div className="subwrap">
          <p className="sub">
            {S.sub.split("\n").map((line, k) => (
              <span key={k}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>

        <div className="row">
          <Link href="/" legacyBehavior>
            <a className="btn">{S.home}</a>
          </Link>
          <Link href="/user-agreement" legacyBehavior>
            <a className="btn">{S.play}</a>
          </Link>
        </div>
      </section>
    </main>
  );
}