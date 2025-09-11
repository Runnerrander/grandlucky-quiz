// pages/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();

  const [lang, setLang] = useState("hu"); // default HU
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState(null); // { username, password }
  const [error, setError] = useState("");

  // ----- copy text (HU / EN) -------------------------------------------------
  const t = {
    hu: {
      langToggle: "ANGOL",
      title: "Sikeres fizetés",
      thanks: "Köszönjük a regisztrációt!",
      section: "Belépési adatok",
      userLabel: "Felhasználónév / Username",
      passLabel: "Jelszó / Password",
      note: "Kérjük, a felhasználónevet és jelszót tartsd biztonságos helyen.",
      save: "FELHASZNÁLÓNÉV ÉS JELSZÓ MENTÉSE",
      print: "FELHASZNÁLÓNÉV ÉS JELSZÓ NYOMTATÁSA",
      ready: "KÉSZEN ÁLLOK — KVÍZ INDÍTÁSA",
      loading: "Betöltés…",
      jsonErr: "A válasz nem érvényes JSON.",
      fetchErr: (s, text) => `Hiba a kérésben (${s}): ${text || "ismeretlen hiba"}`,
      missingSid: "Hiányzik a session_id az URL-ből.",
      badFields: "Hiányzó vagy érvénytelen adatok a válaszban.",
      printErr: "A nyomtatás nem indítható.",
      saveErr: "Nem sikerült menteni a fájlt.",
    },
    en: {
      langToggle: "MAGYAR",
      title: "Payment Successful",
      thanks: "Thank you for registering!",
      section: "Sign-in details",
      userLabel: "Username",
      passLabel: "Password",
      note: "Please keep your username and password in a safe place.",
      save: "SAVE USERNAME & PASSWORD",
      print: "PRINT USERNAME & PASSWORD",
      ready: "I saved or printed the credentials — START TRIVIA",
      loading: "Loading…",
      jsonErr: "Response is not valid JSON.",
      fetchErr: (s, text) => `Request error (${s}): ${text || "unknown error"}`,
      missingSid: "Missing session_id in URL.",
      badFields: "Missing or invalid fields in response.",
      printErr: "Printing could not be started.",
      saveErr: "Could not save the file.",
    },
  }[lang];

  // ----- helpers --------------------------------------------------------------
  const getSessionId = () => {
    const fromRouter = router?.query?.session_id;
    if (typeof fromRouter === "string" && fromRouter.trim()) return fromRouter;

    if (typeof window !== "undefined") {
      const sid = new URLSearchParams(window.location.search).get("session_id");
      if (sid) return sid;
    }
    return "";
  };

  const fetchCreds = async (sid) => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const url = `${origin}/api/saveRegistration?session_id=${encodeURIComponent(
      sid
    )}`;

    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(t.fetchErr(res.status, text));
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(t.jsonErr);
    }

    if (
      !data ||
      data.ok !== true ||
      typeof data.username !== "string" ||
      typeof data.password !== "string"
    ) {
      throw new Error(t.badFields);
    }

    return { username: data.username, password: data.password };
  };

  const run = async () => {
    try {
      setLoading(true);
      setError("");

      const sid = getSessionId();
      if (!sid) throw new Error(t.missingSid);

      const c = await fetchCreds(sid);
      setCreds(c);
      try {
        localStorage.setItem("gl_username", c.username);
        localStorage.setItem("gl_session_id", String(sid));
      } catch {}
    } catch (e) {
      setError(e?.message || t.fetchErr("?", ""));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    try {
      const w = window.open("", "_blank");
      if (!w) return; // popup blocked
      const when = new Date().toLocaleString();
      w.document.write(`<!doctype html>
<html><head><meta charset="utf-8">
<title>Credentials</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif; padding:24px;}
  .card{max-width:520px; margin:0 auto; border:1px solid #ddd; border-radius:10px; padding:22px;}
  h1{margin:0 0 10px; font-size:22px;}
  p{margin:6px 0; font-size:16px;}
  hr{margin:14px 0;}
</style></head>
<body>
  <div class="card">
    <h1>GrandLuckyTravel — Credentials</h1>
    <p><strong>Username:</strong> ${creds?.username || ""}</p>
    <p><strong>Password:</strong> ${creds?.password || ""}</p>
    <hr>
    <p>Printed: ${when}</p>
  </div>
  <script>window.print();</script>
</body></html>`);
      w.document.close();
    } catch {
      setError(t.printErr);
    }
  };

  const handleSave = () => {
    try {
      const text = `GrandLucky Travel Credentials\n\nUsername: ${creds?.username}\nPassword: ${creds?.password}\n`;
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
      setError(t.saveErr);
    }
  };

  const handleStartQuiz = () => {
    if (!creds?.username) return;
    router.replace(`/trivia?auto=1&u=${encodeURIComponent(creds.username)}`);
  };

  useEffect(() => {
    if (!router.isReady) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // ----- styles ---------------------------------------------------------------
  const page = {
    minHeight: "100vh",
    background: "#2b2b2b",
    color: "#fff",
    padding: "48px 20px",
  };
  const wrap = { maxWidth: 960, margin: "0 auto" };
  const langBtnWrap = { position: "fixed", top: 16, right: 16, zIndex: 2 };
  const langBtn = {
    background: "#ffffff",
    color: "#111",
    border: "0",
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,0,0,.35)",
  };
  const h1 = {
    fontSize: 56,
    lineHeight: 1.06,
    margin: "0 0 6px",
    fontWeight: 900,
  };
  const lead = { fontSize: 24, fontWeight: 800, margin: "0 0 26px", opacity: 0.9 };
  const section = { fontSize: 20, fontWeight: 900, margin: "0 0 14px" };
  const label = { fontWeight: 700, opacity: 0.9 };
  const value = {
    display: "inline-block",
    marginLeft: 10,
    padding: "8px 12px",
    borderRadius: 10,
    background: "#1f1f1f",
    border: "1px solid #3a3a3a",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };
  const note = { marginTop: 10, opacity: 0.9 };
  const buttonsRow = { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 22 };
  const btn = {
    background: "#F4AA2A",
    color: "#221a00",
    border: "3px solid #e39c2a",
    borderRadius: 999,
    padding: "14px 22px",
    fontWeight: 900,
    textTransform: "uppercase",
    boxShadow: "0 14px 32px rgba(0,0,0,.35), inset 0 2px 0 rgba(255,255,255,.65)",
    cursor: "pointer",
  };
  const btnGhost = {
    ...btn,
    background: "transparent",
    color: "#ddd",
    border: "1px solid #666",
    boxShadow: "none",
    textTransform: "none",
  };
  const errBox = {
    display: "inline-block",
    background: "#7a1f1f",
    color: "white",
    padding: "10px 14px",
    borderRadius: 8,
    marginTop: 14,
  };

  // ----- UI -------------------------------------------------------------------
  return (
    <div style={page}>
      <div style={langBtnWrap}>
        <button
          style={langBtn}
          onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
          aria-label="language-toggle"
        >
          {t.langToggle}
        </button>
      </div>

      <div style={wrap}>
        <h1 style={h1}>{t.title}</h1>
        <div style={lead}>{t.thanks}</div>

        {loading && <div>{t.loading}</div>}

        {!loading && error && <div style={errBox}>{error}</div>}

        {!loading && !error && creds && (
          <>
            <div style={section}>{t.section}</div>

            <div style={{ marginBottom: 10 }}>
              <span style={label}>{t.userLabel}:</span>
              <span style={value}>{creds.username}</span>
            </div>

            <div style={{ marginBottom: 10 }}>
              <span style={label}>{t.passLabel}:</span>
              <span style={value}>{creds.password}</span>
            </div>

            <div style={note}>{t.note}</div>

            <div style={buttonsRow}>
              <button style={btn} onClick={handleSave}>
                {t.save}
              </button>
              <button style={btn} onClick={handlePrint}>
                {t.print}
              </button>
              <button style={btn} onClick={handleStartQuiz}>
                {t.ready}
              </button>
              <button style={btnGhost} onClick={() => router.push("/")}>
                Vissza
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
