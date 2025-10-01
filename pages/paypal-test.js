// pages/paypal-test.js
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

// Your PayPal **Sandbox** REST App Client ID
const CLIENT_ID =
  "EA6k8k_2UJ9ra-ss2864KZ2nD-1SugjOT8f1FGVCBB6EqAH4QJSI62HeS8NeF-j34s6Ort3dFtxQIRFd";

export default function PayPalTest() {
  const [status, setStatus] = useState("loading");
  const btnRef = useRef(null);

  useEffect(() => {
    const url = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      CLIENT_ID
    )}&currency=USD&components=buttons&intent=capture`;

    const script = document.createElement("script");
    script.src = url;
    script.async = true;

    script.onload = () => {
      setStatus("ready");
      try {
        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
            },
            // $1.00 sandbox test order
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: "Sandbox test payment",
                    amount: { value: "1.00", currency_code: "USD" },
                  },
                ],
              });
            },
            onApprove: async (data, actions) => {
              const details = await actions.order.capture();
              setStatus(`success: ${details.id}`);
              console.log("Capture result", details);
            },
            onError: (err) => {
              console.error("PayPal error", err);
              setStatus(`error: ${String(err?.message || err)}`);
            },
          })
          .render(btnRef.current);
      } catch (e) {
        console.error(e);
        setStatus(`error: ${String(e?.message || e)}`);
      }
    };

    script.onerror = () =>
      setStatus("error: could not load PayPal SDK (network/CSP/ad-blocker?)");

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <Head>
        <title>PayPal Sandbox Test</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1>PayPal Sandbox Test</h1>
      <p>
        Click the button below to run a <strong>$1.00</strong> sandbox payment.
      </p>

      <p
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: status.startsWith("error") ? "#fde2e1" : "#eef5ff",
        }}
      >
        <strong>Status:</strong> {status}
      </p>

      <div ref={btnRef} id="paypal-buttons" />

      <p style={{ marginTop: 12, color: "#666" }}>
        This page is sandbox-only and does not affect your live Stripe checkout.
      </p>
    </main>
  );
}

// Avoid caching so changes show immediately
export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
