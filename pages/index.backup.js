import React, { useState } from 'react';

export default function Home() {
  const [language, setLanguage] = useState('hu'); // Default to Hungarian

  const text = {
    en: {
      title: 'Welcome to the GrandLuckyTravel website!',
      subtitle:
        'If you are lucky, you can travel with us for the price of a breakfast.',
      label: 'Explore the Christmas and Advent Season with Vivko in New York',
      sub: 'Click Here to Learn More',
    },
    hu: {
      title: 'Üdvözlünk a GrandLuckyTravel weboldalán!',
      subtitle: 'Ha szerencsés vagy, reggeli áráért velünk utazhatsz!',
      // Capitalized “Karácsonyi” and “Adventi”
      label: 'Fedezd fel a Karácsonyi és Adventi Szezont Vivkóval New Yorkban',
      sub: 'Kattints ide a részletekért',
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '90vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundImage: 'url(/iStock-865497008.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      {/* Language toggle button */}
      <div style={{ position: 'absolute', top: 20, right: 60 }}>
        <button
          onClick={() => setLanguage((prev) => (prev === 'en' ? 'hu' : 'en'))}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            fontSize: '1rem',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {language === 'en' ? 'Magyar' : 'English'}
        </button>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '3.2rem',
          fontWeight: 'bold',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '10px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          lineHeight: 1.2,
        }}
      >
        {text[language].title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '1.4rem',
          maxWidth: '900px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          borderRadius: '10px',
          marginBottom: '28px',
        }}
      >
        {text[language].subtitle}
      </p>

      {/* Keyframes for pulsing CTA */}
      <style>{`
        @keyframes pulseColors {
          0%   { background:#ff69b4; transform: scale(1);    }
          50%  { background:#28a745; transform: scale(1.03); }
          100% { background:#ff69b4; transform: scale(1);    }
        }
        @media (max-width: 768px) {
          h1 { font-size: 2.2rem !important; }
          p  { font-size: 1.05rem !important; }
          a.cta { font-size: 1.05rem !important; padding: 12px 18px !important; }
          a.cta .sub { font-size: 0.95rem !important; }
        }
      `}</style>

      {/* CTA Button (two lines inside) */}
      <a
        href="/vivko"
        className="cta"
        aria-label={`${text[language].label} — ${text[language].sub}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: '#fff',
          padding: '14px 26px',
          fontSize: '1.2rem',
          fontWeight: 700,
          borderRadius: '10px',
          textDecoration: 'none',
          boxShadow: '0 6px 14px rgba(0,0,0,0.28)',
          animation: 'pulseColors 2.7s ease-in-out infinite',
          transition: 'transform 0.2s ease',
          lineHeight: 1.2,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
      >
        <span>{text[language].label}</span>
        <span
          className="sub"
          style={{
            fontWeight: 600,
            opacity: 0.95,
            fontSize: '1.05rem',
          }}
        >
          {text[language].sub}
        </span>
      </a>
    </div>
  );
}
