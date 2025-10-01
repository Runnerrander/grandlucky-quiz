// pages/paypal-test.js
import { useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";

export default function PayPalSandboxTest() {
  const [status, setStatus] = useState("loading"); // loading | ready | success | error

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tryRender = () => {
      if (!window.paypal) return setStatus("error");
      try {
        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
            createOrder: (_data, actions) =>
              actions.order.create({
                purchase_units: [{ amount: { value: "1.00" } }],
              }),
            onApprove: (_data, actions) =>
              actions.order.capture().then(() => setStatus("success")),
            onError: () => setStatus("error"),
          })
          .render("#pp-buttons");
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };

    const t = setTimeout(tryRender, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Head>
        <title>PayPal Sandbox Test</title>
        {/* Page-local CSP that whitelists PayPal assets */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com;
            connect-src 'self' https://*.paypal.com https://*.paypalobjects.com https://api-m.sandbox.paypal.com;
            img-src 'self' data: https://*.paypal.com https://*.paypalobjects.com;
            style-src 'self' 'unsafe-inline';
            frame-src https://www.paypal.com https://www.sandbox.paypal.com;
          "
        />
      </Head>

      {/* PayPal JS SDK (SANDBOX) */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=EHSmD1M21rZ3Q7LbSu0IJcYGnUq9QVsN88h019r_DZxQmIR343y-C-XHL5WyeTOH4TDl6LMj7Z-flvBv&currency=USD&components=buttons`}
        strategy="afterInteractive"
        onError={() => setStatus("error")}
      />

      <main style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>PayPal Sandbox Test</h1>
        <p>Click the button below to run a <strong>$1.00</strong> sandbox payment.</p>

        <div style={{ margin: "16px 0" }}>
          {status === "loading" && (
            <div style={{ padding: 12, background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 6 }}>
              Status: loading PayPal SDK…
            </div>
          )}
          {status === "ready" && (
            <div style={{ padding: 12, background: "#e6fffb", border: "1px solid #87e8de", borderRadius: 6 }}>
              Status: ready — sandbox buttons rendered below.
            </div>
          )}
          {status === "success" && (
            <div style={{ padding: 12, background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 6 }}>
              Status: success — payment captured in sandbox!
            </div>
          )}
          {status === "error" && (
            <div style={{ padding: 12, background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 6 }}>
              <strong>Status: error</strong>
              <div>Could not load PayPal SDK (network/ad-blocker/CSP). Disable blockers and reload.</div>
            </div>
          )}
        </div>

        <div id="pp-buttons" />
        <p style={{ marginTop: 24, color: "#666" }}>
          This page is sandbox-only and does not affect your live Stripe checkout.
        </p>
      </main>
    </>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return { props: {} };
}
