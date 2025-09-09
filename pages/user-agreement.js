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
        // 2 — UPDATED (mirror)
        "Nem lehetsz a GrandLucky Travel, a Vivko vagy a Grand Slam Travel családtagja.",
        // 3 — UPDATED (mirror)
        "A verseny nyertese és kísérője köteles ESTA-t vagy turista vízumot igényelni (a Grand Slam Travel segítséget nyújt az igénylésben).",
        // 4 — UPDATED (mirror to 'next place')
        "A Grand Slam Travel, a Vivko és a GrandLucky Travel nem felelős, ha a verseny nyertese vagy kísérője ESTA/VÍZUM igénylése elutasításra kerül. Ilyen esetben a soron következő helyezett utazik.",
        // 5 — UPDATED (mirror)
        "Az Egyesült Államokban tartózkodás során a nyertesnek és kísérőjének be kell tartania az Egyesült Államok törvényeit és szabályait.",
        // 6 — UPDATED (mirror)
        "A verseny második fordulója élőben közvetített esemény lesz különböző digitális platformokon. A versenyzők vállalják, hogy részt vesznek ezen az élő eseményen.",
        // 7 — UPDATED (mirror)
        "Médiahozzájárulás: a nyertes és kísérője hozzájárul, hogy a hitelesítésről és az utazásról készült fotók/videók megjelenjenek a Vivko és a Grand Slam Travel közösségi média felületein, valamint a GrandLucky Travel weboldalán.",
        // 8 — UPDATED (mirror)
        "Határidő a 2. forduló élő versenyéhez való csatlakozáshoz: a verseny kezdete után 5 perc áll rendelkezésre a csatlakozásra; ellenkező esetben egy másik, az első fordulót teljesítő versenyző kap lehetőséget. A 2. forduló versenyzői a Zoom digitális platformon keresztül csatlakoznak.",
      ],
      note:
        "Megjegyzés: Kérjük, győződj meg róla a fenti Zoom linken, hogy a Zoom telepítve van az eszközödre a hitelesítési folyamat előtt.",
      termsH: "Felhasználói Feltételek",
      privacy:
        "Adatvédelmi nyilatkozat: A regisztráció során nem gyűjtünk és nem tárolunk semmilyen személyes adatot. Csak a nyertes és utazótársa adatait rögzíti a Grand Slam Travel személyes egyeztetések céljából, kizárólag a foglalások, az ESTA/VÍZUM igénylés, valamint az utazás ügyintézése céljából.",
      paymentsA:
        "Fizetés feldolgozása: Minden fizetés biztonságosan, a Stripe rendszerén keresztül történik. Kérjük, tekintsd meg a Stripe hivatalos weboldalán az ",
      paymentsB: "Adatvédelmi nyilatkozatot",
      paymentsC: " és a ",
      paymentsD: "Felhasználói feltételeket",
      // REFUND — UPDATED wording
      refund:
        "Visszatérítési szabályzat: A nevezési díj semmilyen körülmények között nem visszatéríthető.",
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
        // 2 — UPDATED
        "You cannot be a family member of GrandLucky Travel, Vivko, or Grand Slam Travel.",
        // 3 — UPDATED
        "The winner of the contest and their companion must obtain an ESTA or tourist visa (Grand Slam Travel assists with the application).",
        // 4 — UPDATED to 'next place winner'
        "Grand Slam Travel, Vivko, and GrandLucky Travel are not responsible if the contest winner’s or companion’s ESTA/VISA is denied. In such a case, the next place winner will travel.",
        // 5 — UPDATED
        "While in the United States, the winner and companion must follow all US laws and regulations.",
        // 6 — UPDATED
        "The second round of the contest will be a live-streamed event on various digital platforms. Contestants agree to attend this live event.",
        // 7 — UPDATED
        "Media consent: the Winner and companion consent that photos/videos from verification and the trip may be shared on Vivko’s and Grand Slam Travel’s social media and the GrandLucky Travel webpage.",
        // 8 — UPDATED
        "Deadline to enter Round 2 Live contest: a contestant has 5 minutes to join the Round 2 live contest after the event starts; otherwise another contestant who completed the first round will get a chance to compete. Contestants for the 2nd round will join the contest on the Zoom digital platform.",
      ],
      note:
        "Note: Please ensure Zoom is installed on your device via the link above before verification.",
      termsH: "Terms of Use",
      privacy:
        "Privacy notice: We do not collect or store personal data at registration. Only the winner’s and companion’s data are recorded by Grand Slam Travel for travel arrangements, bookings, ESTA/VISA processing and trip administration.",
      paymentsA:
        "Payments: All payments are processed securely by Stripe. Please review Stripe’s ",
      paymentsB: "Privacy Policy",
      paymentsC: " and ",
      paymentsD: "Terms of Service",
      refund: "Refund policy: The entry fee is non-refundable in all cases.",
      agreeLbl: "I’ve read and accept the Rules and Terms of Use",
      back: "BACK",
      next: "PROCEED TO PAYMENT",
    },
  };

  const c = t[lang];

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
      <button className="lang" onClick={() => setLang(lang === "hu" ? "en" : "hu")}>
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
            rel="noreferrer"
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
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            {c.paymentsB}
          </a>
          {c.paymentsC}
          <a
            href="https://stripe.com/terms"
            target="_blank"
            rel="noreferrer"
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
        :global(:root) {
          --paper: #f6a83b;
          --paper-deep: #e79a2f;
          --ink: #222;
          --muted: rgba(0, 0, 0, 0.76);
          --chip: #fff;
          --chip-border: #e8e8e8;
        }

        .wrap {
          min-height: 100dvh;
          background: var(--paper);
          font-family: "Montserrat", system-ui, sans-serif;
          color: var(--ink);
          position: relative;
          overflow-x: hidden;
        }

        /* language */
        .lang {
          position: fixed;
          top: clamp(14px, 2.2vw, 24px);
          right: clamp(14px, 2.2vw, 24px);
          z-index: 4;
          background: #ffdca7;
          border: 3px solid var(--paper-deep);
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 900;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), inset 0 2px 0 #fff6;
        }

        .container {
          width: min(1120px, 92vw);
          margin: clamp(24px, 6vw, 80px) auto;
        }

        .title {
          margin: 0 0 10px;
        }
        .script {
          display: inline-block;
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
          color: var(--muted);
        }
        .list li {
          padding-left: 6px;
          line-height: 1.45;
        }

        .note {
          margin: 6px 0 18px;
          font-style: italic;
          color: var(--muted);
          font-size: clamp(14px, 1.4vw, 16px);
        }

        .p {
          margin: 6px 0;
          color: var(--muted);
          font-size: clamp(16px, 1.6vw, 18px);
          line-height: 1.55;
        }
        .link {
          color: #1a1a1a;
          font-weight: 800;
          text-decoration: underline;
        }

        .agree {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-weight: 700;
        }
        .agree input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .btn {
          appearance: none;
          border: 3px solid var(--paper-deep);
          background: #ffdca7;
          color: var(--ink);
          font-weight: 900;
          border-radius: 999px;
          padding: 14px 22px;
          text-transform: uppercase;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.16), inset 0 2px 0 #fff6;
        }
        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .btn.ghost {
          background: #fff;
          border-color: var(--chip-border);
        }

        /* doodles */
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
          .script {
            color: #222;
            text-shadow: none;
          }
          .plane {
            width: 160px;
            right: 16px;
            top: 16px;
          }
          .passport,
          .camera {
            display: none;
          }
          .container {
            width: calc(100vw - 28px);
            margin: 18px auto;
          }
          .actions .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
