// /pages/checkout.js
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

const BG = "/checkout-designer.jpg"; // must exist in /public

export default function Checkout() {
  const [lang, setLang] = useState("hu"); // default HU
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  const price = useMemo(() => {
    const raw = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD ?? "9.99");
    return isFinite(raw) && raw > 0 ? raw.toFixed(2) : "9.99";
  }, []);

  const t = useMemo(
    () =>
      lang === "hu"
        ? {
            title: "Biztonságos fizetés",
            important: "Fontos — Kérjük, olvasd el!",
            bullets: [
              "A sikeres fizetés után a Felhasználónevet és a Jelszót a rendszer automatikusan létrehozza. A 2. fordulóban (élő verseny) a hitelesítéshez szükséged lesz a Felhasználónév + Jelszó kombinációra.",
              "El tudod menteni vagy ki tudod nyomtatni a Felhasználónevedet és a Jelszavadat. Az első fordulóban a felhasználónév automatikusan bekerül a kvízbe, és a rendszer eltárolja a kvíz befejezésének idejével együtt.",
              "Minden nevezés új Felhasználónevet és Jelszót hoz létre.",
              "Az első fordulóban (online kvíz), ha valaki korábban pontosan ugyanannyi idő alatt teljesítette a kvízt, mint a versenyző, a versenyző két lehetőséget kap. 1. lehetőség: a befejezési időt +5 másodperccel növeltenyújtja be; vagy azonnal új kvízt indíthat további nevezési díj fizetése nélkül.",
              "Kérjük, a Felhasználónevet és a Jelszót tartsd biztonságos helyen.",
            ],
            note: "A fizetés a PayPal rendszerén keresztül történik.",
            accept:
              "Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket",
            back: "VISSZA",
            pay: "Fizetek",
            paying: "Folyamatban…",
            alertFail: "Hoppá! Nem sikerült elindítani a PayPal fizetést.",
            priceLabel: "Ár",
          }
        : {
            title: "Secure Payment",
            important: "Important — Please read!",
            bullets: [
              "After a successful payment the system automatically generates your Username and Password. For Round 2 (live), you’ll need the Username + Password to verify.",
              "You can Save or Print your Username and Password. In Round 1 your username automatically goes into the quiz and the system stores it together with your finish time.",
              "Each registration creates a new Username and Password.",
              "In Round 1 (online quiz), if someone earlier finished in exactly the same time, you have two options: (1) submit your time with +5 seconds; or (2) immediately retake a new quiz without extra fee.",
              "Please keep your Username and Password in a safe place.",
            ],
            note: "Payment is processed by PayPal.",
            accept: "I have read and accept the Rules and the Terms of Use",
            back: "BACK",
            pay: "Pay",
            paying: "Processing…",
            alertFail: "Oops! Couldn’t start the PayPal payment.",
            priceLabel: "Price",
          },
    [lang]
  );

  // Create PayPal order -> redirect to PayPal (LIVE)
  const onPay = async (e) => {
    e.preventDefault();
    if (!accepted || busy) return;

    try {
      setBusy(true);

      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: lang }),
      });

      if (!res.ok) throw new Error(`create failed: ${res.status}`);

      const json = await res.json();
      const approveURL = json?.approveURL;
      if (!approveURL) throw new Error("no approveURL");

      window.location.href = approveURL; // hard redirect to PayPal
    } catch (err) {
      console.error("[checkout] start paypal error:", err);
      alert(t.alertFail);
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout — GrandLuckyTravel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
          {/* Language toggle pill (kept simple to avoid style drift) */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                background: "#000",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
              aria-label="Toggle language"
            >
              {lang === "hu" ? "ANGOL" : "HUNGARIAN"}
            </button>
          </div>

          <div
            style={{
              background: "rgba(250, 175, 59, 0.9)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px" }}>
              {t.title}
            </h1>
            <p style={{ fontWeight: 700, margin: "0 0 12px" }}>{t.important}</p>

            <ul style={{ paddingLeft: 20, margin: "0 0 14px" }}>
              {t.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  {b}
                </li>
              ))}
            </ul>

            <p style={{ opacity: 0.9, fontSize: 14, marginBottom: 16 }}>
              {t.note} ({t.priceLabel}: ${price} USD)
            </p>

            <label style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>{t.accept}</span>
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href="/vivko"
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "#fff",
                  color: "#000",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {t.back}
              </Link>

              <button
                onClick={onPay}
                disabled={!accepted || busy}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: !accepted || busy ? "#9ca3af" : "#000",
                  color: "#fff",
                  border: "none",
                  cursor: !accepted || busy ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
              >
                {busy ? t.paying : t.pay}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
