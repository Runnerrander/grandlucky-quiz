import { useEffect } from "react";

export default function PostPayment() {
  useEffect(() => {
    const handleCheckout = async () => {
      try {
        // POST request to your checkout API
        const res = await fetch("/api/checkout", { method: "POST" });
        const data = await res.json();

        if (res.ok && data.url) {
          // ✅ Redirect to the Stripe Checkout URL
          window.location.href = data.url;
        } else {
          console.error("Checkout session not created:", data);
          alert("Failed to create checkout session.");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        alert("Something went wrong during checkout.");
      }
    };

    // Run checkout on page load
    handleCheckout();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Redirecting to Checkout...</h1>
      <p>Please wait while we prepare your registration checkout.</p>
    </div>
  );
}
