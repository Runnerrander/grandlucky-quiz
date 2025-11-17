export default function WinnersPage() {
  const isEN =
    typeof window !== "undefined" &&
    (location.search.includes("lang=en") ||
      document.documentElement.lang === "en");

  return (
    <main>
      <div className="bg">
        <img
          src="/bg-advent.jpg"
          alt="Festive New York background"
          className="bg-img"
          loading="eager"
        />
        <div className="scrim" />
      </div>

      <div className="wrap">
        <section className="card">
          <p className="badge">
            {isEN ? "PREVIOUS CONTEST WINNER" : "AZ ELOZO JATEK NYERTESE"}
          </p>

          <h1>{isEN ? "Napsugár from Budapest" : "Napsugár Budapestről"}</h1>

          <p className="lead">
            {isEN
              ? "Napsugár and her boyfriend will explore New York’s Advent season with Vivko."
              : "Napsugár és a párja Vivkóval együtt fedezik fel New York adventi hangulatát."}
          </p>

          <p className="lead">
            {isEN
              ? "Congratulations! See you in the next round — a new prize game starts now."
              : "Gratulálunk! Találkozz velünk a következő fordulóban — most egy új nyereményjáték indul."}
          </p>

          <div className="actions">
            <a href={isEN ? "/vivko?lang=en" : "/vivko"} className="btn">
              {isEN ? "Go to details" : "Tovább a részletekhez"}
            </a>
            <a href={isEN ? "/?lang=en" : "/"} className="btn ghost">
              {isEN ? "Back to home" : "Vissza a kezdőlapra"}
            </a>
          </div>
        </section>

        <figure className="photo">
          <img
            src="/winners/napsugar.jpg"
            alt="Napsugár — GrandLucky Travel winner"
            loading="eager"
          />
        </figure>
      </div>

      <style jsx>{`
        main {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        /* ---- Background: sharp (NO BLUR) ---- */
        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translateZ(0); /* ensure crisp rendering */
          filter: none; /* <- no blur */
        }
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(255, 255, 255, 0.80),
            rgba(255, 255, 255, 0.80)
          ); /* gentle readability layer */
          pointer-events: none;
        }

        /* ---- Content layout ---- */
        .wrap {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 560px;
          gap: 28px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 20px 80px;
        }

        .card {
          align-self: center;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          padding: 28px 28px 26px;
        }

        .badge {
          display: inline-block;
          font-weight: 800;
          letter-spacing: 0.4px;
          font-size: 14px;
          color: #f1b11b;
          padding: 8px 14px;
          border-radius: 999px;
          border: 2px solid #f1b11b;
          background: #fff7e0;
          margin: 0 0 12px 0;
          text-transform: uppercase;
        }

        h1 {
          font-size: clamp(26px, 3.4vw, 36px);
          line-height: 1.15;
          margin: 6px 0 12px;
          font-weight: 900;
          color: #111;
        }

        .lead {
          font-size: 16px;
          line-height: 1.55;
          color: #333;
          margin: 10px 0;
        }

        .actions {
          display: flex;
          gap: 14px;
          margin-top: 18px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 800;
          text-decoration: none;
          border: 2px solid #f1b11b;
          background: linear-gradient(180deg, #ffd667 0%, #ffb92f 100%);
          color: #192200;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.55);
        }
        .btn.ghost {
          background: #fff;
          border-color: #d7d7d7;
          color: #111;
        }

        .photo {
          align-self: center;
          margin: 0;
          background: #fff;
          border-radius: 18px;
          padding: 10px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.14);
        }
        .photo img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 12px;
        }

        @media (max-width: 980px) {
          .wrap {
            grid-template-columns: 1fr;
          }
          .photo {
            order: 2;
          }
          .card {
            order: 1;
          }
        }
      `}</style>
    </main>
  );
}
