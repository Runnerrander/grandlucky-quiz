// pages/pay-with-paypal.js
import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function PayWithPayPal() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const entry = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99");
  const amount = entry.toFixed(2);

  const btnRef = useRef(null);
  const [status, setStatus] = useState("loading");

  // Render buttons after SDK loads
  const renderButtons = () => {
    try {
      if (!window.paypal || !btnRef.current) {
        setStatus("error: could not load PayPal SDK");
        return;
      }
      setStatus("ready");
      window.paypal
        .Buttons({
          style: { layout: "vertical", shape: "rect", label: "paypal", color: "gold" },
          intent: "capture",
          createOrder: (_data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
            }),
          onApprove: async (_data, actions) => {
            try {
              const details = await actions.order.capture();
              setStatus(`success: captured by ${details?.payer?.name?.given_name || "buyer"}`);
              // send the user onward (adjust if you want a different page)
              window.location.href = `/thank-you?provider=paypal&order_id=${details?.id || ""}&amount=${amount}`;
            } catch (e) {
              setStatus(`error: capture failed`);
            }
          },
          onError: (err) => {
            console.error(err);
            setStatus("error: button error");
          },
        })
        .render(btnRef.current);
    } catch (e) {
      console.error(e);
      setStatus("error: init failed");
    }
  };

  // If SDK was blocked by an extension, show a hint
  useEffect(() => {
    const t = setTimeout(() => {
      if (!window.paypal) setStatus("error: SDK blocked (network/CSP/ad-blocker?)");
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Head>
        <title>Pay with PayPal — GrandLucky Travel</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* PayPal SDK – LIVE */}
      {clientId ? (
        <Script
          id="paypal-sdk"
          strategy="afterInteractive"
          src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
            clientId
          )}&components=buttons&currency=USD&intent=capture&commit=true`}
          onLoad={renderButtons}
          onError={() => setStatus("error: could not load PayPal SDK")}
        />
      ) : null}

      <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Pay with PayPal</h1>
        <p style={{ margin: 0 }}>Entry Fee: ${amount}</p>
        <p style={{ marginTop: 10 }}>
          <strong>Status:</strong> {status}
        </p>

        <div ref={btnRef} style={{ marginTop: 20 }} />
        <p style={{ marginTop: 24, fontSize: 13, color: "#666" }}>
          Having trouble seeing the buttons? Temporarily disable ad-blockers / tracking
          protection for this page and refresh.
        </p>
      </main>
    </>
  );
}
