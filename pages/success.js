// pages/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState(null); // { username, password }
  const [error, setError] = useState("");

  // --- helpers --------------------------------------------------------------
  const getSessionId = () => {
    // Try router first; fallback to direct URL parsing (works on hard reloads)
    const fromRouter = router.query?.session_id;
    if (typeof fromRouter === "string" && fromRouter.trim()) return fromRouter;

    if (typeof window !== "undefined") {
      const sid = new URLSearchParams(window.location.search).get("session_id");
      if (sid) return sid;
    }
    return "";
  };

  const fetchCreds = async (sid) => {
    // Build absolute URL to be safe across environments
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/api/saveRegistration2?session_id=${encodeURIComponent(
      sid
    )}`;

    const res = await fetch(url, { method: "GET" });

    // Read as text first to avoid "Unexpected end of JSON input" masking
    const text = await res.text();

    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(
        `Bad JSON from saveRegistration2. Body: ${text?.slice(0, 200) || "<empty>"}`
      );
    }

    if (!res.ok || json?.ok !== true) {
      const msg =
        json?.error ||
        json?.message ||
        `HTTP ${res.status} calling saveRegistration2`;
      throw new Error(msg);
    }

    if (!json.username || !json.password) {
      throw new Error("Response missing username/password.");
    }

    return { username: json.username, password: json.password };
  };

  // --- effects --------------------------------------------------------------
  useEffect(() => {
    const run = async () => {
      const sid = getSessionId();
      if (!sid) {
        setError("Hiányzó session azonosító (session_id).");
        setLoading(false);
        return;
      }

      try {
        const result = await fetchCreds(sid);
        setCreds(result);
      } catch (e) {
        setError(
          `Sikertelen mentés: ${(e && e.message) || "ismeretlen hiba"}.`
        );
      } finally {
        setLoading(false);
      }
    };

    // Wait until router.query is hydrated on client
    if (router.isReady) run();
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- UI -------------------------------------------------------------------
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Sikeres fizetés</h1>
      <p style={styles.sub}>Köszönjük a regisztrációt!</p>

      {loading && <p style={styles.badgeInfo}>Feldolgozás…</p>}

      {!loading && error && <p style={styles.badgeError}>{error}</p>}

      {!loading && !error && creds && (
        <div style={styles.card}>
          <p style={{ margin: 0, opacity: 0.8 }}>Belépési adataid</p>
          <div style={styles.row}>
            <span style={styles.key}>Felhasználónév:</span>
            <span style={styles.value}>{creds.username}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.key}>Jelszó:</span>
            <span style={styles.value}>{creds.password}</span>
          </div>

          <div style={styles.actions}>
            <button onClick={handlePrint} style={styles.btnPrimary}>
              Nyomtatás
            </button>
            <a href="/" style={styles.btnGhost}>
              Vissza
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

// --- styles (simple inline to keep it self-contained) -----------------------
const styles = {
  main: {
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    padding: "48px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  h1: { margin: 0, fontSize: 40, lineHeight: 1.2, textAlign: "center" },
  sub: { margin: 0, opacity: 0.8, textAlign: "center" },

  badgeInfo: {
    background: "#223",
    color: "#cde",
    padding: "10px 14px",
    borderRadius: 8,
  },
  badgeError: {
    background: "#3a1212",
    color: "#ffb8b8",
    padding: "10px 14px",
    borderRadius: 8,
    maxWidth: 680,
    textAlign: "center",
  },

  card: {
    marginTop: 16,
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 560,
  },
  row: {
    display: "flex",
    gap: 12,
    alignItems: "baseline",
    marginTop: 10,
  },
  key: { width: 140, color: "#bbb" },
  value: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 10px",
  },
  actions: {
    marginTop: 18,
    display: "flex",
    gap: 12,
  },

  // button styles similar to your existing inline styles
  btnPrimary: {
    background: "#faa30b",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnGhost: {
    display: "inline-block",
    textDecoration: "none",
    color: "#fff",
    background: "transparent",
    border: "1px solid #666",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 600,
  },
};
