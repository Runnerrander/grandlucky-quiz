// pages/api/saveRegistration.js  (TEMP STUB)
export default async function handler(req, res) {
  const session_id =
    (req.query.session_id || (req.body && req.body.session_id) || "").toString();
  const tail = session_id ? session_id.slice(-4).toUpperCase() : "TEST";
  return res.status(200).json({
    ok: true,
    username: `GL-${tail}`,
    password: `PASS-${tail}`,
  });
}
