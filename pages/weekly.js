// pages/weekly.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function WeeklyFastestPage() {
  const [lang, setLang] = useState("hu"); // default Hungarian

  const copy = {
    hu: {
      headTitle: "Heti leggyorsabb versenyzők — GrandLuckyTravel",
      titleScript: "Heti eredmények",
      titleStrong: "Leggyorsabb versenyzők",
      intro:
        "Minden vasárnap 22:00-kor, magyar idő szerint, lezárul az adott heti kvíz. Az átláthatóság érdekében közzétesszük a hét leggyorsabb versenyzőjének és a tartalék versenyzőknek a felhasználónevét a tudásalapú online kvízből.",
      weeks: [
        {
          weekLabel: "Időszak: november 16–23.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-XUPM",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-UAZL", "3. GL-42RK"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
        {
          weekLabel: "Időszak: november 24–30.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-FNAY",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-CCZM", "3. GL-XZJ8"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
        {
          weekLabel: "Időszak: december 1–7.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-ZHBD",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-23TB", "3. GL-YZZ6"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
        {
          weekLabel: "Időszak: december 8–14.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-R8GQ",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-UPXD", "3. GL-ZHBD"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
        {
          weekLabel: "Időszak: december 15–21.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-AJYW",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-VXDG", "3. GL-2KKS"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
        {
          weekLabel: "Időszak: december 22–28.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-S43E",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-4G4D", "3. GL-6B8V"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },

        // Dec 29 – Jan 4
        {
          weekLabel: "Időszak: december 29.–január 4.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-MCP5",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-FZW2", "3. GL-Q34U"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
      ],
      backHome: "VISSZA A KEZDŐLAPRA",
      toWinners: "TOVÁBB A KORÁBBI NYERTESEKHEZ",
      jump: "UGRÁS A JÁTÉKHOZ",
    },

    en: {
      headTitle: "Weekly Fastest Contestants — GrandLuckyTravel",
      titleScript: "Weekly results",
      titleStrong: "Fastest contestants",
      intro:
        "Every Sunday at 22:00 Hungarian time the contest for the given week closes. For transparency, we publish the username of the week’s fastest contestant and the backup contestants from the online knowledge-based trivia.",
      weeks: [
        {
          weekLabel: "Period: Nov. 16–23",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-XUPM",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-UAZL", "3. GL-42RK"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
        {
          weekLabel: "Period: Nov. 24–30",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-FNAY",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-CCZM", "3. GL-XZJ8"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
        {
          weekLabel: "Period: Dec. 1–7",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-ZHBD",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-23TB", "3. GL-YZZ6"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
        {
          weekLabel: "Period: Dec. 8–14",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-R8GQ",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-UPXD", "3. GL-ZHBD"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
        {
          weekLabel: "Period: Dec. 15–21",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-AJYW",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-VXDG", "3. GL-2KKS"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
        {
          weekLabel: "Period: Dec. 22–28",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-S43E",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-4G4D", "3. GL-6B8V"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },

        // Dec 29 – Jan 4
        {
          weekLabel: "Period: Dec. 29 – Jan. 4",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-MCP5",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-FZW2", "3. GL-Q34U"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
      ],
      backHome: "BACK TO HOME",
      toWinners: "GO TO PREVIOUS WINNERS",
      jump: "JUMP TO THE GAME",
    },
  };

  const c = copy[lang];

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
        {lang === "hu" ? "ANGOL" : "MAGYAR"}
      </button>

      <section className="container">
        <h1 className="title">
          <span className="script">{c.titleScript}</span>
          <br />
          <span className="strong">{c.titleStrong}</span>
        </h1>

        <p className="intro">{c.intro}</p>

        {c.weeks.map((w) => (
          <div className="box" key={w.weekLabel}>
            <p className="week">{w.weekLabel}</p>

            <h2 className="section-title">{w.fastestTitle}</h2>
            <p className="user-line">{w.fastestUser}</p>

            <h2 className="section-title sub">{w.backupsTitle}</h2>
            <ul className="list">
              {w.backupsUsers.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>

            <p className="note">{w.note}</p>
          </div>
        ))}

        <div className="actions">
          <Link href="/" legacyBehavior>
            <a className="btn ghost">{c.backHome}</a>
          </Link>
          <Link href="/winners" legacyBehavior>
            <a className="btn">{c.toWinners}</a>
          </Link>
        </div>

        {/* Separate jump-to-game button */}
        <div className="jump-row">
          <Link href="/vivko?slide=4" legacyBehavior>
            <a className="btn jump-btn">{c.jump}</a>
          </Link>
        </div>
      </section>

      <style jsx>{`
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
          cursor: pointer;
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
          line-height: 1.05;
        }

        .script {
          font: 700 clamp(34px, 3.6vw, 44px) "Caveat", cursive;
          color: #222;
          text-shadow: 0 2px 0 rgba(255, 255, 255, 0.4);
        }

        .strong {
          font-weight: 900;
          font-size: clamp(22px, 2.2vw, 28px);
        }

        .intro {
          margin: 10px 0 12px;
          font-size: clamp(15px, 1.6vw, 17px);
          color: rgba(0, 0, 0, 0.78);
        }

        .week {
          margin: 0 0 8px;
          font-weight: 700;
          font-size: clamp(15px, 1.6vw, 17px);
        }

        .box {
          margin: 10px 0 18px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #ffe9c4;
          border: 1px solid #f1c27a;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          margin: 0 0 4px;
          font-weight: 900;
          font-size: clamp(15px, 1.6vw, 17px);
        }

        .section-title.sub {
          margin-top: 10px;
        }

        .user-line {
          margin: 2px 0 6px;
          font-weight: 800;
          font-size: clamp(16px, 1.7vw, 18px);
        }

        .list {
          margin: 4px 0 8px 1.2rem;
          padding: 0;
          font-size: clamp(15px, 1.6vw, 17px);
        }

        .note {
          margin: 8px 0 0;
          font-size: clamp(14px, 1.5vw, 16px);
          color: rgba(0, 0, 0, 0.8);
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
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn.ghost {
          background: #fff;
          border-color: #e8e8e8;
        }

        .jump-row {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }

        .jump-btn {
          padding: 14px 32px;
          font-size: clamp(13px, 1.3vw, 15px);
        }

        @media (max-width: 900px) {
          .container {
            width: calc(100vw - 28px);
            margin: 18px auto 24px;
          }
          .actions .btn {
            width: 100%;
          }
          .jump-row .jump-btn {
            width: 100%;
            max-width: 360px;
          }
        }
      `}</style>
    </main>
  );
}
