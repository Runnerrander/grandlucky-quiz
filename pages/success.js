// pages/success.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    // PayPal returns ?token=... (sometimes orderID)
    const token = (router.query?.token || router.query?.orderID || "").toString();

    if (!token) {
      setLoading(false);
      setErr(
        "Hiányzó PayPal token. Kérjük ne nyisd meg közvetlenül ezt az oldalt. / Missing PayPal token."
      );
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

        if (!res.ok || !data?.username || !data?.password) {
          console.error("capture error:", data);
          setErr("A fizetés feldolgozása sikertelen volt. / Payment capture failed.");
        } else {
          setCreds({ username: data.username, password: data.password });
        }
      } catch (e) {
        console.error(e);
        setErr("Váratlan hiba történt a fizetés feldolgozásakor. / Unexpected error.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, router.query?.token, router.query?.orderID]);

  return (
    <>
      <Head>
        <title>Sikeres fizetés / Success — GrandLuckyTravel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main style={{ maxWidth: 760, margin: "40px auto", padding: 24 }}>
        <h1>Sikeres fizetés / Payment successful</h1>

        {loading && <p>Ellenőrzés… / Verifying…</p>}

        {!loading && err && (
          <div style={{ color: "crimson", marginTop: 12 }}>
            <p>{err}</p>
            <p>
              Támogatás / Support:{" "}
              <a href="mailto:support@grandluckytravel.com">support@grandluckytravel.com</a>
            </p>
          </div>
        )}

        {!loading && creds && (
          <div style={{ marginTop: 16 }}>
            <h2>Felhasználói adatok / Your Credentials</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                gap: 10,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div><b>Felhasználónév</b> / Username</div>
              <div style={{ fontFamily: "monospace" }}>{creds.username}</div>
              <div><b>Jelszó</b> / Password</div>
              <div style={{ fontFamily: "monospace" }}>{creds.password}</div>
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "/trivia")}
              style={{
                marginTop: 16,
                padding: "10px 18px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Kvíz indítása / Start Quiz
            </button>

            <p style={{ marginTop: 10, fontSize: 14 }}>
              Kérjük, jegyezd fel a fenti adatokat. / Please note down your credentials.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
