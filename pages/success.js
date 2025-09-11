// pages/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState(null); // { username, password }
  const [error, setError] = useState("");

  // --- helpers ------------------------------------------------------

  const getSessionId = () => {
    // Prefer Next.js router first
    const fromRouter = router?.query?.session_id;
    if (typeof fromRouter === "string" && fromRouter.trim()) return fromRouter;

    // Fallback: parse from the URL (works on hard refresh)
    if (typeof window !== "undefined") {
      const sid = new URLSearchParams(window.location.search).get("session_id");
      if (sid) return sid;
    }
    return "";
  };

  const fetchCreds = async (sid) => {
    // Build absolute URL so it works in all environments
    const origin = typeof window === "undefined" ? "" : window.location.origin;

    // Use the real endpoint
    const url = `${origin}/api/saveRegistration?session_id=${encodeURIComponent(
      sid
    )}`;

    const res = await fetch(url, { method: "GET" });

    // Read as text first, then parse JSON (avoids "Unexpected end of JSON input")
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `Hiba a kérésben (${res.status}): ${text || "ismeretlen hiba"}`
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("A válasz nem érvényes JSON.");
    }

    // Validate expected fields
    if (
      !data ||
      data.ok !== true ||
      typeof data.username !== "string" ||
      typeof data.password !== "string"
    ) {
      throw new Error("Hiányzó vagy érvénytelen adatok a válaszban.");
    }

    return { username: data.username, password: data.password };
  };

  const run = async () => {
    try {
      setLoading(true);
      setError("");

      const sid = getSessionId();
      if (!sid) {
        throw new Error("Hiányzik a session_id az URL-ből.");
      }

      const c = await fetchCreds(sid);
      setCreds(c);
    } catch (e) {
      setError(
        e?.message || "Ismeretlen hiba történt a hitelesítő adatok lekérésekor."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      setError("A nyomtatás nem indítható.");
    }
  };

  // Save credentials to a local .txt file
  const handleSave = () => {
    try {
      const text = `Felhasználónév: ${creds?.username}\nJelszó: ${creds?.password}\n`;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `grandlucky-credentials-${creds?.username || "user"}.txt`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 0);
    } catch {
      setError("Nem sikerült menteni a fájlt.");
    }
  };

  // NEW: Start quiz after user saved/printed
  const handleReady = () => {
    try {
      if (creds?.username) {
        localStorage.setItem("gl_username", creds.username);
      }
      const sid = getSessionId();
      if (sid) localStorage.setItem("gl_session_id", sid);
    } catch {}
    // Go to trivia, auto-start, pass username for convenience
    router.replace(`/trivia?auto=1&u=${encodeURIComponent(creds?.username || "")}`);
  };

  useEffect(() => {
    if (!router.isReady) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // --- UI -----------------------------------------------------------

  const page = {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    padding: "40px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const card = {
    width: "100%",
    maxWidth: 520,
    background: "#151515",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    border: "1px solid #222",
    padding: 24,
  };

  const h1 = {
    textAlign: "center",
    marginBottom: 18,
    fontWeight: 700,
    fontSize: 32,
  };

  const sub = {
    textAlign: "center",
    marginBottom: 20,
    color: "#bbb",
  };

  const row = {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 12,
    alignItems: "center",
    marginTop: 16,
  };

  const label = { color: "#bbb" };

  const chip = {
    display: "inline-block",
    background: "#1e1e1e",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "8px 12px",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };

  const btns = {
    marginTop: 24,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const btnPrimary = {
    background: "#f4aa2a",
    border: "1px solid #f4aa2a",
    color: "#000",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  };

  const btnGhost = {
    background: "transparent",
    border: "1px solid #666",
    color: "#ddd",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
  };

  const btnStrong = {
    ...btnPrimary,
    fontWeight: 800,
  };

  const errBox = {
    background: "#3a0e0e",
    border: "1px solid #6b1a1a",
    color: "#ffd2d2",
    padding: "10px 12px",
    borderRadius: 8,
    marginTop: 18,
    textAlign: "center",
    fontSize: 14,
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={h1}>Sikeres fizetés</h1>
        <div style={sub}>Köszönjük a regisztrációt!</div>

        {loading && <div style={{ textAlign: "center" }}>Betöltés…</div>}

        {!loading && error && <div style={errBox}>{error}</div>}

        {!loading && !error && creds && (
          <>
            <div
              style={{
                textAlign: "left",
                fontWeight: 600,
                marginTop: 6,
                color: "#ccc",
              }}
            >
              Belépési adataid
            </div>

            <div style={row}>
              <div style={label}>Felhasználónév:</div>
              <div style={chip}>{creds.username}</div>
            </div>

            <div style={row}>
              <div style={label}>Jelszó:</div>
              <div style={chip}>{creds.password}</div>
            </div>

            <div style={btns}>
              <button onClick={handlePrint} style={btnPrimary}>
                Nyomtatás
              </button>
              <button onClick={handleSave} style={btnPrimary}>
                Mentés
              </button>
              <button onClick={handleReady} style={btnStrong}>
                Készen állok — KVÍZ indítása
              </button>
              <button onClick={() => router.push("/")} style={btnGhost}>
                Vissza
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
