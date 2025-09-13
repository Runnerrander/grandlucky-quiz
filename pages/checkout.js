// pages/checkout.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const BG = "/checkout-designer.jpg"; // must exist in /public

export default function Checkout() {
  const [lang, setLang] = useState("hu");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  // POST /api/checkout -> { url } then redirect to Stripe
  const onPay = async (e) => {
    e.preventDefault();
    if (!accepted || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: lang }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "No URL");
      window.location.href = data.url; // Stripe Checkout
    } catch (err) {
      console.error(err);
      alert("Hoppá! Nem sikerült elindítani a fizetést. / Payment start failed.");
      setBusy(false);
    }
  };

  const copy = {
    hu: {
      title: "Biztonságos fizetés",
      lead: "Fontos — Kérjük, olvasd el!",
      bullets: [
        "A sikeres fizetés után a <strong>Felhasználónevet</strong> és a <strong>Jelszót</strong> a rendszer automatikusan létrehozza. A 2. fordulóban (élő verseny) a hitelesítéshez szükséged lesz a <strong>Felhasználónév + Jelszó</strong> kombinációra.",
        "El tudod menteni vagy ki tudod nyomtatni a <strong>Felhasználónevedet</strong> és a <strong>Jelszavadat</strong>. Az első fordulóban a felhasználóneved automatikusan bekerül a kvízbe, és a rendszer eltárolja a kvíz befejezésének <strong>idejével együtt</strong>.",
        "Minden <strong>nevezés</strong> <strong>új Felhasználónevet és Jelszót</strong> hoz létre.",
        // UPDATED line 4 (HU)
        "Az első fordulóban (online kvíz), ha valaki korábban pontosan ugyanannyi idő alatt teljesítette a kvízt, mint a versenyző, a versenyző két lehetőséget kap. 1. lehetőség: a befejezési időt <strong>+5 másodperccel</strong> növelten nyújtja be; vagy azonnal <strong>új kvízt indíthat</strong> további nevezési díj fizetése nélkül.",
        "Kérjük, a <strong>Felhasználónevet</strong> és a <strong>Jelszót</strong> tartsd biztonságos helyen.",
      ],
      note: "A fizetés a Stripe rendszerén keresztül történik.",
      agree:
        "Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket",
      back: "VISSZA",
      pay: "FIZETÉS — $9.99",
    },
    en: {
      title: "Secure Checkout",
      lead: "Important — Please read",
      bullets: [
        "After successful payment, your <strong>Username</strong> and <strong>Password</strong> are created automatically by the system. You will need the Username and Password Combination at the 2nd. round (live contest) for verification.",
        "You can save or print your Username and Password. At first round your username will be inserted to the quiz automatically and stored in the system with the time the completion of trivia.",
        "Each entry generates a <strong>new Username and Password</strong>.",
        // UPDATED line 4 (EN)
        "In round one (online trivia) if someone completed the trivia under earlier in the exact same time than the contestant, the contestant will get two options. Option 1: The contestant can submit the time of completion with added five second or can enter a new trivia immediately without paying the entry fee again.",
        "Keep your <strong>Username</strong> and <strong>Password</strong> in a safe place.",
      ],
      note: "Payments are processed securely by Stripe.",
      agree: "I have read and accept the Rules and User Agreement",
      back: "BACK",
      pay: "PAY — $9.99",
    },
  };

  const C = copy[lang];

  return (
    <main className="checkout">
      <Head>
        <title>Checkout — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* Language toggle chip */}
      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      {/* Content */}
      <div className="wrap">
        <h1 className="title">{C.title}</h1>
        <h2 className="lead">{C.lead}</h2>

        <ul className="list">
          {C.bullets.map((b, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
          ))}
        </ul>

        <p className="note">{C.note}</p>

        <label className="agree">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span dangerouslySetInnerHTML={{ __html: C.agree }} />
        </label>

        {/* Sticky actions on mobile */}
        <div className="row actions">
          <Link href="/user-agreement" legacyBehavior>
            <a className="btn ghost">{C.back}</a>
          </Link>

          <button className="btn" onClick={onPay} disabled={!accepted || busy}>
            {busy ? "…" : C.pay}
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(:root) {
          --dark: #222;
          --muted: rgba(0, 0, 0, 0.66);
          --yellow: #faaf3b;
          --yellow-border: #e49b28;
        }

        /* Full-screen background; allow scrolling so sticky works */
        .checkout {
          position: relative;
          min-height: 100svh;
          height: auto;
          overflow: visible; /* important for sticky */
          box-sizing: border-box;

          /* space from the top bar */
          padding-top: clamp(80px, 12vh, 140px);

          font-family: "Montserrat", system-ui, sans-serif;
          color: var(--dark);

          background-image: url(${JSON.stringify(BG)});
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }

        .lang {
          position: fixed;
          top: clamp(14px, 2vw, 22px);
          right: clamp(14px, 2vw, 22px);
          z-index: 10;
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 900;
          border: 3px solid var(--yellow-border);
          background: var(--yellow);
          color: var(--dark);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.15),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
          cursor: pointer;
        }

        .wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 clamp(18px, 3.6vw, 36px);
          /* leave room so content never hides behind sticky actions */
          padding-bottom: 110px;
        }

        .title {
          margin: 0 0 8px;
          font-size: clamp(28px, 4.2vw, 46px);
          font-weight: 900;
        }
        .lead {
          margin: 0 0 14px;
          font-size: clamp(18px, 2.2vw, 24px);
          font-weight: 800;
        }
        .list {
          margin: 8px 0 14px;
          padding-left: 20px;
          color: var(--muted);
          font-size: clamp(16px, 1.6vw, 19px);
          line-height: 1.55;
        }
        .list li + li {
          margin-top: 8px;
        }

        .note {
          color: var(--muted);
          font-size: clamp(14px, 1.4vw, 16px);
          margin: 6px 0 12px;
        }

        .agree {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 0 18px;
          font-weight: 700;
        }
        .agree input {
          width: 18px;
          height: 18px;
        }

        .row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Sticky action bar (mobile-first; safe on desktop too) */
        .actions {
          position: sticky;
          bottom: 0;
          z-index: 9;
          padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0));
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.92) 40%,
            #fff 100%
          );
          /* keep the bar inside the content width */
          margin-left: calc(-1 * clamp(18px, 3.6vw, 36px));
          margin-right: calc(-1 * clamp(18px, 3.6vw, 36px));
          padding-left: clamp(18px, 3.6vw, 36px);
          padding-right: clamp(18px, 3.6vw, 36px);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        /* Yellow pill buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(12px, 1.1vw, 16px) clamp(22px, 2.2vw, 32px);
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--dark);
          background: var(--yellow);
          border: 3px solid var(--yellow-border);
          text-decoration: none;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.18),
            inset 0 2px 0 rgba(255, 255, 255, 0.65);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          touch-action: manipulation;
        }
        .btn:hover:not([disabled]) {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(0, 0, 0, 0.24),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }
        .btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn.ghost {
          background: #fff;
          border-color: #e8e8e8;
        }

        @media (max-width: 900px) {
          .checkout {
            padding-top: clamp(70px, 11vh, 120px);
          }
          .row .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
