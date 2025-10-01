// pages/checkout.js
import { useState } from "react";
import Head from "next/head";

export default function CheckoutPage() {
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(true); // default checked like your page
  const [error, setError] = useState("");

  async function payWithPayPal() {
    try {
      setError("");
      if (!agree) {
        alert("Kérjük, fogadd el a feltételeket. / Please accept the terms.");
        return;
      }
      setBusy(true);

      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok || !data?.approveURL) {
        console.error("create error:", data);
        alert("Sajnáljuk, nem sikerült elindítani a PayPal fizetést.");
        setBusy(false);
        return;
      }

      // Redirect user to PayPal
      window.location.href = data.approveURL;
    } catch (e) {
      console.error(e);
      alert("Sajnáljuk, nem sikerült elindítani a PayPal fizetést.");
      setError(String(e));
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Biztonságos fizetés — GrandLuckyTravel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main style={{ maxWidth: 760, margin: "40px auto", padding: 24, background: "#ffa94022", borderRadius: 12 }}>
        <h1 style={{ marginBottom: 12 }}>Biztonságos fizetés</h1>
        <p><b>Fontos — Kérjük, olvasd el!</b></p>
        <ul>
          <li>
            A sikeres fizetés után a <b>Felhasználónevet</b> és a <b>Jelszót</b> a rendszer
            automatikusan létrehozza, majd a <b>köszönő oldalon</b> megjelenítjük.
          </li>
          <li>
            The <b>Username</b> and <b>Password</b> are created automatically after payment and will
            be displayed on the <b>thank-you</b> page.
          </li>
          <li>A fizetés a PayPal rendszerén keresztül történik.</li>
        </ul>

        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket. / I’ve read and
            accept the Rules & Terms.
          </span>
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            disabled={busy}
            style={{ padding: "10px 18px", borderRadius: 8 }}
          >
            VISSZA
          </button>

          <button
            type="button"
            onClick={payWithPayPal}
            disabled={busy || !agree}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontWeight: 600,
              opacity: busy || !agree ? 0.6 : 1,
            }}
          >
            {busy ? "Folyamatban…" : "Fizetek"}
          </button>
        </div>

        {error ? <p style={{ color: "crimson", marginTop: 12 }}>{error}</p> : null}
      </main>
    </>
  );
}
