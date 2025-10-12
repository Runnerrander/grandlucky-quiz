// pages/index.js
import Head from "next/head";
import Link from "next/link";

export default function Landing() {
  return (
    <main className="wrap">
      <Head>
        <title>GrandLucky Travel — Contest Update</title>
        {/* Temporary page: keep out of search */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      <section className="card">
        <h1 className="title"><span className="script">GrandLucky</span> Contest update</h1>

        {/* HU */}
        <div className="block">
          <h2 className="h2">Magyarul</h2>
          <p>
            A Vivkó nyereményjáték első fordulója lezárult, és jelenleg nem
            fut aktív projekt ezen az oldalon.
          </p>
          <p>
            <strong>Fontos:</strong> A 2. fordulóba bejutó <strong>6 szerencsés
            felhasználónév</strong> listája <strong>október 12-én 20:00-kor
            (magyar idő)</strong> kerül közzétételre. Ugyanebben az időpontban
            közzétesszük az összes résztvevő <strong>felhasználónevét</strong> is
            a kvíz <strong>befejezési idejével</strong> együtt.
          </p>
          <p className="muted">
            Ha kérdésed van, írj nekünk:{" "}
            <a href="mailto:support@grandluckytravel.com">
              support@grandluckytravel.com
            </a>
          </p>
        </div>

        <hr />

        {/* EN */}
        <div className="block">
          <h2 className="h2">English</h2>
          <p>
            The Vivko contest Round 1 has ended, and there is no active project
            on this site at the moment.
          </p>
          <p>
            <strong>Heads-up:</strong> The <strong>6 usernames</strong> entering
            Round 2 will be posted on <strong>October 12 at 20:00 (Hungary
            time)</strong>. At the same time we’ll publish <strong>all
            participating usernames</strong> together with their <strong>quiz
            completion times</strong>.
          </p>
          <p className="muted">
            Questions? Email us at{" "}
            <a href="mailto:support@grandluckytravel.com">
              support@grandluckytravel.com
            </a>
          </p>
        </div>

        <div className="row">
          <Link href="/leaderboards" className="btn">
            View Results
          </Link>
          <a href="mailto:support@grandluckytravel.com" className="btn ghost">
            Contact support
          </a>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --ink: #111;
          --muted: rgba(0,0,0,0.7);
          --accent: #faaf3b;
          --card: #fff;
          --bg: #f6f6f8;
          --border: #e8e8ee;
        }
        .wrap {
          min-height: 100dvh;
          background: radial-gradient(1200px 600px at 20% -10%, #fff 0%, #f8f8fb 55%, #f4f6fb 100%);
          font-family: "Montserrat", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          color: var(--ink);
          display: grid;
          place-items: center;
          padding: 24px;
        }
        .card {
          width: min(880px, 92vw);
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: clamp(18px, 3.2vw, 28px);
          box-shadow: 0 22px 44px rgba(0,0,0,0.06);
        }
        .title {
          margin: 0 0 6px;
          line-height: 1.05;
        }
        .script {
          display: inline-block;
          font: 700 clamp(36px, 6vw, 58px) "Caveat", cursive;
          color: var(--accent);
          margin-right: 8px;
        }
        .h2 {
          margin: 10px 0 8px;
          font-size: clamp(18px, 2.2vw, 22px);
          font-weight: 900;
        }
        .block { margin: 8px 0 2px; }
        p { margin: 8px 0; line-height: 1.55; }
        .muted { color: var(--muted); }
        hr {
          border: 0;
          border-top: 1px dashed var(--border);
          margin: 14px 0;
        }
        .row {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          border: 2px solid #e49b28;
          background: var(--accent);
          color: #111;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 24px rgba(0,0,0,0.12), inset 0 2px 0 #fff7;
        }
        .btn.ghost {
          background: #fff;
          border-color: var(--border);
        }
      `}</style>
    </main>
  );
}
