// pages/thank-you.js
import Head from "next/head";
import Link from "next/link";

/**
 * Server-side: if provider=paypal & order_id exists, capture the order,
 * then generate unique credentials and insert into Supabase (quiz_results).
 * Returns props for rendering the "print/save credentials" experience.
 */
export async function getServerSideProps(ctx) {
  const { query, req } = ctx;
  const provider = (query.provider || "").toString();
  const orderId = (query.order_id || "").toString();
  const amount = (query.amount || "").toString();

  // Always pass through defaults so the page renders even if nothing to do
  const baseProps = {
    provider,
    orderId,
    amount,
    username: null,
    password: null,
    captured: false,
    message: null,
  };

  try {
    // Only do PayPal work when explicitly requested
    if (provider !== "paypal" || !orderId) {
      return { props: baseProps };
    }

    // ---- Capture PayPal order (server-side) ----
    const env = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
    const PAYPAL_API = env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { props: { ...baseProps, message: "Missing PayPal credentials on server." } };
    }

    // Basic auth for PayPal REST
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Capture the order
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/json",
      },
    });

    const captureJson = await captureRes.json();

    if (!captureRes.ok) {
      return {
        props: {
          ...baseProps,
          message: `PayPal capture failed: ${captureJson?.message || captureRes.statusText}`,
        },
      };
    }

    const status = captureJson?.status || "";
    if (status !== "COMPLETED") {
      return {
        props: {
          ...baseProps,
          message: `PayPal status not completed (${status}).`,
        },
      };
    }

    // ---- Generate unique username/password & insert into Supabase ----
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return {
        props: {
          ...baseProps,
          captured: true,
          message: "Missing Supabase server credentials.",
        },
      };
    }

    // Simple helpers to match your previous format (GL-XXXX / PASS-XXXX)
    const rand4 = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    const makeCreds = () => ({
      username: `GL-${rand4()}`,
      password: `PASS-${rand4()}`,
    });

    // Try a few times in case UNIQUE(username) collides
    let username = null;
    let password = null;
    const MAX_TRIES = 6;
    let inserted = false;
    let lastError = null;

    for (let i = 0; i < MAX_TRIES; i++) {
      const creds = makeCreds();
      username = creds.username;
      password = creds.password;

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_results`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          created_at: new Date().toISOString(),
          status: "active",
          username,
          password,
          session_id: orderId,     // store PayPal order id in session_id column
          time_ms: null,
          completed_at: null,
          correct: null,
          round_id: null,
        }),
      });

      if (insertRes.ok) {
        inserted = true;
        break;
      } else {
        const text = await insertRes.text();
        lastError = text;
        // 409 from UNIQUE(username) – retry with another code
        if (!text.includes("duplicate") && !text.includes("unique")) {
          break; // other error — stop trying
        }
      }
    }

    if (!inserted) {
      return {
        props: {
          ...baseProps,
          captured: true,
          message: `Could not save credentials. ${lastError || ""}`.trim(),
        },
      };
    }

    return {
      props: {
        ...baseProps,
        captured: true,
        username,
        password,
        message: null,
      },
    };
  } catch (e) {
    return {
      props: { ...baseProps, message: `Server error: ${String(e)}` },
    };
  }
}

export default function ThankYouPage(props) {
  const {
    provider,
    orderId,
    amount,
    captured,
    username,
    password,
    message,
  } = props;

  const hasCreds = Boolean(username && password);

  const copy = (txt) => {
    try {
      navigator.clipboard.writeText(txt);
      alert("Copied!");
    } catch {
      // no-op
    }
  };

  const printPage = () => {
    window.print();
  };

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      <Head>
        <title>Thank you — GrandLucky Travel</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Thank you!</h1>
      <p>Your payment was received.</p>

      <ul style={{ lineHeight: 1.6 }}>
        <li><strong>Method:</strong> {provider || "—"}</li>
        <li><strong>Amount:</strong> {amount ? `$${Number(amount).toFixed(2)}` : "—"}</li>
        <li><strong>Order ID:</strong> {orderId || "—"}</li>
      </ul>

      {message && (
        <p style={{ color: "#b00", marginTop: 10 }}>
          {message}
        </p>
      )}

      {/* Credentials section (shown when we captured & inserted) */}
      {captured && hasCreds && (
        <section style={{ marginTop: 28, padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#fafafa" }}>
          <h2 style={{ marginTop: 0 }}>Your quiz login</h2>
          <p style={{ margin: "8px 0 16px" }}>
            Save or print these now. You’ll need them to enter the contest.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", maxWidth: 520 }}>
            <div>
              <div><strong>Username:</strong> {username}</div>
              <div><strong>Password:</strong> {password}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => copy(`${username} ${password}`)} style={btnStyle}>Copy</button>
              <button onClick={printPage} style={btnStyle}>Print</button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Link href={`/user-agreement?u=${encodeURIComponent(username)}`} legacyBehavior>
              <a style={ctaStyle}>Start Quiz</a>
            </Link>
          </div>
        </section>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/" legacyBehavior>
          <a>Back to Home</a>
        </Link>
      </div>
    </main>
  );
}

const btnStyle = {
  appearance: "none",
  border: "1px solid #ccc",
  background: "#fff",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const ctaStyle = {
  display: "inline-block",
  padding: "12px 18px",
  background: "#FAAF3B",
  border: "2px solid #E49B28",
  color: "#222",
  fontWeight: 800,
  borderRadius: 999,
  textDecoration: "none",
  textTransform: "uppercase",
};
