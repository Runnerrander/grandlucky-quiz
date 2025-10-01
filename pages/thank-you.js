// pages/thank-you.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const { query } = router;

  // From the redirect querystring:
  //   ?provider=paypal&funding=card&order_id=...&amount=9.99
  const provider = (query.provider || "").toString();      // e.g., "paypal"
  const funding  = (query.funding  || "").toString();      // e.g., "card" | "paypal" | ""
  const amountStr = (query.amount  || "").toString();      // e.g., "9.99"
  const orderId = (query.order_id || query.orderId || "—").toString();

  const method =
    funding === "card"
      ? "card (via PayPal)"
      : provider || "—";

  // Format amount like $9.99 (or "—" if missing)
  let amountDisplay = "—";
  const amt = Number(amountStr);
  if (!Number.isNaN(amt) && amt > 0) {
    amountDisplay = `$${amt.toFixed(2)}`;
  }

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      <Head>
        <title>Thank you — GrandLucky Travel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1 style={{ fontWeight: 800, marginBottom: 18 }}>Thank you!</h1>
      <p style={{ marginBottom: 18 }}>Your payment was received.</p>

      <ul style={{ lineHeight: 1.6 }}>
        <li><strong>Method:</strong> {method}</li>
        <li><strong>Amount:</strong> {amountDisplay}</li>
        <li><strong>Order ID:</strong> {orderId}</li>
      </ul>

      <p style={{ marginTop: 24 }}>
        <Link href="/" legacyBehavior>
          <a>Back to Home</a>
        </Link>
      </p>
    </main>
  );
}
