// pages/paypal-test.js
import { useEffect, useRef, useState } from "react";

// ← SANDBOX REST Client ID (exactly as you sent)
const PP_CLIENT_ID =
  "AQMezLeXYnQ8ivvriPz1gjC0cwTfpQ6kkdomPdDYR3gzzG0yA7Xi_gW9od40rSaZc_lQrZIjRRRUXGn9";

export default function PayPalSandboxTest() {
  const [status, setStatus] = useState("idle");
  const btnRef = useRef(null);

  useEffect(() => {
    const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PP_CLIENT_ID
    )}&components=buttons&currency=USD&intent=capture`;

    document.querySelectorAll('script[src*="www.paypal.com/sdk/js"]').forEach(s => s.remove());
    if (window.paypal) delete window.paypal;

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      try {
        window.paypal
          .Buttons({
            style: { layout: "vertical", shape: "rect", label: "paypal" },
            createOrder: (_, actions) =>
              actions.order.create({
                purchase_units: [{ amount: { value: "1.00", currency_code: "USD" } }],
              }),
            onApprove: (_, actions) =>
              actions.order.capture().then((details) => {
                setStatus(`success: captured by ${details.payer?.name?.given_name || "payer"}`);
              }),
            onError: (err) => setStatus(`error: ${String(err)}`),
          })
          .render(btnRef.current);
        setStatus("ready");
      } catch (e) {
        setStatus(`error: ${String(e)}`);
      }
    };
    s.onerror = () => setStatus("error: could not load PayPal SDK (network/CSP/ad-blocker?)");
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "60px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>PayPal Sandbox Test</h1>
      <p>Click the button below to run a <strong>$1.00</strong> sandbox payment.</p>

      <p style={{
        padding: "12px 14px",
        borderRadius: 8,
        background: status.startsWith("error") ? "#fde2e0" : status === "success" ? "#dff7df" : "#eef2ff",
        color: "#222"
      }}>
        <strong>Status:</strong> {status}
      </p>

      <div ref={btnRef} style={{ marginTop: 16 }} />
      <p style={{ marginTop: 16, color: "#666" }}>
        This page is sandbox-only and does not affect your live Stripe checkout.
      </p>
    </main>
  );
}

// no-cache so changes show immediately
export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
