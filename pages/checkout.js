// /pages/checkout.js
import Head from "next/head";
import Link from "next/link";
import { useState, useMemo } from "react";

const BG = "/checkout-designer.jpg"; // must exist in /public

export default function Checkout() {
  const [lang, setLang] = useState("hu");            // default HU
  const [accepted, setAccepted] = useState(false);   // accept rules
  const [busy, setBusy] = useState(false);

  const price = useMemo(() => {
    const p = Number(process.env.NEXT_PUBLIC_ENTRY_PRICE_USD ?? "9.99");
    return isFinite(p) && p > 0 ? p.toFixed(2) : "9.99";
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
            payingWith: "A fizetés a PayPal rendszerén keresztül történik.",
            accept: "Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket",
            back: "VISSZA",
            pay: "Fizetek",
            paying: "Folyamatban…",
            alertFail: "Hoppá! Nem sikerült elindítani a PayPal fizetést.",
          }
        : {
            title: "Secure Payment",
            important: "Important — Please read!",
            bullets: [
              "After a successful payment the system will automatically create your Username and Password. For Round 2 (live event) you’ll need the Username + Password to verify.",
              "You can Save or Print your Username and Password. In Round 1 your username automatically goes into the quiz and the system stores it together with your finish time.",
              "Each registration creates a new Username and Password.",
              "In Round 1 (online quiz), if someone earlier finished in exactly the same time, you will have two options: (1) submit your time with +5 seconds; or (2) immediately retake a new quiz without an extra fee.",
              "Please keep your Username and Password in a safe place.",
            ],
            payingWith: "Payment is processed by PayPal.",
            accept: "I have read and accept the Rules and the Terms of Use",
            back: "BACK",
            pay: "Pay",
            paying: "Processing…",
            alertFail: "Oops! Couldn’t start the PayPal payment.",
          },
    [lang]
  );

  // Create order -> redirect to PayPal
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

      if (!res.ok) {
        throw new Error(`create failed: ${res.status}`);
      }

      const json = await res.json();
      const url = json?.approveURL;
      if (!url) throw new Error("no approveURL");

      // hard redirect to PayPal
      window.location.href = url;
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
        className="flex items-center justify-center px-4 py-8"
      >
        <div className="max-w-3xl w-full bg-[#f2a93b]/90 rounded-2xl p-6 shadow-xl relative">
          {/* Language pill */}
          <button
            onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
            className="absolute right-4 top-4 rounded-full px-4 py-2 bg-black text-white text-sm shadow-md"
            aria-label="Toggle language"
          >
            {lang === "hu" ? "ANGOL" : "HUNGARIAN"}
          </button>

          <h1 className="text-4xl font-extrabold mb-2">{t.title}</h1>
          <p className="font-semibold mb-3">{t.important}</p>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            {t.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <p className="text-sm opacity-90 mb-4">
            {t.payingWith} ({lang === "hu" ? "Ár" : "Price"}: ${price} USD)
          </p>

          <label className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>{t.accept}</span>
          </label>

          <div className="flex items-center gap-3">
            <Link
              href="/vivko"
              className="px-6 py-3 rounded-full bg-white/90 shadow hover:shadow-lg transition"
            >
              {t.back}
            </Link>

            <button
              onClick={onPay}
              disabled={!accepted || busy}
              className={`px-6 py-3 rounded-full shadow transition ${
                !accepted || busy
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:shadow-lg"
              }`}
            >
              {busy ? t.paying : t.pay}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
