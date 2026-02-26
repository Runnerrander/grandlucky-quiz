// pages/user-agreement.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function UserAgreement() {
  const router = useRouter();
  const [lang, setLang] = useState("hu");
  const [agree, setAgree] = useState(false);

  const t = {
    hu: {
      langBtn: "ANGOL",
      titleScript: "Szabályok és Felhasználói Feltételek",
      rulesH: "Szabályok",
      rules: [
        "A regisztrációhoz legalább 18 évesnek kell lenned.",
        "Nem lehetsz a GrandLucky Travel, a Vivko vagy a Grand Slam Travel családtagja.",

        "Nevezési díj: $24.99 (USD). A nevezési díj egy sikeres fizetéshez egy (1) hivatalos részvételt biztosít.",

        "A kvalifikáció (1. forduló) online kvíz formájában zajlik. A kvalifikáció vége: 2026. május 29. 23:59 (magyar idő szerint). A kvalifikáció során a leggyorsabb 10 versenyző kerül be a 2. fordulóba (az élő döntőbe). A Top 10 lista folyamatosan frissül a határidőig — még bárki átveheti a Top 10-ben szereplők helyét.",

        "A 2. forduló (ÉLŐ döntő) időpontja: 2026. május 30. — 18:00 (magyar idő szerint).",

        "ÚJDONSÁG: az utazás része egy egynapos Niagara-vízesés kirándulás is, amely során a kanadai oldalra történő átlépés útlevél/engedély és aktuális határszabályok függvénye.",

        // ★★★ Rule (HU) — passport / ESTA / visa process ★★★
        "Amennyiben a verseny nyertese és kísérője nem rendelkezik érvényes útlevéllel, ESTA-val vagy turista vízummal, kötelesek az igénylési folyamatot a 2. forduló élő versenyét követő első munkanapon megkezdeni (a Grand Slam Travel segítséget nyújt az igénylésben).",

        "A Grand Slam Travel, a Vivko és a GrandLucky Travel nem felelős, ha a verseny nyertese vagy kísérője ESTA/VÍZUM igénylése elutasításra kerül. Ilyen esetben a soron következő helyezett kap lehetőséget.",
        "Az Egyesült Államokban tartózkodás során a nyertesnek és kísérőjének be kell tartania az Egyesült Államok törvényeit és szabályait.",
        "A verseny második fordulója élőben közvetített esemény lesz különböző digitális platformokon. A versenyzők vállalják, hogy részt vesznek ezen az élő eseményen.",
        "Médiahozzájárulás: a nyertes és kísérője hozzájárul, hogy a hitelesítésről és az utazásról készült fotók/videók megjelenjenek a Vivko és a Grand Slam Travel közösségi média felületein, valamint a GrandLucky Travel weboldalán.",

        // ★★★ Zoom verification rule (HU) — kept, with updated wording clarity ★★★
        "A 2. forduló élő versenyéhez való csatlakozás határideje: a versenyzőnek a 2. forduló élő eseménye előtt 30 perccel be kell jelentkeznie a Zoom platformra a hitelesítési folyamat elvégzéséhez; ellenkező esetben egy másik, a kvalifikációt sikeresen teljesítő versenyző kap lehetőséget a részvételre. A versenyzők egy várakozó chat szobába kerülnek, ahol a hitelesítés megtörténik.",
      ],
      note:
        "Megjegyzés: Kérjük, győződj meg róla a fenti Zoom linken, hogy a Zoom telepítve van az eszközödre a hitelesítési folyamat előtt.",
      termsH: "Felhasználói Feltételek",
      privacy:
        "Adatvédelmi nyilatkozat: A regisztráció során nem gyűjtünk és nem tárolunk semmilyen személyes adatot. Csak a nyertes és utazótársa adatait rögzíti a Grand Slam Travel személyes egyeztetések céljából, kizárólag a foglalások, az ESTA/VÍZUM igénylés, valamint az utazás ügyintézése céljából.",
      paymentsA:
        "Fizetés feldolgozása: Minden fizetés biztonságosan a PayPal rendszerén keresztül történik. Kérjük, tekintsd meg a PayPal hivatalos weboldalán az ",
      paymentsB: "Adatvédelmi nyilatkozatot",
      paymentsC: " és a ",
      paymentsD: "Felhasználói megállapodást",

      refund:
        "Visszatérítési szabályzat: A nevezési díj normál körülmények között nem visszatéríthető. Amennyiben bármilyen előre nem látható okból a GrandLucky Travel versenye vagy az utazás megrendezésére vagy teljesítésére nem kerülhet sor, minden fizető résztvevő teljes visszatérítést kap 14 napon belül, a hivatalos lemondási bejelentéstől számítva. Nem jár visszatérítés abban az esetben, ha a versenyző vagy kísérője személyes okok miatt, illetve az utazáshoz vagy hitelesítéshez szükséges feltételek elmulasztása miatt nem tud részt venni az utazáson, vagy ha emiatt a GrandLucky Travel már nem tud egy másik jogosult versenyzőt és kísérőjét időben felkészíteni az utazásra.",

      agreeLbl:
        "Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket",
      back: "VISSZA",
      next: "TOVÁBB A FIZETÉSHEZ",
    },

    en: {
      langBtn: "MAGYAR",
      titleScript: "Rules & Terms of Use",
      rulesH: "Rules",
      rules: [
        "You must be at least 18 years old to register.",
        "You cannot be a family member of GrandLucky Travel, Vivko, or Grand Slam Travel.",

        "Entry fee: $24.99 (USD). One successful payment provides one (1) official entry.",

        "Round 1 (Qualification) is an online trivia quiz. Qualification closes: May 29, 2026 — 23:59 (Hungary time). The fastest 10 contestants qualify for Round 2 (the LIVE Final). The Top 10 list updates continuously until the deadline — anyone can still take a spot in the Top 10.",

        "Round 2 (LIVE Final) date/time: May 30, 2026 — 18:00 (Hungary time).",

        "NEW: The trip includes a one-day Niagara Falls experience. Crossing into Canada depends on passport/authorization and current border regulations.",

        // ★★★ Rule (EN) — passport / ESTA / visa process ★★★
        "If the winner and their companion do not already have a valid passport, ESTA, or tourist visa, they must start the application process (Grand Slam Travel assists with the application) on the first workday after the live contest day.",

        "Grand Slam Travel, Vivko, and GrandLucky Travel are not responsible if the contest winner’s or companion’s ESTA/VISA is denied. In such a case, the next eligible contestant will be offered the opportunity.",
        "While in the United States, the winner and companion must follow all US laws and regulations.",
        "The second round of the contest will be a live-streamed event on various digital platforms. Contestants agree to attend this live event.",
        "Media consent: the Winner and companion consent that photos/videos from verification and the trip may be shared on Vivko’s and Grand Slam Travel’s social media and the GrandLucky Travel webpage.",

        "Deadline to enter Round 2 LIVE Final: a contestant must sign in to the Zoom platform 30 minutes before the Round 2 live contest event starts for a verification process; otherwise another contestant who successfully completed qualification may be offered a chance to compete. Contestants will be placed in a waiting chat room where the verification takes place.",
      ],
      note:
        "Note: Please ensure Zoom is installed on your device via the link above before verification.",
      termsH: "Terms of Use",
      privacy:
        "Privacy notice: We do not collect or store personal data at registration. Only the winner’s and companion’s data are recorded by Grand Slam Travel for travel arrangements, bookings, ESTA/VISA processing and trip administration.",
      paymentsA:
        "Payments: All payments are processed securely by PayPal. Please review PayPal’s ",
      paymentsB: "Privacy Statement",
      paymentsC: " and ",
      paymentsD: "User Agreement",

      refund:
        "Refund policy: The entry fee is non-refundable under normal circumstances. However, if for any unexpected reason the GrandLucky Travel contest or the trip cannot be held or fulfilled, all participants who paid the entry fee will receive a full refund within 14 days from the official cancellation announcement. No refund will be issued if a contestant or their companion is unable to travel due to personal circumstances, failure to meet the required travel or verification conditions, or if GrandLucky Travel cannot prepare another eligible contestant and companion in time as a result of such circumstances.",

      agreeLbl: "I’ve read and accept the Rules and Terms of Use",
      back: "BACK",
      next: "PROCEED TO PAYMENT",
    },
  };

  const c = t[lang];

  const privacyHref =
    lang === "hu"
      ? "https://www.paypal.com/hu/legalhub/paypal/privacy-full"
      : "https://www.paypal.com/hu/legalhub/paypal/privacy-full?locale.x=en_HU";

  const termsHref =
    lang === "hu"
      ? "https://www.paypal.com/hu/legalhub/paypal/useragreement-full"
      : "https://www.paypal.com/hu/legalhub/paypal/useragreement-full?locale.x=en_HU";

  return (
    <main className="wrap">
      <Head>
        <title>GrandLuckyTravel — {c.titleScript}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* language chip */}
      <button
        className="lang"
        onClick={() => setLang(lang === "hu" ? "en" : "hu")}
      >
        {c.langBtn}
      </button>

      {/* doodles */}
      <img className="plane" src="/plane-hero.png" alt="" />
      <img className="passport" src="/leaflet.png" alt="" />
      <img className="camera" src="/camera.png" alt="" />

      <section className="container">
        <h1 className="title">
          <span className="script">{c.titleScript}</span>
        </h1>

        <h2 className="h2">{c.rulesH}</h2>
        <ol className="list">
          {c.rules.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>

        <p className="note">
          {c.note.replace("Zoom", "")}
          <a
            href="https://zoom.us/download"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            Zoom
          </a>
          .
        </p>

        <h2 className="h2">{c.termsH}</h2>
        <p className="p">{c.privacy}</p>

        <p className="p">
          {c.paymentsA}
          <a
            href={privacyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {c.paymentsB}
          </a>
          {c.paymentsC}
          <a
            href={termsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {c.paymentsD}
          </a>
          .
        </p>

        <p className="p">{c.refund}</p>

        <label className="agree">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>{c.agreeLbl}</span>
        </label>

        <div className="actions">
          <Link href="/vivko" legacyBehavior>
            <a className="btn ghost">{c.back}</a>
          </Link>

          <button
            className="btn"
            disabled={!agree}
            onClick={() => router.push("/checkout")}
          >
            {c.next}
          </button>
        </div>
      </section>

      <style jsx>{`
        :global(html),
        :global(body) {
          height: auto !important;
          overflow-y: auto !important;
        }

        .wrap {
          min-height: 100dvh;
          background: #f6a83b;
          font-family: "Montserrat", system-ui, sans-serif;
          color: #222;
          position: relative;
          overflow-x: hidden;
        }

        .lang {
          position: fixed;
          top: clamp(14px, 2.2vw, 24px);
          right: clamp(14px, 2.2vw, 24px);
          z-index: 10;
          background: #ffdca7;
          border: 3px solid #e79a2f;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 900;
        }

        .container {
          width: min(1120px, 92vw);
          margin: clamp(24px, 6vw, 80px) auto;
        }

        .title {
          margin: 0 0 10px;
        }

        .script {
          font: 700 clamp(40px, 5.2vw, 56px) "Caveat", cursive;
          color: #fff;
          text-shadow: 0 2px 0 rgba(0, 0, 0, 0.18);
        }

        .h2 {
          margin: 14px 0 10px;
          font-weight: 900;
          font-size: clamp(20px, 2.2vw, 26px);
        }

        .list {
          margin: 0 0 10px 1.2rem;
          padding: 0;
          display: grid;
          gap: 6px;
          font-size: clamp(16px, 1.6vw, 18px);
          color: rgba(0, 0, 0, 0.76);
        }

        .note {
          margin: 6px 0 18px;
          font-style: italic;
          color: rgba(0, 0, 0, 0.76);
        }

        .p {
          margin: 6px 0;
          font-size: clamp(16px, 1.6vw, 18px);
          color: rgba(0, 0, 0, 0.76);
          line-height: 1.55;
        }

        .agree {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          font-weight: 700;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .btn {
          border: 3px solid #e79a2f;
          background: #ffdca7;
          border-radius: 999px;
          font-weight: 900;
          padding: 14px 22px;
        }

        .btn.ghost {
          background: #fff;
          border-color: #e8e8e8;
        }

        .plane,
        .passport,
        .camera {
          position: absolute;
          pointer-events: none;
          filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.12));
        }

        .plane {
          top: clamp(78px, 9vw, 120px);
          right: clamp(36px, 7vw, 100px);
          width: clamp(180px, 18vw, 260px);
        }

        .passport {
          right: clamp(200px, 18vw, 330px);
          bottom: clamp(54px, 6vw, 84px);
          width: clamp(90px, 9vw, 140px);
          transform: rotate(18deg);
        }

        .camera {
          right: clamp(44px, 6vw, 84px);
          bottom: clamp(36px, 6vw, 84px);
          width: clamp(120px, 12vw, 180px);
          transform: rotate(8deg);
        }

        @media (max-width: 900px) {
          .passport,
          .camera {
            display: none;
          }
          .container {
            margin: 18px auto;
            width: calc(100vw - 28px);
          }
          .actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}