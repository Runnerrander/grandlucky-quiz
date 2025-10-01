// pages/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function Copy({ label, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontFamily: "monospace", fontSize: 18 }}>
        <strong>{label}:</strong> {value}
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          });
        }}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: copied ? "#e6ffed" : "#fff",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState(null);
  const [error, setError] = useState("");

  // Show cached creds if user reloads
  useEffect(() => {
    if (!router.isReady) return;

    const token =
      (router.query?.token?.toString() || "").trim() ||
      (router.query?.orderID?.toString() || "").trim() ||
      (router.query?.orderId?.toString() || "").trim();

    async function run() {
      // If we already have cached creds (from a prior successful call), show them first
      const cached = (() => {
        try {
          const raw = localStorage.getItem("gl_creds");
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();
      if (!token && cached?.username && cached?.password) {
        setCreds(cached);
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Payment token missing. If you refreshed this page, go back to the checkout.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          setError(
            data?.message ||
              "Payment verification failed. Please contact support@grandluckytravel.com."
          );
          setLoading(false);
          return;
        }

        // creds: { username, password }
        if (data?.creds?.username && data?.creds?.password) {
          setCreds(data.creds);
          try {
            localStorage.setItem("gl_creds", JSON.stringify(data.creds));
          } catch {}
        } else {
          // Safety: success but no creds (shouldn't happen with current API)
          setError("Payment completed, but credentials are unavailable. Please contact support.");
        }
      } catch (e) {
        setError("Unexpected error. Please contact support@grandluckytravel.com.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router.isReady, router.query]);

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "40px auto",
        padding: "24px 20px",
        lineHeight: 1.5,
        color: "#222",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Sikeres fizetés / Payment successful</h1>

      {loading && <p>Processing your payment…</p>}

      {!loading && error && (
        <div style={{ color: "#b00020", background: "#fde7eb", padding: 12, borderRadius: 8 }}>
          <p style={{ margin: 0 }}>{error}</p>
          <p style={{ margin: "6px 0 0" }}>
            Support: <a href="mailto:support@grandluckytravel.com">support@grandluckytravel.com</a>
          </p>
        </div>
      )}

      {!loading && creds && (
        <div
          style={{
            background: "#eef9f0",
            border: "1px solid #cde9d6",
            padding: 16,
            borderRadius: 10,
          }}
        >
          <p style={{ marginTop: 0, color: "#136c3b", fontWeight: 600 }}>
            Payment captured & row stored. Your quiz login:
          </p>

          <Copy label="Username" value={creds.username} />
          <Copy label="Password" value={creds.password} />

          <p style={{ marginTop: 14, fontSize: 14 }}>
            Please note these down. You’ll need them to start the quiz.
          </p>

          <button
            onClick={() => (window.location.href = "/trivia")}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Start Quiz
          </button>
        </div>
      )}
    </main>
  );
}
