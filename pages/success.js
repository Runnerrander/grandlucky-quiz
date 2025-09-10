// pages/success.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [lang, setLang] = useState("hu"); // default HU
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [creds, setCreds] = useState({ username: "", password: "" });

  useEffect(() => {
    if (!session_id) return;

    async function go() {
      setLoading(true);
      setErr("");
      try {
        // Always use GET with query param; works for both stub and real API
        const url = `/api/saveRegistration?session_id=${encodeURIComponent(
          String(session_id)
        )}`;

        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`API ${res.status}: ${text || "not ok"}`);
        }

        // Parse JSON safely
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error("Bad JSON from API");
        }

        const username =
          data?.username || data?.user || data?.name || ""; // accept variations just in case
        const password =
          data?.password || data?.pass || data?.pwd || "";

        if (!username || !password) {
          throw new Error("Missing username/password fields");
        }

        setCreds({ username, password });

        // Persist locally for convenience
        try {
          localStorage.setItem("gl_username", username);
          localStorage.setItem("gl_session_id", String(session_id));
        } catch {}

      } catch (e) {
        setErr(e?.message || "Failed to save registration");
      } finally {
        setLoading(false);
      }
    }

    go();
  }, [session_id]);

  // Simple Save / Print helpers
  const handleSave = () => {
    try {
      const blob = new Blob(
        [
          `GrandLucky Travel Credentials\n\nUsername: ${creds.username}\nPassword: ${creds.password}\nSession: ${session_id}\n`,
        ],
        { type: "text/plain;charset=utf-8" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grandlucky-credentials-${creds.username}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  // Copy buttons
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(lang === "hu" ? "Vágólapra másolva." : "Copied to clipboard.");
    } catch {}
  };

  // --- UI (keep dark theme + HU default labels) ---
  const t = {
    hu: {
      title: "Sikeres fizetés",
      thanks: "Köszönjük a regisztrációt!",
      loading: "Adatok mentése…",
      failed: "Sikertelen mentés",
      username: "Felhasználónév",
      password: "Jelszó",
      copy: "Másolás",
      save: "Mentés",
      print: "Nyomtatás",
      ready: "Elmentettem / kinyomtattam, mehetünk tovább",
    },
    en: {
      title: "Payment Successful",
      thanks: "Thank you for registering!",
      loading: "Saving your data…",
      failed: "Failed to save registration",
      username: "Username",
      password: "Password",
      copy: "Copy",
      save: "Save",
      print: "Print",
      ready: "I saved/printed — continue",
    },
  }[lang];

  return (
    <div style={{ minHeight: "100vh", background: "#1f1f1f", color: "white", padding: "48px 20px" }}>
      {/* Language toggle (top-right) */}
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <button
          onClick={() => setLang((l) => (l === "hu" ? "en" : "hu"))}
          style={{
            background: "#2a2a2a",
            borderRadius: 24,
            padding: "8px 14px",
            border: "1px solid #444",
            color: "white",
            cursor: "pointer",
          }}
          aria-label="language-toggle"
        >
          {lang === "hu" ? "ANGOL" : "MAGYAR"}
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 48, marginBottom: 8, fontWeight: 800 }}>{t.title}</h1>
        <p style={{ fontSize: 22, marginBottom: 28 }}>{t.thanks}</p>

        {loading && (
          <div style={{ padding: 12, background: "#333", display: "inline-block", borderRadius: 8 }}>
            {t.loading}
          </div>
        )}

        {!loading && err && (
          <div
            style={{
              display: "inline-block",
              background: "#7a1f1f",
              color: "white",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            {t.failed}: {err}
          </div>
        )}

        {!loading && !err && (
          <div
            style={{
              display: "grid",
              gap: 16,
              marginTop: 8,
              maxWidth: 560,
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ opacity: 0.9 }}>{t.username}</label>
              <div
                style={{
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 700 }}>{creds.username}</span>
                <button onClick={() => copy(creds.username)} style={btnSm}>
                  {t.copy}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ opacity: 0.9 }}>{t.password}</label>
              <div
                style={{
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 700 }}>{creds.password}</span>
                <button onClick={() => copy(creds.password)} style={btnSm}>
                  {t.copy}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={handleSave} style={btnPrimary}>{t.save}</button>
              <button onClick={handlePrint} style={btnGhost}>{t.print}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Small inline styles for buttons
const btnPrimary = {
  background: "#faaf3b",
  color: "#1a1a1a",
  border: "none",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  color: "white",
  border: "1px solid #666",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};
const btnSm = {
  background: "#444",
  color: "white",
  border: "1px solid #666",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 600,
  cursor: "pointer",
};
