// pages/_app.js
export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <style jsx global>{`
        /* ---- Mobile fixes (<=640px) ---- */
        @media (max-width: 640px) {
          /* Tame large headings so they don’t spill over CTAs */
          h1, .h1 { 
            font-size: clamp(22px, 6vw, 28px);
            line-height: 1.15;
            margin-bottom: 12px;
          }

          /* Make all buttons/links tap-safe above any text overlays */
          button, .button, a.button, a.btn, .btn, .cta,
          .cta button, .cta a {
            position: relative;
            z-index: 10;           /* ensure on top of text blocks */
          }

          /* Common “text block / overlay” containers get lower stacking */
          .overlay, .copy, .text-block, .hero-copy, .slide-copy {
            position: relative;
            z-index: 1;
          }

          /* Give sections/slides comfy padding so nothing gets cramped */
          .section, .slide, .hero, .panel {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          /* When a row layout is too tight, stack it */
          .stack-mobile, .row {
            flex-wrap: wrap;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}
