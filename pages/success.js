// pages/success.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";

const BG = "/bg-success.png"; // <-- lowercase public image

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [lang, setLang] = useState("hu"); // default Hungarian
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [creds, setCreds] = useState({ username: "", password: "" });

  const t = useMemo(
    () =>
      ({
        hu: {
          toggle: "ANGOL",
          title: "Sikeres fizetés",
          thanks: "Köszönjük a regisztrációt!",
          details: "Belépési adatok",
          username: "Felhasználónév",
          password: "Jelszó",
          note: "Kérjük, a felhasználónevet és jelszót tartsd biztonságos helyen.",
          save: "Mentés",
          print: "Nyomtatás",
          ready: "Készen állok — KVÍZ indítása",
          error: "Hiba történt",
        },
        en: {
          toggle: "MAGYAR",
          title: "Payment Successful",
          thanks: "Thank you for registering!",
          details: "Sign-in details",
          username: "Username",
          password: "Password",
          note: "Please keep your username and password in a safe place.",
          save: "Save",
          print: "Print",
          ready: "I’m ready — Start the trivia",
          error: "An error occurred",
        },
      }[lang]),
    [lang]
  );

  // Fetch/create credentials
  useEffect(() => {
    if (!session_id) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const url = `/api/saveRegistration?session_id=${encodeURIComponent(
          String(session_id)
        )}`;
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`API ${res.status}: ${txt || "not ok"}`);
        }
        const data = await res.json();
        const username =
          data?.username || data?.user || data?.name || "";
        const password =
          data?.password || data?.pass || data?.pwd || "";
        if (!username || !password) {
          throw new Error("Missing username/password");
        }
        if (alive) {
          setCreds({ username, password });
          try {
            localStorage.setItem("gl_username", username);
            localStorage.setItem("gl_session_id", String(session_id));
          } catch {}
        }
      } catch (e) {
        if (alive) setErr(e?.message || "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [session_id]);

  // Save to txt
  const onSave = useCallback(() => {
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    const text = `GrandLucky Travel\n\nUsername: ${creds.username}\nPassword: ${creds.password}\nSaved at: ${ts}\n`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grandlucky-credentials-${creds.username}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [creds]);

  // Print simple sheet
  const onPrint = useCallback(() => {
    const ts = new Date().toLocaleString();
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html>
<html><head>
<meta charset="utf-8"><title>Credentials</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;padding:24px}
  .card{max-width:520px;margin:0 auto;border:1px solid #ddd;border-radius:10px;padding:22px}
  h1{margin:0 0 10px;font-size:22px}
  p{margin:6px 0;font-size:16px}
  hr{margin:14px 0}
</style>
</head><body>
<div class="card">
  <h1>GrandLucky Travel — Credentials</h1>
  <p><strong>Username:</strong> ${creds.username}</p>
  <p><strong>Password:</strong> ${creds.password}</p>
  <hr>
  <p>Printed: ${ts}</p>
</div>
<script>window.print()</script>
</body></html>`);
    w.document.close();
  }, [creds]);

  // Continue to trivia (auto)
  const onReady = useCallback(() => {
    if (!creds?.username) return;
    router.replace(`/trivia?auto=1&u=${encodeURIComponent(creds.username)}`);
  }, [creds?.username, router]);

  return (
    <main className="screen">
      <Head>
        <title>Success — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <button
        className="lang"
        onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
      >
        {t.toggle}
      </button>

      <div className="wrap">
        <h1 className="title">{t.title}</h1>
        <h2 className="lead">{t.thanks}</h2>

        {err ? (
          <p className="error">
            {t.error}: {err}
          </p>
        ) : (
          <>
            <h3 className="sublead">{t.details}</h3>
            <p>
              <strong>{t.username}:</strong>{" "}
              {loading ? "…" : creds.username}
            </p>
            <p>
              <strong>{t.password}:</strong>{" "}
              {loading ? "…" : creds.password}
            </p>
            <p className="note">{t.note}</p>
            <div className="buttons">
              <button
                className="btn"
                onClick={onSave}
                disabled={loading || !creds.username}
              >
                {t.save}
              </button>
              <button
                className="btn"
                onClick={onPrint}
                disabled={loading || !creds.username}
              >
                {t.print}
              </button>
              <button
                className="btn"
                onClick={onReady}
                disabled={loading || !creds.username}
              >
                {t.ready}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        :global(:root) {
          --fg: #fff;
          --muted: rgba(255, 255, 255, 0.86);
          --yellow: #faaf3b;
          --yellow-border: #e49b28;
          --chip: #f6f6f6;
          --chip-text: #1e1e1e;
          --shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
        }
        .screen {
          min-height: 100svh;
          color: var(--fg);
          font-family: Montserrat, system-ui, sans-serif;
          background: #1c1c1c url(${JSON.stringify(BG)}) center/cover no-repeat fixed;
          padding-top: clamp(70px, 10vh, 120px);
        }
        .lang {
          position: fixed;
          top: clamp(14px, 2vw, 22px);
          right: clamp(14px, 2vw, 22px);
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 900;
          border: 0;
          background: var(--chip);
          color: var(--chip-text);
          box-shadow: var(--shadow);
          cursor: pointer;
          z-index: 2;
        }
        .wrap {
          max-width: 760px;
          margin-left: clamp(24px, 6vw, 80px);
          margin-right: 24px;
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.45);
        }
        .title {
          margin: 0 0 6px;
          font-size: clamp(34px, 4.6vw, 56px);
          font-weight: 900;
        }
        .lead {
          margin: 0 0 16px;
          font-size: clamp(18px, 2.2vw, 24px);
          font-weight: 800;
          color: var(--muted);
        }
        .sublead {
          margin: 8px 0 4px;
          font-size: clamp(16px, 2vw, 20px);
          font-weight: 800;
        }
        .note {
          color: var(--muted);
          margin: 10px 0 18px;
        }
        .error {
          color: #ffd2d2;
          background: #8a2f2f;
          padding: 10px 12px;
          border-radius: 8px;
          display: inline-block;
        }
        .buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 20px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          color: #222;
          background: var(--yellow);
          border: 3px solid var(--yellow-border);
          text-decoration: none;
          box-shadow: var(--shadow), inset 0 2px 0 rgba(255, 255, 255, 0.65);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .btn:hover:not([disabled]) {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(0, 0, 0, 0.46),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }
        .btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 900px) {
          .wrap {
            margin-left: clamp(16px, 5vw, 28px);
          }
        }
      `}</style>
    </main>
  );
}
