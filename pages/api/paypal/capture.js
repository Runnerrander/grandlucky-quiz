// pages/api/capture.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Use the service key so we can write regardless of RLS
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// tiny helper to make 4-char codes like ABCD / 7G3C
function code4() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function makeUniqueCredentials(maxTries = 6) {
  for (let i = 0; i < maxTries; i++) {
    const username = `GL-${code4()}`;
    const password = `PASS-${code4()}`;

    // try the insert; rely on DB unique(username) to protect us
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([
        {
          status: "active",
          username,
          password,
          // store the processor/order on the row so support can find it later
          session_id: null,               // keep schema compatible
          provider: "paypal",             // new: who took the payment
          order_id: null,                 // if you have this column, set it below
          time_ms: null,
          correct: null,
          round_id: null,
        },
      ])
      .select("id, username, password")
      .single();

    // unique violation → try again with a new code
    if (error && error.code === "23505") continue;
    if (error) return { error };

    return { data };
  }
  return { error: { message: "Could not generate unique username, please retry." } };
}

export default async function handler(req, res) {
  try {
    // Accept GET (from thank-you page)
    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    // From thank-you page query string
    const provider = (req.query.provider || "paypal").toString();
    const order_id = (req.query.order_id || "").toString();
    const amount = (req.query.amount || "").toString();

    // Generate & insert credentials without completed_at
    const result = await makeUniqueCredentials();
    if (result.error) {
      res.status(500).json({ ok: false, error: result.error.message || "insert failed" });
      return;
    }

    const creds = result.data;

    // Optionally annotate the row with processor/order_id after the insert
    // (avoids any unique retry complexity above)
    await supabase
      .from("quiz_results")
      .update({
        // keep completed_at out of this insert/update
        // only mark completed_at when the user actually completes the quiz
        provider,
        // if your table has this column; if not, comment out
        session_id: order_id || null,
      })
      .eq("id", creds.id);

    res.status(200).json({
      ok: true,
      username: creds.username,
      password: creds.password,
      provider,
      order_id,
      amount,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "unknown error" });
  }
}
