// pages/pay-with-paypal.js
import { useEffect, useRef, useState } from "react";
import Head from "next/head";

const PRICE = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD || "0.01");
const ENV = process.env.PAYPAL_ENV || "live"; // 'live' or 'sandbox'
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

export default function PayWithPayPal() {
  const [status, setStatus] = useState("loading");
  const btnRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) {
      setStatus("error: missing PayPal client id");
      return;
    }
    setStatus("loading");

    // Pick the right SDK domain
    const base = ENV === "sandbox" ? "https://www.sandbox.paypal.com" : "https://www.paypal.com";

    // Load the PayPal SDK
    const url = new URL(`${base}/sdk/js`);
    url.searchParams.set("client-id", CLIENT_ID);
    url.searchParams.set("currency", "USD");
    url.searchParams.set("intent", "capture");
    url.searchParams.set("components", "buttons"); // card fields may require additional product enablement
    // Optional funding hints; if disabled on your account they just won’t render
    url.searchParams.set("enable-funding", "paylater,venmo,card");

    const s = document.createElement("script");
    s.src = url.toString();
    s.async = true;
    s.onload = () => {
      try {
        if (!window.paypal) throw new Error("PayPal SDK not found");

        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },

            // Create the order (amount + statement descriptor)
            createOrder: (_, actions) => {
              const value = PRICE.toFixed(2);
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: { currency_code: "USD", value },
                    // This text can appear on card statements (22 chars max).
                    // PayPal Wallet shows your business name instead.
                    soft_descriptor: "GRANDLUCKY ENTRY",
                    description: "GrandLucky Travel – Contest Entry Fee",
                  },
                ],
                application_context: {
                  shipping_preference: "NO_SHIPPING",
                  brand_name: "GrandLucky Travel",
                  user_action: "PAY_NOW",
                },
              });
            },

            // Approve (capture on the client) then go to our thank-you page
            onApprove: async (data, actions) => {
              try {
                const details = await actions.order.capture();
                const orderId =
                  details?.id ||
                  data?.orderID ||
                  details?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                  "";
                setStatus("success");
                const value = PRICE.toFixed(2);
                window.location.href = `/thank-you?provider=paypal&order_id=${encodeURIComponent(
                  orderId
                )}&amount=${encodeURIComponent(value)}`;
              } catch (e) {
                console.error(e);
                setStatus("error: capture failed");
                alert("Payment captured failed. Please try again.");
              }
            },

            onError: (err) => {
              console.error(err);
              setStatus("error: could not load PayPal buttons");
            },

            onInit: () => setStatus("ready"),
          })
          .render(btnRef.current);
      } catch (e) {
        console.error(e);
        setStatus("error: could not initialize PayPal");
      }
    };
    s.onerror = () => setStatus("error: could not load PayPal SDK (network/CSP/ad-blocker)");
    document.head.appendChild(s);

    return () => {
      document.head.removeChild(s);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Pay with PayPal — GrandLucky Travel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main style={{ maxWidth: 760, margin: "60px auto", padding: "0 16px", fontFamily: "system-ui, Arial" }}>
        <h1>Pay with PayPal</h1>
        <p><b>Entry Fee:</b> ${PRICE.toFixed(2)}</p>
        <p><b>Status:</b> {status}</p>

        <div ref={btnRef} style={{ marginTop: 16 }} />

        <p style={{ marginTop: 24, color: "#666", fontSize: 14 }}>
          This page is for payments only. After successful payment, you’ll be redirected to our
          thank-you page.
        </p>
      </main>
    </>
  );
}
