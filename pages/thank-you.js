// pages/thank-you.js
import { useRouter } from "next/router";

export default function ThankYou() {
  const { query } = useRouter();
  const { order, amount, method } = query;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>Thank you!</h1>
      <p>Your payment was received.</p>
      <ul>
        <li><strong>Method:</strong> {method || "paypal"}</li>
        <li><strong>Amount:</strong> ${amount || "0.00"}</li>
        <li><strong>Order ID:</strong> {order || "—"}</li>
      </ul>
      <a href="/" style={{ display: "inline-block", marginTop: 12 }}>
        Back to Home
      </a>
    </main>
  );
}
