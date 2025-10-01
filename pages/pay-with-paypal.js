// pages/pay-with-paypal.js
import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const PRICE = process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "9.99";
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; // LIVE client id

export default function PayWithPayPal() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("ready");

  useEffect(() => {
    if (!window.paypal || !containerRef.current) return;

    try {
      window.paypal.Buttons({
        style: { layout: "vertical", shape: "rect", color: "gold" },
        createOrder: (_, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: { currency_code: "USD", value: PRICE },
                description: "GrandLucky Travel Trivia Entry",
              },
            ],
          });
        },
        onApprove: async (_, actions) => {
          setStatus("capturing…");
          const details = await actions.order.capture();
          const orderId = details?.id || "unknown";
          setStatus("success");
          // simple handoff to a confirmation page
          window.location.href = `/thank-you?method=paypal&order=${encodeURIComponent(
            orderId
          )}&amount=${encodeURIComponent(PRICE)}`;
        },
        onError: (err) => {
          console.error(err);
          setStatus("error");
          alert("PayPal error. Please try again.");
        },
        onCancel: () => setStatus("canceled"),
      }).render(containerRef.current);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <Head>
        <title>Pay with PayPal — GrandLucky Travel</title>
      </Head>

      {/* Load the LIVE PayPal SDK */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          CLIENT_ID || ""
        )}&currency=USD&intent=capture&components=buttons`}
        strategy="afterInteractive"
        onError={() => setStatus("error")}
      />

      <h1>Pay with PayPal</h1>
      <p>
        Entry Fee: <strong>${PRICE}</strong>
      </p>
      <div ref={containerRef} />
      <p style={{ marginTop: 16 }}>Status: <strong>{status}</strong></p>
      {!CLIENT_ID && (
        <p style={{ color: "crimson" }}>
          Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID. Add it in Vercel envs.
        </p>
      )}
    </main>
  );
}
