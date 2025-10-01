import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function PaypalTest() {
  // ⬇️ Put your real SANDBOX Client ID here (from Developer Dashboard → Sandbox → Default Application)
  const CLIENT_ID = "EHSmD1M21rZ3Q7LbSu0IJcYGnUq9QVsN88h019r_DZxQmIR343y-C-XHL5WyeTOH4TDl6LMj7Z-flvBv";

  const btnRef = useRef(null);
  const [status, setStatus] = useState({ phase: "init" /* init|ok|error */, msg: "" });

  useEffect(() => {
    const problems = [];
    if (!CLIENT_ID || /PASTE_|example\.com/i.test(CLIENT_ID)) {
      problems.push("Missing or placeholder Client ID. Paste your SANDBOX Client ID into the file.");
    }

    // Abort early if obviously misconfigured
    if (problems.length) {
      setStatus({ phase: "error", msg: problems.join(" ") });
      return;
    }

    setStatus({ phase: "loading", msg: "Loading PayPal SDK…" });

    const id = "paypal-sdk";
    // Avoid double-inserting the script on hot reloads
    if (document.getElementById(id)) {
      maybeRender();
      return;
    }

    const s = document.createElement("script");
    s.id = id;
    s.src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CLIENT_ID)}` +
      `&currency=USD&intent=capture&components=buttons`;
    s.async = true;
    s.onload = () => {
      maybeRender();
    };
    s.onerror = () => {
      setStatus({
        phase: "error",
        msg: "Could not load PayPal SDK (network/ad-blocker/CSP). Disable blockers and reload.",
      });
    };
    document.body.appendChild(s);

    // Try to render after load
    function maybeRender() {
      if (!window.paypal) {
        setStatus({
          phase: "error",
          msg: "PayPal SDK loaded but window.paypal is unavailable. Check blockers and refresh.",
        });
        return;
      }
      try {
        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
            createOrder: (data, actions) =>
              actions.order.create({
                purchase_units: [{ amount: { value: "1.00" }, description: "Sandbox test order" }],
              }),
            onApprove: (data, actions) =>
              actions.order.capture().then((details) => {
                setStatus({
                  phase: "ok",
                  msg: `Approved! Payer: ${
                    details?.payer?.name?.given_name || "Sandbox"
                  } | OrderID: ${data.orderID}`,
                });
                console.log("CAPTURE RESULT", details);
                alert(`Approved! OrderID: ${data.orderID}`);
              }),
            onError: (err) => {
              console.error("PayPal error", err);
              setStatus({ phase: "error", msg: "PayPal error: " + String(err) });
              alert("PayPal error: " + String(err));
            },
          })
          .render(btnRef.current);
        setStatus({ phase: "ok", msg: "Button rendered." });
      } catch (e) {
        console.error(e);
        setStatus({ phase: "error", msg: "Failed to render PayPal button: " + String(e) });
      }
    }
  }, [CLIENT_ID]);

  return (
    <main style={{ padding: 32, maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <Head><title>PayPal Sandbox Test</title></Head>
      <h1>PayPal Sandbox Test</h1>
      <p>Click the button below to run a <b>$1.00</b> sandbox payment.</p>
      <div ref={btnRef} style={{ marginTop: 16 }} />

      {/* Status / Diagnostics */}
      <div style={{
        marginTop: 24,
        padding: 12,
        borderRadius: 8,
        background: status.phase === "error" ? "#ffe8e8" : "#f2f7ff",
        color: "#333",
        border: "1px solid " + (status.phase === "error" ? "#e88" : "#aaccff"),
        whiteSpace: "pre-wrap"
      }}>
        <b>Status:</b> {status.phase}
        {status.msg ? <div style={{ marginTop: 6 }}>{status.msg}</div> : null}
      </div>

      <p style={{ marginTop: 14, color: "#666" }}>
        This page is sandbox-only and does not affect your live Stripe checkout.
      </p>
    </main>
  );
}
