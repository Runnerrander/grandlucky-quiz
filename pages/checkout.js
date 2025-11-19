// pages/checkout.js
import { useState } from "react";
import Head from "next/head";

export default function CheckoutPage() {
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(true); // default checked
  const [error, setError] = useState("");
  const [lang, setLang] = useState("hu"); // HU default

  const copy = {
    hu: {
      headTitle: "Biztonságos fizetés — GrandLuckyTravel",
      langBtn: "ANGOL",
      titleScript: "Biztonságos fizetés",
      introStrong: "Fontos — Kérjük, olvasd el!",
      bullets: [
        "A sikeres fizetés után a Felhasználónevet és a Jelszót a rendszer automatikusan létrehozza, majd a fizetés utáni összegző oldalon megjelenítjük. Kérjük, mentsd el vagy nyomtasd ki, mert szükséged lesz rá a versenyhez.",
        "A felhasználónév és jelszó nélkül nem tudsz részt venni a tudásalapú versenyben, ezért kérjük, őrizd meg ezeket az adatokat.",
        "A fizetés a PayPal rendszerén keresztül történik, biztonságos bankkártyás fizetéssel.",
      ],
      paypalBoxTitle: "Nem szükséges PayPal-fiók!",
      paypalBoxLines: [
        "A fizetéshez a PayPal oldalán biztonságosan megadhatod bankkártya-adataidat. A legtöbb esetben választható a „Kártyával fizetek” vagy „Fizetés vendégként” lehetőség, így nem szükséges PayPal-fiókot létrehozni.",
        "Fontos: a „Kártyával fizetek / Fizetés vendégként” gombot a PayPal rendszere automatikusan jeleníti meg. Előfordulhat, hogy egyes felhasználóknál nem látható, például ha a böngészőben korábban be voltál lépve PayPalra, ha a megadott email címhez már tartozik PayPal-fiók, vagy ha a tranzakciót a rendszer nagyobb kockázatúnak ítéli meg.",
        "Ilyen ritka esetekben a PayPal megkövetelheti a bejelentkezést vagy egy PayPal-fiók létrehozását. Dönthetsz úgy, hogy belépsz egy meglévő fiókkal vagy újat hozol létre, és a sikeres fizetés után ugyanúgy megkapod a felhasználónevedet és jelszavadat a GrandLucky Travel összegző oldalán. Ha nem szeretnél fiókot, megpróbálhatod a fizetést egy másik böngészőben vagy eszközön, ahol megjelenhet a vendégfizetés opció. Ha kérdésed van vagy bizonytalan vagy a fizetéssel kapcsolatban, kérjük, írj nekünk a support@grandluckytravel.com címre, és segítünk.",
      ],
      agreeLabel:
        "Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket.",
      back: "VISSZA",
      pay: "Fizetek",
      payBusy: "Folyamatban…",
      alertTerms: "Kérjük, fogadd el a feltételeket.",
      errorPrefix: "Hiba: ",
    },
    en: {
      headTitle: "Secure Payment — GrandLuckyTravel",
      langBtn: "MAGYAR",
      titleScript: "Secure Payment",
      introStrong: "Important — Please read before paying!",
      bullets: [
        "After a successful payment, your Username and Password will be created automatically by the system and displayed on the thank-you page. Please save or print them, as you will need them to participate in the contest.",
        "Without your username and password, you will not be able to join the knowledge-based contest, so please keep these details safe.",
        "Payment is processed securely via PayPal using your debit or credit card.",
      ],
      paypalBoxTitle: "No PayPal account required",
      paypalBoxLines: [
        "On the PayPal page you can enter your card details and pay securely. In most cases you will see a “Pay with Debit or Credit Card / Checkout as Guest” option, so you don’t need to create a PayPal account.",
        "Please note: whether you see this guest button is decided automatically by PayPal. Sometimes it will not appear – for example if there was a previous PayPal login in your browser, if the email address you enter is already linked to a PayPal account, or if PayPal flags the transaction as higher-risk.",
        "In those rare cases PayPal may require you to log in or create a PayPal account before completing the payment. You can choose to log in with an existing account or create a new one; after a successful payment you will still receive your username and password on the GrandLucky Travel summary page. If you prefer not to create an account, you can try again in a different browser or device where the guest card payment option may appear. If you have any questions or concerns about the payment, please contact us at support@grandluckytravel.com and we’ll be happy to help.",
      ],
      agreeLabel: "I’ve read and accept the Rules and Terms of Use.",
      back: "BACK",
      pay: "Pay Now",
      payBusy: "Processing…",
      alertTerms: "Please accept the terms.",
      errorPrefix: "Error: ",
    },
  };

  const c = copy[lang];

  async function payWithPayPal() {
    try {
      setError("");
      if (!agree) {
        alert(
          c.alertTerms +
            " / " +
            copy[lang === "hu" ? "en" : "hu"].alertTerms
        );
        return;
      }
      setBusy(true);

      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok || !data?.approveURL) {
        console.error("create error:", data);
        alert(
          lang === "hu"
            ? "Sajnáljuk, nem sikerült elindítani a PayPal fizetést."
            : "Sorry, we could not start the PayPal payment."
        );
        setBusy(false);
        return;
      }

      window.location.href = data.approveURL;
    } catch (e) {
      console.error(e);
      alert(
        lang === "hu"
          ? "Sajnáljuk, nem sikerült elindítani a PayPal fizetést."
          : "Sorry, we could not start the PayPal payment."
      );
      setError(String(e));
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <Head>
        <title>{c.headTitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* language chip */}
      <button
        className="lang"
        onClick={() => setLang((prev) => (prev === "hu" ? "en" : "hu"))}
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

        <p className="intro">
          <strong>{c.introStrong}</strong>
        </p>

        <ul className="list">
          {c.bullets.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        {/* PayPal helper box */}
        <div className="paypal-box">
          <p className="paypal-title">{c.paypalBoxTitle}</p>
          {c.paypalBoxLines.map((line, idx) => (
            <p className="paypal-text" key={idx}>
              {line}
            </p>
          ))}
        </div>

        <label className="agree">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>{c.agreeLabel}</span>
        </label>

        <div className="actions">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            disabled={busy}
            className="btn ghost"
          >
            {c.back}
          </button>

          <button
            type="button"
            onClick={payWithPayPal}
            disabled={busy || !agree}
            className="btn"
          >
            {busy ? c.payBusy : c.pay}
          </button>
        </div>

        {error ? (
          <p className="error">
            {c.errorPrefix}
            {error}
          </p>
        ) : null}
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
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12),
            inset 0 2px 0 rgba(255, 255, 255, 0.4);
        }

        .container {
          width: min(720px, 92vw);
          margin: clamp(24px, 6vw, 80px) auto;
          background: #fffaf1;
          border-radius: 18px;
          padding: clamp(18px, 3vw, 28px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
          position: relative;
          z-index: 2;
        }

        .title {
          margin: 0 0 10px;
        }

        .script {
          font: 700 clamp(40px, 4.6vw, 52px) "Caveat", cursive;
          color: #222;
          text-shadow: 0 2px 0 rgba(255, 255, 255, 0.4);
        }

        .intro {
          margin: 4px 0 10px;
          font-size: clamp(16px, 1.6vw, 18px);
        }

        .list {
          margin: 0 0 16px 1.2rem;
          padding: 0;
          display: grid;
          gap: 8px;
          font-size: clamp(15px, 1.6vw, 17px);
          color: rgba(0, 0, 0, 0.78);
        }

        .list li {
          padding-left: 4px;
          line-height: 1.5;
        }

        .paypal-box {
          margin: 14px 0 16px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #ffe9c4;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f1c27a;
        }

        .paypal-title {
          margin: 0 0 6px;
          font-weight: 900;
          font-size: clamp(15px, 1.6vw, 17px);
        }

        .paypal-text {
          margin: 4px 0;
          font-size: clamp(14px, 1.5vw, 16px);
          line-height: 1.5;
          color: rgba(0, 0, 0, 0.82);
        }

        .agree {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-weight: 700;
          font-size: clamp(14px, 1.5vw, 16px);
        }

        .agree input {
          margin-top: 3px;
          width: 18px;
          height: 18px;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .btn {
          appearance: none;
          border: 3px solid #e79a2f;
          background: #ffdca7;
          color: #222;
          font-weight: 900;
          border-radius: 999px;
          padding: 12px 22px;
          text-transform: uppercase;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.16),
            inset 0 2px 0 rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: clamp(13px, 1.2vw, 14px);
        }

        .btn.ghost {
          background: #fff;
          border-color: #e8e8e8;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .error {
          margin-top: 10px;
          color: #b00020;
          font-size: 14px;
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
          z-index: 1;
        }

        .passport {
          right: clamp(200px, 18vw, 330px);
          bottom: clamp(54px, 6vw, 84px);
          width: clamp(90px, 9vw, 140px);
          transform: rotate(18deg);
          z-index: 1;
        }

        .camera {
          right: clamp(44px, 6vw, 84px);
          bottom: clamp(36px, 6vw, 84px);
          width: clamp(120px, 12vw, 180px);
          transform: rotate(8deg);
          z-index: 1;
        }

        @media (max-width: 900px) {
          .passport,
          .camera {
            display: none;
          }
          .container {
            width: calc(100vw - 28px);
            margin: 18px auto 24px;
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
