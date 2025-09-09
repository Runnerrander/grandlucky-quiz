// pages/vivko.js
import React, { useState } from "react";

const slides = [
  {
    src: "/vivko-ny-1.jpg",
    layout: "full",
    main: {
      en: "Christmas and Advent Season with Vivko in New York",
      hu: "Karácsonyi és Adventi Szezon Vivkóval New Yorkban",
    },
    sub: {
      en: "Join Vivko for an unforgettable Pre Christmas and Advent in New York for a 7 day Trip from November 27th. to December 3rd.!",
      hu: "Csatlakozz Vivkóhoz egy felejthetetlen, Karácsony előtti és Adventi, 7 napos New York-i útra November 27-től December 3-ig!",
    },
  },
  {
    src: "/vivko-ny-2.jpg",
    layout: "full",
    main: {
      en: "Advent Season with Vivko in New York",
      hu: "Adventi Szezon Vivkóval New Yorkban",
    },
    sub: {
      en: "Explore the magic of Times Square with Vivko this holiday season.",
      hu: "Fedezd fel a Times Square varázsát Vivkóval az ünnepi Szezonban.",
    },
  },
  {
    src: "/vivko-ny-4.jpg",
    layout: "full",
    main: {
      en: "Christmas Season with Vivko in New York",
      hu: "Karácsonyi Szezon Vivkóval New Yorkban",
    },
    sub: {
      en: "A lucky registered user will be drawed on September 20th at 18:00 (Hungarian Time). He or She and their travel partner will experience the U.S. East Coast like never before.",
      hu: "Egy szerencsés regisztrált felhasználót Szeptember 20-án 18:00-kor (Magyar Idő Szerint) sorsolunk ki. Ő és utazótársa felejthetetlen élményben részesül az USA keleti partján.",
    },
  },
  {
    // Slide 4: abstract “drawing” background + CTA; no side buttons
    src: "/vivko-draw-bg.jpg",
    layout: "center",
    main: {
      en: "Drawing September 20 2025 at 18:00 (Hungarian Time)",
      hu: "Sorsolás: 2025. Szeptember 20. 18:00 (Magyar Idő Szerint)",
    },
    sub: {
      en: `After you register on our site for $9.99 you will have a chance to spend Christmas and Advent time with Vivko. Including a trip to Washington DC. If you are the lucky one, you and one person of your choice (family member or friend). No travel experience needed — just your luck and a registration and your passport. Includes city tours, group fun, and surprises with Vivko.`,
      hu: `Miután regisztráltál oldalunkon 9,99 dollárért, esélyed lesz Vivkóval tölteni a Karácsonyt és az Adventet, beleértve egy utazást Washington DC-be. Ha te vagy a szerencsés, egy általad választott személlyel (családtag vagy barát) utazhatsz. Nincs szükség utazási tapasztalatra – csak szerencsére, regisztrációra és útlevélre. A program városnézést, közös élményeket és meglepetéseket is tartalmaz Vivkóval.`,
    },
  },
];

export default function VivkoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState("hu"); // default HU

  const current = slides[currentIndex];
  const isSlide4 = currentIndex === 3;

  const prevSlide = () =>
    setCurrentIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const nextSlide = () =>
    setCurrentIndex((p) => (p === slides.length - 1 ? 0 : p + 1));

  const t = (obj) =>
    (obj?.[language] && obj[language].trim()) ? obj[language] : (obj?.en || "");

  // Position content higher on slide 4; mobile tuned via CSS below
  const topDesktop = isSlide4 ? "38%" : "10%";
  const titleSizeDesktop = isSlide4 ? "3rem" : "3.1rem";
  const subSizeDesktop = isSlide4 ? "1.25rem" : "1.35rem";

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <div
        className="vivko-stage"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <img
          src={current.src}
          alt="Vivko slide"
          className="bg"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <style>{`
          @keyframes pulseScale {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
          }
          @keyframes pulseColors {
            0% { background-color: #ff69b4; }
            50% { background-color: #32cd32; }
            100% { background-color: #ff69b4; }
          }

          .content-card {
            background: rgba(0,0,0,0.6);
            color: #ff69b4;
            text-shadow: 0 2px 6px rgba(0,0,0,0.85);
            border-radius: 12px;
            backdrop-filter: blur(1px);
            box-shadow: 0 10px 24px rgba(0,0,0,0.35);
          }
          .sideBtn {
            background: rgba(0,0,0,0.65);
            color: #ff69b4;
            border: 1px solid rgba(255,105,180,0.55);
            box-shadow: 0 6px 18px rgba(0,0,0,0.35);
          }
          .sideBtn:hover { background: rgba(0,0,0,0.78); }

          .cta {
            color: #fff;
            border-radius: 10px;
            border: none;
            text-decoration: none;
            display: inline-block;
            padding: 14px 24px;
            font-weight: 700;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            animation: pulseScale 2.3s ease-in-out infinite, pulseColors 3s linear infinite;
          }

          /* Mobile adjustments */
          @media (max-width: 640px) {
            .titleBox { font-size: ${isSlide4 ? "2rem" : "2.2rem"} !important; }
            .subBox    { font-size: ${isSlide4 ? "1rem" : "1.05rem"} !important; }
            .contentWrap { top: ${isSlide4 ? "20%" : "7%"} !important; width: 92% !important; }
            .sideBtn { top: 78% !important; padding: 8px 12px !important; }
          }
        `}</style>

        {/* Language toggle */}
        <div style={{ position: "absolute", top: 18, right: 20, zIndex: 3 }}>
          <button
            onClick={() => setLanguage((prev) => (prev === "en" ? "hu" : "en"))}
            style={{
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            aria-label="Toggle language"
          >
            {language === "hu" ? "English" : "Magyar"}
          </button>
        </div>

        {/* Content (title, sub, CTA) */}
        <div
          className="contentWrap"
          style={{
            position: "absolute",
            left: "50%",
            top: topDesktop,
            transform: "translateX(-50%)",
            zIndex: 2,
            width: "82%",
            textAlign: "center",
          }}
        >
          {/* Title */}
          <div
            className="content-card titleBox"
            style={{
              display: "inline-block",
              padding: "14px 26px",
              marginBottom: 18,
              fontSize: titleSizeDesktop,
              fontWeight: 800,
            }}
          >
            {t(current.main)}
          </div>

          {/* Sub */}
          <div
            className="content-card subBox"
            style={{
              display: "inline-block",
              padding: "14px 22px",
              fontSize: subSizeDesktop,
              lineHeight: 1.6,
              maxWidth: 980,
              margin: "0 auto",
            }}
          >
            {t(current.sub)}
          </div>

          {/* Slide 4 CTA */}
          {isSlide4 && (
            <div style={{ marginTop: 16 }}>
              <a href="/user-agreement" className="cta">
                {language === "hu"
                  ? "Kattints ide a Szabályok & Felhasználói Feltételek folytatásához"
                  : "Click Here to Continue to Rules and User Agreements"}
              </a>
            </div>
          )}
        </div>

        {/* Prev (hidden on slide 4) */}
        {!isSlide4 && (
          <button
            onClick={prevSlide}
            className="sideBtn"
            style={{
              position: "absolute",
              top: "58%",
              left: 18,
              transform: "translateY(-50%)",
              padding: "10px 14px",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 2,
              fontWeight: 700,
            }}
            aria-label="Previous slide"
          >
            {language === "hu" ? "Előző oldal" : "Previous page"}
          </button>
        )}

        {/* Next (hidden on slide 4) */}
        {!isSlide4 && (
          <button
            onClick={nextSlide}
            className="sideBtn"
            style={{
              position: "absolute",
              top: "58%",
              right: 18,
              transform: "translateY(-50%)",
              padding: "10px 14px",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 2,
              fontWeight: 700,
            }}
            aria-label="Next slide"
          >
            {language === "hu" ? "Következő oldal" : "Next page"}
          </button>
        )}
      </div>
    </div>
  );
}
