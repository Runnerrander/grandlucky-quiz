import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function PaypalTest() {
  const CLIENT_ID = "<EHSmD1M21rZ3Q7LbSu0IJcYGnUq9QVsN88h019r_DZxQmIR343y-C-XHL5WyeTOH4TDl6LMj7Z-flvBv>";
  const btnRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || loaded) return;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      CLIENT_ID
    )}&currency=USD&intent=capture&components=buttons`;
    s.onload = () => {
      if (!window.paypal) return;
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
          createOrder: (data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: "1.00" }, description: "Sandbox test order" }],
            }),
          onApprove: (data, actions) =>
            actions.order.capture().then((details) => {
              alert(
                `Approved! Payer: ${details?.payer?.name?.given_name || "Sandbox"}\nOrderID: ${data.orderID}`
              );
              console.log("CAPTURE RESULT", details);
            }),
          onError: (err) => {
            console.error("PayPal error", err);
            alert("PayPal error: " + String(err));
          },
        })
        .render(btnRef.current);
      setLoaded(true);
    };
    document.body.appendChild(s);
  }, [CLIENT_ID, loaded]);

  return (
    <main style={{ padding: 32, maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <Head><title>PayPal Sandbox Test</title></Head>
      <h1>PayPal Sandbox Test</h1>
      <p>Click the button below to run a <b>$1.00</b> sandbox payment.</p>
      <div ref={btnRef} />
      <p style={{ marginTop: 16, color: "#666" }}>
        This page is sandbox-only and does not affect your live Stripe checkout.
      </p>
    </main>
  );
}
