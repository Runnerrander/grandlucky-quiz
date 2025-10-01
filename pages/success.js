// pages/success.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState(null);
  const [err, setErr] = useState(null);

  // Safely extract token from query (?token= or ?orderID=)
  const token =
    (router.query?.token || router.query?.orderID || "").toString();

  useEffect(() => {
    if (!router.isReady) return;

    if (!token) {
      setLoading(false);
      setErr({
        message: "Hiányzó PayPal token. / Missing PayPal token.",
        details: { query: router.query },
      });
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok && data?.ok && data?.username && data?.password) {
          setCreds({ username: data.username, password: data.password });
          setErr(null);
        } else {
          setErr({
            message:
              data?.message ||
              "A fizetés feldolgozása sikertelen volt. / Payment capture failed.",
            details: data || {},
          });
          setCreds(null);
        }
      } catch (e) {
        setErr({
          message:
            "Váratlan hiba történt. / Unexpected error while finalizing payment.",
          details: String(e),
        });
        setCreds(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, token]);

  return (
    <>
      <Head>
        <title>Sikeres fizetés / Success — GrandLuckyTravel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>
          Sikeres fizetés / Payment successful
        </h1>

        {loading && <p>Feldolgozás… / Processing…</p>}

        {!loading && creds && (
          <section>
            <p style={{ marginBottom: 12 }}>
              A fizetés sikeres volt. Az alábbi adatokkal tudsz belépni:
              <br />
              Payment completed. Use these credentials to start the quiz:
            </p>

            <div style={{ lineHeight: 1.8, marginBottom: 16 }}>
              <div>
                <b>Felhasználónév / Username:</b>{" "}
                <span style={{ fontFamily: "monospace" }}>{creds.username}</span>
              </div>
              <div>
                <b>Jelszó / Password:</b>{" "}
                <span style={{ fontFamily: "monospace" }}>{creds.password}</span>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/trivia")}
              style={{
                background: "#111",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Kvíz indítása / Start Quiz
            </button>

            <p style={{ marginTop: 14, fontSize: 13 }}>
              Kérjük, jegyezd fel a fenti adatokat. / Please note down your
              credentials.
            </p>
          </section>
        )}

        {!loading && !creds && (
          <section>
            <p style={{ color: "#b00020", marginBottom: 8 }}>
              A fizetés feldolgozása sikertelen volt. / Payment capture failed.
            </p>
            <p style={{ marginBottom: 8 }}>
              Támogatás / Support:{" "}
              <a href="mailto:support@grandluckytravel.com">
                support@grandluckytravel.com
              </a>
            </p>

            {/* Diagnostic block to see exactly why it failed (safe to leave; no secrets) */}
            {err?.message && (
              <p style={{ marginTop: 10 }}>
                <b>Részletek / Details:</b> {err.message}
              </p>
            )}
            {err?.details && (
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: "#f7f7f7",
                  border: "1px solid #eee",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(err.details, null, 2)}
              </pre>
            )}
          </section>
        )}
      </main>
    </>
  );
}
