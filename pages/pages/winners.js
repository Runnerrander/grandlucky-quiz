// pages/winners.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WinnersPage() {
  const [lang, setLang] = useState("hu");

  const t = {
    hu: {
      title: "Előző nyertesünk",
      sub: "Gratulálunk Napsugárnak Budapestről!",
      para1:
        "Napsugár a GrandLuckyTravel előző játékának nyertese. Párjával Vivkóval fedezik fel New York adventi hangulatát.",
      para2:
        "Most indul az új forduló: részletek a következő oldalon.",
      cta: "Tovább a részletekhez",
      back: "Vissza",
    },
    en: {
      title: "Our Previous Winner",
      sub: "Congratulations to Napsugár from Budapest!",
      para1:
        "Napsugár is the winner of the previous GrandLuckyTravel contest. She and her boyfriend will explore New York’s Advent season with Vivko.",
      para2:
        "The new round is starting—see details on the next page.",
      cta: "Continue to Details",
      back: "Back",
    },
  };
  const c = t[lang];

  return (
    <main className="wrap">
      <Head>
        <title>GrandLucky Travel — Winners</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="top">
        <div className="lang">
          <button onClick={() => setLang("hu")} className={lang === "hu" ? "active" : ""}>HU</button>
          <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
        </div>
      </header>

      <section className="hero">
        <div className="card">
          <h1>{c.title}</h1>
          <p className="sub">{c.sub}</p>

          <div className="content">
            <div className="photo">
              {/* Put the image here: /public/winners/napsugar.jpg */}
              <img src="/winners/napsugar.jpg" alt="Napsugár — GrandLuckyTravel winner" />
            </div>
            <div className="text">
              <p>{c.para1}</p>
              <p className="muted">{c.para2}</p>

              <div className="actions">
                <Link href="/vivko" legacyBehavior>
                  <a className="btn">{c.cta}</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        :global(:root){
          --page-yellow:#F4A53B;
          --accent:#faaf3b;
          --ink:#111;
          --muted:rgba(0,0,0,.75);
          --border:#e79f47;
          --card:#fff;
        }
        html,body{ background:var(--page-yellow); color:var(--ink); }

        .top{
          max-width:1100px; margin:0 auto; padding:16px 12px 0;
          display:flex; justify-content:flex-end;
        }
        .lang{ display:inline-flex; gap:8px; background:#fff; padding:6px; border-radius:999px; border:1px solid var(--border); }
        .lang button{ padding:8px 14px; border-radius:999px; border:2px solid transparent; background:transparent; font-weight:800; font-size:14px; cursor:pointer; }
        .lang .active{ background: var(--accent); border-color:#e49b28; }

        .hero{
          min-height: calc(100dvh - 60px);
          display:grid; place-items:center;
          /* Background image: add /public/winners/bg-advent.jpg */
          background:
            linear-gradient(180deg, rgba(244,165,59,.35), rgba(244,165,59,.55)),
            url("/winners/bg-advent.jpg") center/cover no-repeat;
        }

        .card{
          width:min(1100px, 96vw);
          background:var(--card);
          border:1px solid var(--border);
          border-radius:16px;
          box-shadow:0 20px 40px rgba(0,0,0,.12);
          padding:16px 16px 18px;
        }
        .card h1{ margin:6px 8px 2px; font-size:clamp(22px,5vw,30px); font-weight:800; }
        .sub{ margin:0 8px 12px; opacity:.95; }

        .content{
          display:grid; grid-template-columns: 1.1fr 1fr; gap:16px;
          align-items:stretch;
        }
        .photo{ border-radius:12px; overflow:hidden; background:#fff; }
        .photo img{ width:100%; height:100%; object-fit:cover; display:block; }

        .text{ padding:6px 4px; }
        .text p{ margin:10px 6px; font-size:16px; line-height:1.55; }
        .muted{ opacity:.9; }

        .actions{ margin:14px 6px 4px; }
        .btn{
          display:inline-flex; align-items:center; justify-content:center;
          padding:12px 20px; border-radius:999px; font:900 13px/1 Inter,system-ui,sans-serif;
          text-transform:uppercase; background:linear-gradient(180deg,#ffd767 0%, #ffbf3b 100%);
          color:#1b1b1b; border:3px solid #eaa21a; text-decoration:none;
          box-shadow:0 10px 20px rgba(0,0,0,.14), inset 0 1.5px 0 rgba(255,255,255,.55);
        }

        @media (max-width: 900px){
          .content{ grid-template-columns:1fr; }
          .photo{ height:min(60vh, 420px); }
        }
      `}</style>
    </main>
  );
}
