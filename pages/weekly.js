// pages/weekly.js
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

/* -------- Zoom -------- */
const ZOOM_URL =
  "https://us06web.zoom.us/j/88997205839?pwd=4y53rkleBnDMtBizqTfiXrCMnS3Gnk.1";

/* -------- i18n + weekly data -------- */
export default function WeeklyFastestPage() {
  const [lang, setLang] = useState("hu"); // default Hungarian

  // Zoom gate state
  const [zoomU, setZoomU] = useState("");
  const [zoomP, setZoomP] = useState("");
  const [zoomOk, setZoomOk] = useState(false);
  const [zoomTried, setZoomTried] = useState(false);
  const [copied, setCopied] = useState(false);

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
        {
          weekLabel: "Időszak: december 29.–január 4.",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-MCP5",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-FZW2", "3. GL-Q34U"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },

        // ✅ NEW WEEK ADDED (Jan 05 – Jan 11, 2026)
        {
          weekLabel: "Időszak: január 5.–január 11. (2026)",
          fastestTitle: "A hét leggyorsabb versenyzője:",
          fastestUser: "1. GL-B3DH",
          backupsTitle: "Tartalék versenyzők felhasználónevei:",
          backupsUsers: ["2. GL-C823", "3. GL-9JRA"],
          note:
            "A sorrend a kvíz hibátlan, leggyorsabb kitöltési ideje alapján került meghatározásra.",
        },
      ],
      backHome: "VISSZA A KEZDŐLAPRA",
      toWinners: "TOVÁBB A KORÁBBI NYERTESEKHEZ",

      // Zoom
      zoomTitle: "Döntő — Zoom hozzáférés",
      zoomIntro:
        "A Zoom link csak a 8 időszak leggyorsabb és tartalék versenyzőinek érhető el. Add meg a felhasználóneved és a jelszavad.",
      zoomUser: "Felhasználónév",
      zoomPass: "Jelszó",
      zoomReveal: "Zoom link megjelenítése",
      zoomBad:
        "Hibás adatok, vagy a felhasználó nem jogosult a Zoom hozzáférésre.",
      zoomShown: "Csatlakozás Zoomhoz",
      zoomCopy: "Link másolása",
      zoomCopied: "Másolva!",
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
        {
          weekLabel: "Period: Dec. 29 – Jan. 4",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-MCP5",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-FZW2", "3. GL-Q34U"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },

        // ✅ NEW WEEK ADDED (Jan 05 – Jan 11, 2026)
        {
          weekLabel: "Period: Jan. 05 – Jan. 11, 2026",
          fastestTitle: "Fastest contestant of the week:",
          fastestUser: "1. GL-B3DH",
          backupsTitle: "Usernames of the backup contestants:",
          backupsUsers: ["2. GL-C823", "3. GL-9JRA"],
          note:
            "The order is based on the fastest perfect completion time of the trivia quiz.",
        },
      ],
      backHome: "BACK TO HOME",
      toWinners: "GO TO PREVIOUS WINNERS",

      // Zoom
      zoomTitle: "Final — Zoom access",
      zoomIntro:
        "The Zoom link is available only to the 8 periods’ fastest and backup contestants. Enter your username and password.",
      zoomUser: "Username",
      zoomPass: "Password",
      zoomReveal: "Reveal Zoom link",
      zoomBad: "Invalid credentials or not eligible for Zoom access.",
      zoomShown: "Join Zoom",
      zoomCopy: "Copy link",
      zoomCopied: "Copied!",
    },
  };

  const c = copy[lang];

  /* -------- Password list (ONLY users between Nov 16, 2025 and Jan 11, 2026) --------
     Note: We only NEED the eligible users. Keeping it tight reduces risk and load.
  */
  const R2_CREDENTIALS = useMemo(
    () => ({
      // Period: Nov 16–23
      "GL-XUPM": "7mTreRZd",
      "GL-UAZL": "zDK9nBFH",
      "GL-42RK": "8YZCvFps",

      // Period: Nov 24–30
      "GL-FNAY": "NgnUiaVW",
      "GL-CCZM": "P2jzF8xP",
      "GL-XZJ8": "yqB2mQ5C",

      // Period: Dec 1–7
      "GL-ZHBD": "mKDH6ic8",
      "GL-23TB": "acfduw2v",
      "GL-YZZ6": "AqHxHjEV",

      // Period: Dec 8–14
      "GL-R8GQ": "hyxiWgkd",
      "GL-UPXD": "mTEgSZMi",
      // ZHBD already included above

      // Period: Dec 15–21
      "GL-AJYW": "fcRVLGAG",
      "GL-VXDG": "tz6vjbJC",
      "GL-2KKS": "fCRaqZrF",

      // Period: Dec 22–28
      "GL-S43E": "ACh9Xpgs",
      "GL-4G4D": "rzbvoQo5",
      "GL-6B8V": "tVsdVAZf",

      // Period: Dec 29 – Jan 4
      "GL-MCP5": "UUfe6iJo",
      "GL-FZW2": "hSV9q4Mu",
      "GL-Q34U": "5g9LNQfa",

      // Period: Jan 5 – Jan 11
      "GL-B3DH": "sSeXH6mm",
      "GL-C823": "cDdka9jC",
      "GL-9JRA": "NSgbXbRf",
    }),
    []
  );

  /* -------- helpers -------- */
  const norm = (s) =>
    (s || "").toString().trim().toUpperCase().replace(/\s+/g, "");
  const normalizeUsername = (u) =>
    norm(u).replace(/^GL-/, "GL").replace(/^GL(?=[A-Z0-9]{4}$)/, "GL-");

  const extractGL = (s) => {
    const m = (s || "").match(/GL-[A-Z0-9]{4}/i);
    return m ? m[0].toUpperCase() : null;
  };

  const ELIGIBLE_USERS = useMemo(() => {
    return new Set(
      c.weeks
        .flatMap((w) => [w.fastestUser, ...(w.backupsUsers || [])])
        .map(extractGL)
        .filter(Boolean)
    );
  }, [c.weeks]);

  const onReveal = (e) => {
    e.preventDefault();
    setZoomTried(true);

    const U = normalizeUsername(zoomU);
    const pass = R2_CREDENTIALS[U] || R2_CREDENTIALS[U.replace(/^GL-/, "GL")];

    const eligible = ELIGIBLE_USERS.has(U);
    setZoomOk(Boolean(eligible && pass && zoomP === pass));
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(ZOOM_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

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

        {/* Zoom reveal panel (replaces jump-to-game) */}
        <div className="zoomCard">
          <div className="zoomBar">{c.zoomTitle}</div>
          <div className="zoomInner">
            <p className="zoomIntro">{c.zoomIntro}</p>

            {!zoomOk ? (
              <form onSubmit={onReveal} className="zoomForm">
                <label>
                  {c.zoomUser}
                  <input
                    value={zoomU}
                    onChange={(e) => setZoomU(e.target.value)}
                    placeholder="GL-XXXX"
                    autoComplete="username"
                    required
                  />
                </label>

                <label>
                  {c.zoomPass}
                  <input
                    type="password"
                    value={zoomP}
                    onChange={(e) => setZoomP(e.target.value)}
                    placeholder="********"
                    autoComplete="current-password"
                    required
                  />
                </label>

                <button type="submit" className="revealBtn">
                  {c.zoomReveal}
                </button>

                {zoomTried ? (
                  <div className="zoomError">{c.zoomBad}</div>
                ) : null}
              </form>
            ) : (
              <div className="zoomReveal">
                <a
                  className="zoomLink"
                  href={ZOOM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.zoomShown}
                </a>
                <button className="copyBtn" onClick={copyLink} type="button">
                  {copied ? c.zoomCopied : c.zoomCopy}
                </button>
              </div>
            )}
          </div>
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
        }

        .btn.ghost {
          background: #fff;
          border-color: #e8e8e8;
        }

        /* Zoom card */
        .zoomCard {
          margin-top: 18px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #f1c27a;
          background: #fffdf6;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
        }
        .zoomBar {
          background: #ffe9c4;
          border-bottom: 1px solid #f1c27a;
          padding: 10px 14px;
          font-weight: 900;
        }
        .zoomInner {
          padding: 12px 14px;
        }
        .zoomIntro {
          margin: 8px 0 12px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.8);
        }
        .zoomForm {
          display: grid;
          gap: 10px;
        }
        .zoomForm label {
          display: grid;
          gap: 6px;
          font-weight: 800;
          font-size: 13px;
        }
        .zoomForm input {
          height: 42px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e79a2f;
          background: #fff;
          font-size: 14px;
        }
        .revealBtn {
          height: 46px;
          border-radius: 999px;
          border: 3px solid #e79a2f;
          background: #ffdca7;
          font-weight: 900;
          cursor: pointer;
          text-transform: uppercase;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.16),
            inset 0 2px 0 rgba(255, 255, 255, 0.4);
        }
        .zoomError {
          margin-top: 4px;
          font-weight: 800;
          color: #7a1f1f;
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.18);
          padding: 10px 12px;
          border-radius: 12px;
        }
        .zoomReveal {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .zoomLink {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          height: 48px;
          padding: 0 18px;
          border-radius: 999px;
          border: 3px solid #b97a13;
          background: #ffd35a;
          font-weight: 900;
          text-decoration: none;
          color: #111;
          font-size: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.14);
        }
        .copyBtn {
          height: 48px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #e79a2f;
          background: #fff;
          cursor: pointer;
          font-weight: 900;
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .container {
            width: calc(100vw - 28px);
            margin: 18px auto 24px;
          }
          .actions .btn {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
          .zoomReveal {
            flex-direction: column;
            align-items: stretch;
          }
          .zoomLink,
          .copyBtn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
