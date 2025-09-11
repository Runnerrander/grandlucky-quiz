// pages/_app.js
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Mobile viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <Component {...pageProps} />

      <style jsx global>{`
        /* Ensure interactive elements are above any overlay/copy */
        button,
        .btn,
        a.button,
        a.btn,
        .cta-button,
        .cta,
        .slide-cta,
        .hero-cta {
          position: relative;
          z-index: 6;
        }

        /* Keep language toggle / utility chips clickable */
        .lang-toggle,
        .locale-toggle,
        .chip,
        .pill {
          position: relative;
          z-index: 7;
        }

        /* Typical headlines/copy wrappers: keep them below CTAs */
        h1,
        h2,
        .headline,
        .title,
        .slide-title,
        .hero-title,
        .copy,
        .slide-copy {
          position: relative;
          z-index: 4;
          word-break: break-word;
        }

        /* Make sure slide containers don't overflow weirdly */
        .slide,
        .hero,
        .section {
          overflow: hidden;
        }

        /* If your 4th slide uses a class or data attribute, both covered */
        .slide-4 .slide-copy,
        [data-slide="4"] .slide-copy {
          margin-bottom: 12px;
        }

        /* Mobile typography & CTA layout */
        @media (max-width: 480px) {
          h1,
          .headline,
          .slide-title,
          .hero-title {
            font-size: 1.6rem;
            line-height: 1.2;
            letter-spacing: 0.2px;
          }
          h2,
          .subtitle {
            font-size: 1.2rem;
            line-height: 1.25;
          }
          p,
          li,
          .copy,
          .slide-copy,
          .hero-copy {
            font-size: 0.95rem;
            line-height: 1.35;
          }
          .cta,
          .slide-cta,
          .hero-cta,
          .cta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
          }
          .cta button,
          .cta a,
          .slide-cta .btn,
          .hero-cta .btn {
            font-size: 0.95rem;
            padding: 10px 14px;
          }
        }
      `}</style>
    </>
  );
}
