// pages/_app.js
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Global mobile viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <Component {...pageProps} />

      {/* Global CSS:
         - keep CTAs above text
         - fix Slide 4 on mobile: scroll text, sticky CTA
      */}
      <style jsx global>{`
        /* Keep interactive elements above text overlays */
        button,
        .btn,
        a.button,
        a.btn,
        .cta button,
        .cta a,
        .slide-cta button,
        .slide-cta a {
          position: relative;
          z-index: 60;
        }

        /* Common text wrappers below CTAs */
        h1,
        h2,
        .headline,
        .title,
        .copy,
        .slide-copy,
        .hero-copy,
        .text-block {
          position: relative;
          z-index: 10;
          word-break: break-word;
        }

        /* Generic slide containers */
        .slide,
        .hero,
        .section {
          overflow: hidden;
        }

        /* MOBILE FIXES */
        @media (max-width: 820px) {
          /* Tame big headings so they don't flood the screen */
          h1,
          .headline,
          .title {
            font-size: clamp(22px, 6vw, 28px);
            line-height: 1.15;
            margin-bottom: 12px;
          }
          p,
          .copy,
          .slide-copy,
          .hero-copy {
            font-size: 0.98rem;
            line-height: 1.35;
          }

          /* Make buttons easy to tap */
          button,
          .btn,
          a.button,
          a.btn {
            padding: 12px 14px;
          }

          /* ---------- SLIDE 4: make text scroll, keep CTA visible ---------- */

          /* Make slide 4 a column layout that can dedicate space for scrollable text */
          .slide-4,
          [data-slide="4"],
          .slides > *:nth-child(4) {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }

          /* The text block becomes a scrollable area with padding at bottom
             so the sticky CTA doesn't overlap it */
          .slide-4 .slide-copy,
          [data-slide="4"] .slide-copy,
          .slides > *:nth-child(4) .slide-copy,
          .slide-4 .copy,
          [data-slide="4"] .copy,
          .slides > *:nth-child(4) .copy,
          .slide-4 .text-block,
          [data-slide="4"] .text-block,
          .slides > *:nth-child(4) .text-block {
            flex: 1 1 auto;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 140px; /* space for CTA */
            margin-bottom: 0 !important; /* override prior bottom margins */
          }

          /* Keep the CTA/buttons visible near bottom on phones */
          .slide-4 .cta,
          [data-slide="4"] .cta,
          .slides > *:nth-child(4) .cta,
          .slide-4 .slide-cta,
          [data-slide="4"] .slide-cta,
          .slides > *:nth-child(4) .slide-cta,
          .slide-4 .buttons,
          [data-slide="4"] .buttons,
          .slides > *:nth-child(4) .buttons,
          .slide-4 .btn-row,
          [data-slide="4"] .btn-row,
          .slides > *:nth-child(4) .btn-row {
            position: sticky;
            bottom: 16px;
            z-index: 80;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            /* subtle backdrop for readability over bright images */
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.35),
              rgba(0, 0, 0, 0)
            );
            padding-top: 6px;
            margin-top: 10px;
          }
        }
      `}</style>
    </>
  );
}
