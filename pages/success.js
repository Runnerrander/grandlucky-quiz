// pages/success.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";

const BG = "/BG-sikeres fizetes-grafikaval.png"; // decorative dark bg (plane+camera)
const LS_USERNAME = "gl_username";
const LS_SESSION = "gl_session_id";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  // copy
  const t = useMemo(
    () => ({
      hu: {
        switchLang: "ANGOL",
        title: "Sikeres fizetés",
        lead: "Köszönjük a regisztrációt!",
        sublead: "Belépési adatok",
        save: "FELHASZNÁLÓNÉV ÉS JELSZÓ MENTÉSE",
        print: "FELHASZNÁLÓNÉV ÉS JELSZÓ NYOMTATÁSA",
        // updated HU text:
        done: "ELMENTETTEM VAGY KINYOMTATTAM AZ ADATOKAT — KÉSZEN ÁLLOK A KVÍZRE",
        note: "Kérjük, a felhasználónevet és jelszót tartsd biztonságos helyen.",
      },
      en: {
        switchLang: "MAGYAR",
        title: "Payment Successful",
        lead: "Thank you for registering!",
        sublead: "Sign-in details",
        save: "SAVE USERNAME & PASSWORD",
        print: "PRINT USERNAME & PASSWORD",
        // updated EN text (exact phrase you asked for):
        done: "I saved or printed the credentials I'm ready to start the trivia",
        note: "Please keep your username and password in a safe place.",
      },
    }),
    []
  )[lang];

  // fetch/create credentials once
  useEffect(() => {
    if (!session_id) return;
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("/api/saveRegistration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session_id }),
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || "Failed to save registration");
        }
        if (!ignore) setCreds(json.data || {});
      } catch (e) {
        if (!ignore) setErr(e.message || "Error");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [session_id]);

  // download as text file
  const onSave = useCallback(() => {
    const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
    const text = `GrandLuckyTravel\n\nUsername: ${creds.username}\nPassword: ${creds.password}\nSaved at: ${ts}\n`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grandluckytravel-credentials.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [creds]);

  // open simple printable window
  const onPrint = useCallback(() => {
    const ts = new Date().toLocaleString();
    const w = window.open("", "_blank");
    if (!w) return; // popup blocked
    w.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Credentials</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif; padding:24px;}
  .card{max-width:520px; margin:0 auto; border:1px solid #ddd; border-radius:10px; padding:22px;}
  h1{margin:0 0 10px; font-size:22px;}
  p{margin:6px 0; font-size:16px;}
  hr{margin:14px 0;}
</style>
</head>
<body>
  <div class="card">
    <h1>GrandLuckyTravel — Credentials</h1>
    <p><strong>Username:</strong> ${creds.username}</p>
    <p><strong>Password:</strong> ${creds.password}</p>
    <hr>
    <p>Printed: ${ts}</p>
  </div>
  <script>window.print();</script>
</body>
</html>`);
    w.document.close();
  }, [creds]);

  // Go straight to Trivia (auto-start) with username
  const onDone = useCallback(() => {
    if (!creds?.username) return;
    try {
      localStorage.setItem(LS_USERNAME, creds.username);
      if (session_id) localStorage.setItem(LS_SESSION, String(session_id));
    } catch {}
    router.replace(`/trivia?auto=1&u=${encodeURIComponent(creds.username)}`);
  }, [creds?.username, router, session_id]);

  return (
    <main className="screen">
      <Head>
        <title>Success — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap"
        />
      </Head>

      <button className="lang" onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}>
        {t.switchLang}
      </button>

      <div className="wrap">
        <h1 className="title">{t.title}</h1>
        <h2 className="lead">{t.lead}</h2>

        {err ? (
          <p className="error">{err}</p>
        ) : (
          <>
            <h3 className="sublead">{t.sublead}</h3>
            <p><strong>Felhasználónév / Username:</strong> {loading ? "…" : creds.username}</p>
            <p><strong>Jelszó / Password:</strong> {loading ? "…" : creds.password}</p>
            <p className="note">{t.note}</p>

            <div className="buttons">
              <button className="btn" onClick={onSave} disabled={loading || !creds.username}>
                {t.save}
              </button>
              <button className="btn" onClick={onPrint} disabled={loading || !creds.username}>
                {t.print}
              </button>
              <button className="btn" onClick={onDone} disabled={loading || !creds.username}>
                {t.done}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        :global(:root){
          --fg:#fff; --muted:rgba(255,255,255,.86);
          --yellow:#faaf3b; --yellow-border:#e49b28;
          --chip:#f6f6f6; --chip-text:#1e1e1e; --shadow:0 12px 28px rgba(0,0,0,.32);
        }
        .screen{
          height:100svh; overflow:auto; color:var(--fg);
          font-family:Montserrat,system-ui,sans-serif;
          background:#2f2f2f url(${JSON.stringify(BG)}) center/cover no-repeat;
          padding-top:clamp(70px,10vh,120px);
        }
        .lang{
          position:fixed; top:clamp(14px,2vw,22px); right:clamp(14px,2vw,22px);
          padding:12px 22px; border-radius:999px; font-weight:900; border:0;
          background:var(--chip); color:var(--chip-text); box-shadow:var(--shadow); cursor:pointer; z-index:2;
        }
        .wrap{ max-width:760px; margin-left:clamp(24px,6vw,80px); margin-right:24px; text-shadow:0 1px 0 rgba(0,0,0,.45); }
        .title{ margin:0 0 6px; font-size:clamp(34px,4.6vw,56px); font-weight:900; }
        .lead{ margin:0 0 16px; font-size:clamp(18px,2.2vw,24px); font-weight:800; color:var(--muted); }
        .sublead{ margin:8px 0 4px; font-size:clamp(16px,2vw,20px); font-weight:800; }
        .note{ color:var(--muted); margin:10px 0 18px; }
        .error{ color:#ffd2d2; background:#8a2f2f; padding:10px 12px; border-radius:8px; display:inline-block; }
        .buttons{ display:flex; gap:12px; flex-wrap:wrap; margin-top:10px; }
        .btn{
          display:inline-flex; align-items:center; justify-content:center;
          padding:14px 20px; border-radius:999px; font-weight:900; text-transform:uppercase;
          color:#222; background:var(--yellow); border:3px solid var(--yellow-border);
          text-decoration:none; box-shadow:var(--shadow), inset 0 2px 0 rgba(255,255,255,.65);
          transition:transform .2s, box-shadow .2s; cursor:pointer;
        }
        .btn:hover:not([disabled]){ transform:translateY(-2px); box-shadow:0 22px 36px rgba(0,0,0,.46), inset 0 2px 0 rgba(255,255,255,.7); }
        .btn[disabled]{ opacity:.6; cursor:not-allowed; }
        @media (max-width:900px){ .wrap{ margin-left:clamp(16px,5vw,28px); } }
      `}</style>
    </main>
  );
}
