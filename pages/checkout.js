// pages/checkout.js
import { useState } from "react";
import Head from "next/head";

export default function CheckoutPage() {
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(true); // default checked like your page
  const [error, setError] = useState("");

  async function payWithPayPal() {
    try {
      setError("");
      if (!agree) {
        alert("Kérjük, fogadd el a feltételeket. / Please accept the terms.");
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
        alert("Sajnáljuk, nem sikerült elindítani a PayPal fizetést.");
        setBusy(false);
        return;
      }

      // Redirect user to PayPal
      window.location.href = data.approveURL;
    } catch (e) {
      console.error(e);
      alert("Sajnáljuk, nem sikerült elindítani a PayPal fizetést.");
      setError(String(e));
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <Head>
        <title>Biztonságos fizetés — GrandLuckyTravel</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      {/* doodles */}
      <img className="plane" src="/plane-hero.png" alt="" />
      <img className="passport" src="/leaflet.png" alt="" />
      <img className="camera" src="/camera.png" alt="" />

      <section className="container">
        <h1 className="title">
          <span className="script">Biztonságos fizetés</span>
        </h1>

        <p className="intro">
          <strong>Fontos — Kérjük, olvasd el!</strong>
        </p>

        <ul className="list">
          <li>
            A sikeres fizetés után a <b>Felhasználónevet</b> és a <b>Jelszót</b>{" "}
            a rendszer automatikusan létrehozza, majd a{" "}
            <b>köszönő oldalon</b> megjelenítjük. Kérjük, mentsd el, mert
            szükséged lesz rá a versenyhez.
          </li>
          <li>
            The <b>Username</b> and <b>Password</b> are created automatically
            after payment and will be displayed on the <b>thank-you page</b>.
            Please save them, as you will need them to participate in the
            contest.
          </li>
          <li>
            A fizetés a <b>PayPal</b> rendszerén keresztül történik, biztonságos
            kártyás fizetéssel. / Payment is processed securely via{" "}
            <b>PayPal</b>.
          </li>
        </ul>

        {/* PayPal helper box – HU focus */}
        <div className="paypal-box">
          <p className="paypal-title">Nem szükséges PayPal-fiók!</p>
          <p className="paypal-text">
            A fizetéshez egyszerűen add meg az email címedet a PayPal oldalon,
            majd válaszd a <b>„Kártyával fizetek”</b> vagy{" "}
            <b>„Fizetés vendégként”</b> lehetőséget. Nem kell bejelentkezni és
            nem kell fiókot létrehozni.
          </p>
          <p className="paypal-text">
            <b>Tipp:</b> A PayPal oldalon kapcsold ki az{" "}
            <b>„Adatok mentése és PayPal-számla létrehozása”</b> kapcsolót, ha
            nem szeretnél fiókot — a fizetés így is gond nélkül működik
            bankkártyával.
          </p>
        </div>

        <label className="agree">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            Elolvastam és elfogadom a Szabályokat és a Felhasználói
            Feltételeket. / I’ve read and accept the Rules & Terms.
          </span>
        </label>

        <div className="actions">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            disabled={busy}
            className="btn ghost"
          >
            VISSZA
          </button>

          <button
            type="button"
            onClick={payWithPayPal}
            disabled={busy || !agree}
            className="btn"
          >
            {busy ? "Folyamatban…" : "Fizetek"}
          </button>
        </div>

        {error ? <p className="error">{error}</p> : null}
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
