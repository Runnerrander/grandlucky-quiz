// pages/cancel.js
import Head from "next/head";
import Link from "next/link";
import { useState, useMemo } from "react";

const BG_CANCEL = "/BG-sikeres fizetes-grafikaval.png"; // reuse; swap if you get a dedicated cancel bg

export default function Cancel() {
  const [lang, setLang] = useState("hu");

  const copy = useMemo(
    () => ({
      hu: {
        title: "Fizetés megszakítva",
        lead: "A tranzakciót nem fejezted be.",
        tips: [
          "Ellenőrizd a kártyaadataidat és próbáld újra.",
          "Ha gond adódott, kérjük, próbáld meg később vagy használj másik kártyát.",
        ],
        backToCheckout: "VISSZA A FIZETÉSHEZ",
        home: "FŐOLDAL",
        switchLang: "ANGOL",
      },
      en: {
        title: "Payment Canceled",
        lead: "You didn’t complete the transaction.",
        tips: [
          "Please double-check your card details and try again.",
          "If there was an issue, try again later or use a different card.",
        ],
        backToCheckout: "BACK TO CHECKOUT",
        home: "HOME",
        switchLang: "MAGYAR",
      },
    }),
    []
  )[lang];

  return (
    <main className="screen">
      <Head>
        <title>Payment Canceled — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      <button className="lang" onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}>
        {copy.switchLang}
      </button>

      <div className="wrap">
        <h1 className="title">{copy.title}</h1>
        <h2 className="lead">{copy.lead}</h2>

        <ul className="tips">
          {copy.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <div className="buttons">
          <Link href="/checkout" legacyBehavior>
            <a className="btn">{copy.backToCheckout}</a>
          </Link>
          <Link href="/" legacyBehavior>
            <a className="btn">{copy.home}</a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        :global(:root){
          --fg:#fff; --muted:rgba(255,255,255,.86);
          --yellow:#faaf3b; --yellow-border:#e49b28;
          --chip:#f6f6f6; --chip-text:#1e1e1e; --shadow:0 12px 28px rgba(0,0,0,.32);
        }
        .screen{
          height:100svh; overflow:hidden; color:var(--fg);
          font-family:Montserrat,system-ui,sans-serif;
          background:url(${JSON.stringify(BG_CANCEL)}) center/cover no-repeat #2f2f2f;
          padding-top:clamp(70px,10vh,120px);
        }
        .lang{
          position:fixed; top:clamp(14px,2vw,22px); right:clamp(14px,2vw,22px);
          padding:12px 22px; border-radius:999px; font-weight:900; border:0;
          background:var(--chip); color:var(--chip-text); box-shadow:var(--shadow); cursor:pointer;
        }
        .wrap{ max-width:720px; margin-left:clamp(20px,6vw,120px); padding:0 clamp(16px,3vw,24px); text-shadow:0 1px 0 rgba(0,0,0,.45); }
        .title{ margin:0 0 6px; font-size:clamp(34px,4.6vw,56px); font-weight:900; }
        .lead{ margin:0 0 16px; font-size:clamp(18px,2.2vw,24px); font-weight:800; color:var(--muted); }
        .tips{ margin:10px 0 22px; padding-left:20px; color:var(--muted); font-size:clamp(16px,1.8vw,20px); line-height:1.55; }
        .tips li + li { margin-top:6px; }
        .buttons{ display:flex; gap:14px; flex-wrap:wrap; }
        .btn{
          display:inline-flex; align-items:center; justify-content:center;
          padding:16px 22px; border-radius:999px; font-weight:900; text-transform:uppercase;
          color:#222; background:var(--yellow); border:3px solid var(--yellow-border);
          text-decoration:none; box-shadow:var(--shadow), inset 0 2px 0 rgba(255,255,255,.65);
          transition:transform .2s, box-shadow .2s; cursor:pointer;
        }
        .btn:hover{ transform:translateY(-2px); box-shadow:0 22px 36px rgba(0,0,0,.46), inset 0 2px 0 rgba(255,255,255,.7); }
        @media (max-width:900px){
          .screen{ padding-top:clamp(60px,9vh,100px); }
          .wrap{ margin-left:clamp(14px,5vw,40px); }
        }
      `}</style>
    </main>
  );
}
