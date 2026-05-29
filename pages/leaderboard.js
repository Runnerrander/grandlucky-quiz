// pages/leaderboard.js
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

export default function LeaderboardPage() {
  const router = useRouter();

  const [lang, setLang] = useState("hu");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [zoomError, setZoomError] = useState("");

  const ZOOM_LINK =
    "https://us06web.zoom.us/j/82929363166?pwd=0fIJOzctYlZWc3oAsMP4lLPAkJI6Hf.1";

  const copy = useMemo(
    () => ({
      hu: {
        title: "Kvalifikáció",
        sub: "Top 10 ranglista",
        desc:
          "A Top 10 lista a kvalifikáció végéig folyamatosan frissül. A leggyorsabb 10 hibátlan kitöltő jut be a 2. fordulóba (élő döntő).",
        refresh: "FRISSÍTÉS",
        updated: "Utolsó frissítés:",
        note:
          "Megjegyzés: a lista hibátlan (5/5) kitöltésekből épül.",
        backHome: "VISSZA A KEZDŐLAPRA",

        zoomTitle: "Zoom hozzáférés a 2. fordulóhoz",
        zoomDesc:
          "A Zoom link megtekintéséhez add meg a regisztrációkor kapott felhasználónevedet és jelszavadat. A hozzáférés az első 20 kvalifikált versenyző számára érhető el.",
        username: "Felhasználónév",
        password: "Jelszó",
        openZoom: "ZOOM LINK MEGNYITÁSA",
        invalid: "Hibás felhasználónév vagy jelszó.",
      },

      en: {
        title: "Qualification",
        sub: "Top 10 leaderboard",
        desc:
          "The Top 10 leaderboard updates continuously until qualification ends. The 10 fastest perfect players advance to Round 2 (live final).",
        refresh: "REFRESH",
        updated: "Last update:",
        note:
          "Note: the leaderboard is based on perfect (5/5) submissions.",
        backHome: "BACK TO HOME",

        zoomTitle: "Zoom access for Round 2",
        zoomDesc:
          "To access the Zoom link enter the username and password received during registration. Access is available for the first 20 qualified contestants.",
        username: "Username",
        password: "Password",
        openZoom: "OPEN ZOOM LINK",
        invalid: "Invalid username or password.",
      },
    }),
    []
  );

  const t = copy[lang];

  async function loadBoard() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/leaderboard?include_time=1");
      const json = await res.json();

      if (!json.ok) {
        setError(json?.details?.message || json?.message || "DB error");
        setRows([]);
        return;
      }

      setRows(json.leaderboard || []);
      setUpdatedAt(new Date().toLocaleString());
    } catch (e) {
      setError("Load failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  async function handleZoomAccess() {
    setZoomError("");

    try {
      const res = await fetch("/api/zoom-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setZoomError(t.invalid);
        return;
      }

      window.open(json.zoom_link, "_blank");
    } catch (e) {
      setZoomError(t.invalid);
    }
  }

  return (
    <>
      <Head>
        <title>Top 10 — Leaderboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#eba33a",
          padding: "40px 16px",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        <button
          onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 10,
            padding: "10px 18px",
            borderRadius: 999,
            border: "2px solid #222",
            background: "#f3d48a",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {lang === "hu" ? "ANGOL" : "MAGYAR"}
        </button>

        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            background: "#e9e2d7",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 14px 32px rgba(0,0,0,0.22)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            {t.title}
          </h1>

          <div
            style={{
              marginTop: 6,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {t.sub}
          </div>

          <p
            style={{
              marginTop: 10,
              fontSize: 13,
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            {t.desc}
          </p>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {t.updated}: {updatedAt}
            </div>

            <button
              onClick={loadBoard}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "2px solid #222",
                background: "#f1cb77",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {t.refresh}
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              background: "#ecd9aa",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {t.note}
          </div>

          {error ? (
            <div
              style={{
                marginTop: 14,
                background: "#f9d7d7",
                border: "1px solid #f2aaaa",
                color: "#991b1b",
                borderRadius: 12,
                padding: 12,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <div
              style={{
                marginTop: 18,
              }}
            >
              {rows.map((r) => (
                <div
                  key={r.rank}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #d2cbc0",
                    fontWeight: 800,
                  }}
                >
                  <span>#{r.rank}</span>
                  <span>{r.username}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 28,
              paddingTop: 22,
              borderTop: "1px solid #cfc6b9",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {t.zoomTitle}
            </h2>

            <p
              style={{
                marginTop: 10,
                fontSize: 13,
                lineHeight: 1.5,
                opacity: 0.8,
              }}
            >
              {t.zoomDesc}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 16,
              }}
            >
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.username}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #333",
                  fontWeight: 700,
                }}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #333",
                  fontWeight: 700,
                }}
              />
            </div>

            <button
              onClick={handleZoomAccess}
              style={{
                marginTop: 14,
                padding: "12px 20px",
                borderRadius: 999,
                border: "2px solid #222",
                background: "#f1cb77",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {t.openZoom}
            </button>

            {zoomError ? (
              <div
                style={{
                  marginTop: 10,
                  color: "#991b1b",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {zoomError}
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 30,
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                border: "2px solid #c8c8c8",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                minWidth: 210,
              }}
            >
              {t.backHome}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}